import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { getOrCreateUserProfile } from './utils/userProfile';

// Create separate clients for authenticated and public access
const authenticatedClient = generateClient<Schema>();
const publicClient = generateClient<Schema>({
  authMode: 'apiKey'
});

const ProjectsPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [isAuthenticated]);
  
  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
      
      // Check if user is admin
      try {
        const userProfile = await getOrCreateUserProfile();
        if (userProfile?.isAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadProjects = async () => {
    try {
      // Use public client for non-authenticated users, authenticated client for authenticated users
      const clientToUse = isAuthenticated ? authenticatedClient : publicClient;
      
      // Query only Active and Approved projects
      const { data } = await clientToUse.models.Project.list({
        filter: {
          status: { eq: 'Active' },
          isApproved: { eq: true }
        }
      });
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
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

  // Filter projects by category
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()));

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const categories = ['all', 'Community Service', 'Education', 'Technology', 'Environment'];

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
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>Projects</a>
          {isAuthenticated && (
            <>
              <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Achievement</a>
            </>
          )}
          <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
          {isAuthenticated && isAdmin && (
            <a href="/admin" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
              ⚙️ Admin
            </a>
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
        padding: '2rem'
      }}>
        {/* Page Header */}
        <header style={{
          textAlign: 'center',
          padding: '2rem 0',
          background: 'linear-gradient(135deg, #E8F5E8, #E3F2FD)',
          borderRadius: '15px',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'relative',
            marginBottom: '1rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              margin: '0',
              color: '#2E7D32',
              textAlign: 'center'
            }}>
              Volunteer Projects
            </h1>
            <button
              onClick={() => window.location.href = '/submit-project'}
              style={{
                position: 'absolute',
                right: '2rem',
                top: '25%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 0.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1.5rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '3rem',
                height: '3rem',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.width = '16rem';
                e.currentTarget.style.padding = '0.5rem 1rem';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                e.currentTarget.innerHTML = 'Submit New Project';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.width = '3rem';
                e.currentTarget.style.padding = '0.5rem 0.5rem';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                e.currentTarget.innerHTML = '+';
              }}
            >
              +
            </button>
          </div>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '0',
            color: '#666'
          }}>
            Find meaningful volunteer opportunities in Blacksburg & Christiansburg, VA
          </p>
        </header>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              style={{
                background: filter === category ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'white',
                color: filter === category ? 'white' : '#666',
                border: '2px solid #e2e8f0',
                padding: '0.8rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s',
                textTransform: 'capitalize'
              }}
            >
              {category === 'all' ? 'All Projects' : category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '1.5rem', color: '#666' }}>Loading projects...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '0.5rem' }}>No projects available</h3>
              <p style={{ color: '#999' }}>
                {filter === 'all' 
                  ? 'No projects have been approved yet. Check back soon!' 
                  : `No ${filter} projects available at the moment.`}
              </p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div key={project.id} style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>{getCategoryIcon(project.category || '')}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                      {project.title}
                    </h3>
                    <span style={{
                      background: '#E8F5E8',
                      color: '#2E7D32',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {project.category}
                    </span>
                  </div>
                </div>
                
                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  {project.description}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📅</span>
                    <span>{formatDate(project.startDate)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📍</span>
                    <span>{project.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⏱️</span>
                    <span>{project.duration} hours</span>
                </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>👥</span>
                    <span>{project.spotsAvailable} spots available ({project.currentVolunteers}/{project.maxVolunteers} filled)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{
                    background: project.difficulty === 'Easy' ? '#E8F5E8' : project.difficulty === 'Medium' ? '#FFF3E0' : '#FFEBEE',
                    color: project.difficulty === 'Easy' ? '#2E7D32' : project.difficulty === 'Medium' ? '#F57C00' : '#D32F2F',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {project.difficulty}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {project.requirements}
                  </span>
                </div>

                <button 
                  onClick={() => window.location.href = `/project/${project.id}`}
                  style={{
                    width: '100%',
                    background: project.spotsAvailable && project.spotsAvailable > 0 
                      ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
                      : 'linear-gradient(135deg, #9E9E9E, #757575)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '20px',
                    cursor: project.spotsAvailable && project.spotsAvailable > 0 ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    transition: 'transform 0.3s',
                    fontSize: '0.9rem'
                  }}
                  disabled={!project.spotsAvailable || project.spotsAvailable === 0}
                >
                  {project.spotsAvailable && project.spotsAvailable > 0 ? 'Learn More' : 'Full - Join Waitlist'}
                </button>
              </div>
            ))
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

export default ProjectsPage;
