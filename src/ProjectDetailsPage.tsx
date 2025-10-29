import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

// Create separate clients for authenticated and public access
const authenticatedClient = generateClient<Schema>();
const publicClient = generateClient<Schema>({
  authMode: 'apiKey'
});

const ProjectDetailsPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    loadProject();
  }, [isAuthenticated]);

  // Check join status when both authentication and project are available
  useEffect(() => {
    if (isAuthenticated && project) {
      checkJoinStatus(project.id);
    }
  }, [isAuthenticated, project]);
  
  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadProject = async () => {
    try {
      // Extract project ID from URL
      const path = window.location.pathname;
      const projectId = path.split('/project/')[1]?.replace(/\/$/, ''); // Remove trailing slash
      
      console.log('Current path:', path);
      console.log('Extracted project ID:', projectId);
      
      if (!projectId) {
        setError('Project ID not found');
        setLoading(false);
        return;
      }

      // Load project from database
      console.log('Attempting to load project with ID:', projectId);
      // Use public client for non-authenticated users, authenticated client for authenticated users
      const clientToUse = isAuthenticated ? authenticatedClient : publicClient;
      const { data } = await clientToUse.models.Project.get({ id: projectId });
      
      console.log('Project data received:', data);
      
      if (!data) {
        console.log('No project data found for ID:', projectId);
        setError('Project not found');
        setLoading(false);
        return;
      }

      // If we have a createdById, load the creator information
      if (data.createdById) {
        try {
          console.log('Loading creator with ID:', data.createdById);
          const { data: creatorData } = await clientToUse.models.User.get({ id: data.createdById });
          if (creatorData) {
            console.log('Creator data loaded:', creatorData);
            setCreator(creatorData);
          } else {
            console.log('No creator data found for ID:', data.createdById);
          }
        } catch (error) {
          console.error('Error loading creator:', error);
          // Continue without creator data
        }
      } else {
        console.log('No createdById found for project');
      }

      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      console.error('Error details:', error);
      setError(`Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkJoinStatus = async (projectId: string) => {
    try {
      console.log('Checking join status for project:', projectId);
      const { getOrCreateUserProfile } = await import('./utils/userProfile');
      const userProfile = await getOrCreateUserProfile();
      
      if (!userProfile) {
        console.log('No user profile found');
        return;
      }

      console.log('User profile found:', userProfile.id);
      const { data: existingActivities } = await authenticatedClient.models.VolunteerActivity.list({
        filter: { 
          userId: { eq: userProfile.id },
          projectId: { eq: projectId }
        }
      });

      console.log('Existing activities:', existingActivities);
      const hasJoined = existingActivities && existingActivities.length > 0;
      console.log('Has joined:', hasJoined);
      setHasJoined(hasJoined);
    } catch (error) {
      console.error('Error checking join status:', error);
    }
  };
  
  const handleSignInClick = () => {
    window.location.href = '/app';
  };

  const handleSignOutClick = async () => {
    try {
      await amplifySignOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBackClick = () => {
    window.location.href = '/projects';
  };

  const handleJoinProject = async () => {
    if (!isAuthenticated) {
      window.location.href = '/app';
      return;
    }

    setJoinLoading(true);
    setNotification(null);

    try {
      // Get current user profile
      const { getOrCreateUserProfile } = await import('./utils/userProfile');
      const userProfile = await getOrCreateUserProfile();
      
      if (!userProfile) {
        setNotification({ type: 'error', message: 'User profile not found. Please try again.' });
        return;
      }

      // Check if user has already joined this project
      const { data: existingActivities } = await authenticatedClient.models.VolunteerActivity.list({
        filter: { 
          userId: { eq: userProfile.id },
          projectId: { eq: project.id }
        }
      });

      if (existingActivities && existingActivities.length > 0) {
        setNotification({ type: 'error', message: 'You have already joined this project!' });
        return;
      }

      // Create volunteer activity
      const { errors } = await authenticatedClient.models.VolunteerActivity.create({
        userId: userProfile.id,
        projectId: project.id,
        status: 'Joined',
        joinedAt: new Date().toISOString(),
        hoursLogged: 0,
        hoursVerified: 0,
        isVerified: false,
        certificateGenerated: false
      });

      if (errors) {
        console.error('Error creating volunteer activity:', errors);
        setNotification({ type: 'error', message: 'Failed to join project. Please try again.' });
        return;
      }

      // Update project's current volunteers count
      const newCurrentVolunteers = (project.currentVolunteers || 0) + 1;
      const newSpotsAvailable = (project.spotsAvailable || 0) - 1;

      const { errors: updateErrors } = await authenticatedClient.models.Project.update({
        id: project.id,
        currentVolunteers: newCurrentVolunteers,
        spotsAvailable: newSpotsAvailable
      });

      if (updateErrors) {
        console.error('Error updating project:', updateErrors);
        // Don't show error to user since they're already joined
      }

      // Update local project state
      setProject((prev: any) => ({
        ...prev,
        currentVolunteers: newCurrentVolunteers,
        spotsAvailable: newSpotsAvailable
      }));

      // Update join status
      setHasJoined(true);
      setNotification({ type: 'success', message: 'Successfully joined the project! Check your My Projects page for details.' });
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('Error joining project:', error);
      setNotification({ type: 'error', message: 'Failed to join project. Please try again.' });
      
      // Auto-dismiss error notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setJoinLoading(false);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    if (category.includes('Education')) return '📚';
    if (category.includes('Community')) return '🤝';
    if (category.includes('Technology')) return '💻';
    if (category.includes('Environment')) return '🌳';
    if (category.includes('Healthcare')) return '🏥';
    if (category.includes('Animal')) return '🐾';
    if (category.includes('Senior')) return '👴';
    if (category.includes('Arts')) return '🎨';
    if (category.includes('Food')) return '🍽️';
    if (category.includes('Sports')) return '🏃';
    return '🌱';
  };

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ color: '#666' }}>Loading project details...</h2>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !project) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ color: '#666', marginBottom: '1rem' }}>Project Not Found</h2>
          <p style={{ color: '#999', marginBottom: '2rem' }}>{error || 'The project you are looking for does not exist.'}</p>
          <button
            onClick={() => window.location.href = '/projects'}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#333',
      margin: 0,
      padding: 0
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'linear-gradient(135deg, #4CAF50, #2196F3)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'relative',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🤝</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Little Project</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Home</a>
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
          {isAuthenticated && (
            <>
              <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Profile</a>
              <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
            </>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleSignOutClick}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleSignInClick}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                marginLeft: '0.5rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          style={{
            background: 'white',
            color: '#666',
            border: '2px solid #e2e8f0',
            padding: '0.8rem 1.5rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Projects
        </button>

        {/* Project Header */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '4rem' }}>{getCategoryIcon(project.category || '')}</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                {project.title}
              </h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#E8F5E8',
                  color: '#2E7D32',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {project.category}
                </span>
                <span style={{
                  background: project.difficulty === 'Easy' ? '#E8F5E8' : project.difficulty === 'Medium' ? '#FFF3E0' : '#FFEBEE',
                  color: project.difficulty === 'Easy' ? '#2E7D32' : project.difficulty === 'Medium' ? '#F57C00' : '#D32F2F',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {project.difficulty} Level
                </span>
                <span style={{
                  background: '#E3F2FD',
                  color: '#1976D2',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {project.spotsAvailable} spots available
                </span>
              </div>
              
              {/* Description - Left side of images */}
              <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '1rem', marginBottom: '0' }}>
                {project.description}
              </p>
            </div>
            
            {/* Project Images - Right Side */}
            {project.images && project.images.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '280px',
                marginTop: '2rem'
              }}>
                 {project.images.slice(0, 2).map((imageUrl: string, index: number) => (
                  <div 
                    key={index} 
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer',
                      width: '280px',
                      height: '220px',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    onClick={() => window.open(imageUrl, '_blank')}
                  >
                    <img
                      src={imageUrl}
                      alt={`${project.title} - Image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        // Hide broken images
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* When & Where */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2E7D32' }}>
              📅 When & Where
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#333' }}>Date:</strong> {formatDate(project.startDate)}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Duration:</strong> {project.duration} hours
              </div>
              <div>
                <strong style={{ color: '#333' }}>Location:</strong> {project.location}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Spots Available:</strong> {project.spotsAvailable} of {project.maxVolunteers} total
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2E7D32' }}>
              📋 Requirements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#333' }}>Requirements:</strong> {project.requirements}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Difficulty:</strong> {project.difficulty}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Category:</strong> {project.category}
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2E7D32' }}>
              🎯 Project Details
            </h3>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              {project.description}
            </p>
            <p style={{ color: '#666', fontWeight: 'bold' }}>
              Make a difference in your community through this {project.category.toLowerCase()} project!
            </p>
          </div>

          {/* Skills & Contact */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2E7D32' }}>
              📊 Project Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#333' }}>Status:</strong> {project.status}
              </div>
              <div>
             <strong style={{ color: '#333' }}>Created by:</strong> {
               creator
                 ? `${creator.firstName} ${creator.lastName}`
                 : 'Community Member'
             }
              </div>
              <div>
                <strong style={{ color: '#333' }}>Project ID:</strong> {project.id}
              </div>
            </div>
          </div>
        </div>

        {/* Join Button / Status */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          {hasJoined ? (
            <>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#10b981' }}>
                ✅ Project Joined!
              </h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                You're all set to participate in this {project.category.toLowerCase()} project. Check your My Projects page for updates!
              </p>
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '15px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
                  🎉 You're Making a Difference!
                </div>
                <div style={{ color: '#059669', fontSize: '0.9rem' }}>
                  Your participation helps create positive change in the community
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/my-projects'}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  transition: 'transform 0.3s'
                }}
              >
                View My Projects
              </button>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2E7D32' }}>
                Ready to Make a Difference?
              </h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Join this {project.category.toLowerCase()} project and make a positive impact in your community!
              </p>
              <button
                onClick={handleJoinProject}
                disabled={joinLoading || project.spotsAvailable === 0}
                style={{
                  background: project.spotsAvailable > 0 
                    ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
                    : 'linear-gradient(135deg, #9E9E9E, #757575)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '25px',
                  cursor: project.spotsAvailable > 0 && !joinLoading ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  transition: 'transform 0.3s',
                  opacity: joinLoading ? 0.7 : 1
                }}
              >
                {joinLoading ? 'Joining...' : (project.spotsAvailable > 0 ? 'Join This Project' : 'Project Full - Join Waitlist')}
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        marginTop: '3rem'
      }}>
        <p>&copy; 2025 Little Project. Making a difference, one small act at a time.</p>
      </footer>
    </div>
  );
};

export default ProjectDetailsPage;
