import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { getOrCreateUserProfile } from './utils/userProfile';

const client = generateClient<Schema>();

interface Project {
  id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  city?: string;
  state?: string;
  startDate: string;
  duration?: number;
  currentVolunteers?: number;
  maxVolunteers?: number;
  spotsAvailable?: number;
  status?: string;
  isApproved?: boolean;
  images?: string[];
  createdAt: string;
}

const MyProjectsPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuthState();
  }, []);
  
  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
      await loadMySubmissions();
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const loadMySubmissions = async () => {
    try {
      setLoading(true);
      
      // Get current user profile
      const userProfile = await getOrCreateUserProfile();
      if (!userProfile) {
        console.error('No user profile found');
        setLoading(false);
        return;
      }
      
      // Check if user is admin
      if (userProfile.isAdmin) {
        setIsAdmin(true);
      }
      
      // Query projects where createdById === current user's id
      const { data: allProjects, errors } = await client.models.Project.list();
      
      if (errors) {
        console.error('Error fetching projects:', errors);
        setLoading(false);
        return;
      }
      
      // Filter projects created by this user
      const userProjects = allProjects?.filter(p => p.createdById === userProfile.id) || [];
      
      // Sort by creation date (newest first)
      const sortedProjects = userProjects.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setMySubmissions(sortedProjects as Project[]);
      setLoading(false);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setLoading(false);
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

  const getCategoryIcon = (category: string | undefined) => {
    if (!category) return '📋';
    if (category.includes('Education')) return '📚';
    if (category.includes('Environment')) return '🌳';
    if (category.includes('Community')) return '🤝';
    if (category.includes('Technology')) return '💻';
    if (category.includes('Health')) return '❤️';
    if (category.includes('Animals')) return '🐾';
    if (category.includes('Arts')) return '🎨';
    return '📋';
  };

  const getStatusBadge = (status: string | undefined, isApproved: boolean | undefined) => {
    if (status === 'Active' && isApproved) {
      return {
        text: 'Active',
        bg: '#d1fae5',
        color: '#065f46',
        icon: '🟢'
      };
    } else if (status === 'Pending' || !isApproved) {
      return {
        text: 'Pending',
        bg: '#fef3c7',
        color: '#92400e',
        icon: '🟡'
      };
    } else if (status === 'Rejected') {
      return {
        text: 'Rejected',
        bg: '#fee2e2',
        color: '#991b1b',
        icon: '🔴'
      };
    }
    return {
      text: status || 'Unknown',
      bg: '#e5e7eb',
      color: '#374151',
      icon: '⚪'
    };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const handleEditProject = (projectId: string) => {
    // Navigate to edit page (we'll implement this next)
    window.location.href = `/submit-project?edit=${projectId}`;
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { errors } = await client.models.Project.delete({ id: projectId });
      
      if (errors) {
        console.error('Error deleting project:', errors);
        alert('Failed to delete project. Please try again.');
        return;
      }

      // Reload the submissions
      await loadMySubmissions();
      alert('Project deleted successfully.');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

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
              <a href="#" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>My Projects</a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Achievement</a>
              <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
              {isAdmin && (
                <a href="/admin" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
                  ⚙️ Admin
                </a>
              )}
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

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        paddingTop: '3rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '1rem'
          }}>
            My Submitted Projects
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#718096',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            View and manage the projects you've submitted for approval
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#718096'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>⏳</div>
            <p>Loading your submissions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && mySubmissions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>📝</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              No Projects Yet
            </h3>
            <p style={{
              color: '#718096',
              marginBottom: '1.5rem'
            }}>
              You haven't submitted any projects yet. Start making a difference!
            </p>
            <button
              onClick={() => window.location.href = '/submit-project'}
              style={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Submit Your First Project
            </button>
          </div>
        )}

        {/* Projects List */}
        {!loading && mySubmissions.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {mySubmissions.map((project) => {
              const statusBadge = getStatusBadge(project.status, project.isApproved);
              const locationStr = project.city && project.state 
                ? `${project.city}, ${project.state}`
                : project.location || 'Location TBD';
              
              return (
                <div key={project.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease'
                }}>
                  {/* Project Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                      <span style={{ fontSize: '2.5rem' }}>{getCategoryIcon(project.category)}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.35rem',
                          fontWeight: '600',
                          color: '#2d3748',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {project.title}
                        </h3>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#718096',
                          margin: '0'
                        }}>
                          📍 {locationStr}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                      whiteSpace: 'nowrap'
                    }}>
                      <span>{statusBadge.icon}</span>
                      {statusBadge.text}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: '#4a5568',
                    marginBottom: '1rem',
                    lineHeight: '1.6',
                    fontSize: '0.95rem'
                  }}>
                    {project.description}
                  </p>

                  {/* Project Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Category
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {project.category || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Start Date
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {formatDate(project.startDate)}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Duration
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {project.duration ? `${project.duration} hours` : 'TBD'}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Volunteers
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {project.currentVolunteers || 0} / {project.maxVolunteers || 0}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Created
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {statusBadge.text === 'Pending' && (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <button
                        onClick={() => handleEditProject(project.id)}
                        style={{
                          flex: 1,
                          background: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        style={{
                          flex: 1,
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Section */}
        {!loading && mySubmissions.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '1.5rem'
            }}>
              Submission Summary
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: '#f7fafc',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  marginBottom: '0.5rem'
                }}>
                  {mySubmissions.length}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  fontWeight: '500'
                }}>
                  Total Submissions
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: '#f7fafc',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginBottom: '0.5rem'
                }}>
                  {mySubmissions.filter(p => p.status === 'Active' && p.isApproved).length}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  fontWeight: '500'
                }}>
                  Active Projects
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: '#f7fafc',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#f59e0b',
                  marginBottom: '0.5rem'
                }}>
                  {mySubmissions.filter(p => p.status === 'Pending' || !p.isApproved).length}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  fontWeight: '500'
                }}>
                  Pending Approval
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: '#f7fafc',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#6366f1',
                  marginBottom: '0.5rem'
                }}>
                  {mySubmissions.reduce((sum, p) => sum + (p.currentVolunteers || 0), 0)}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  fontWeight: '500'
                }}>
                  Total Volunteers
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyProjectsPage;
