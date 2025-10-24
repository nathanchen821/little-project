import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

// Create separate clients for authenticated and public access
const authenticatedClient = generateClient<Schema>();
const publicClient = generateClient<Schema>({
  authMode: 'apiKey'
});

const LandingPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalProjects: 0,
    activeVolunteers: 0
  });
  
  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    loadFeaturedProjects();
    loadStats();
  }, [isAuthenticated]);
  
  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadFeaturedProjects = async () => {
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
      
      if (data && data.length > 0) {
        // Randomly select 3 projects
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setFeaturedProjects(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading featured projects:', error);
      setFeaturedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Use public client for non-authenticated users, authenticated client for authenticated users
      const clientToUse = isAuthenticated ? authenticatedClient : publicClient;
      
      // Load all users to calculate stats
      const { data: users } = await clientToUse.models.User.list();
      
      if (users) {
        // Calculate total hours volunteered
        const totalHours = users.reduce((sum, user) => sum + (user.totalHours || 0), 0);
        
        // Calculate total projects completed
        const totalProjects = users.reduce((sum, user) => sum + (user.totalProjects || 0), 0);
        
        // Count all registered users as active volunteers
        const activeVolunteers = users.length;
        
        setStats({
          totalHours,
          totalProjects,
          activeVolunteers
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Keep default values (0) on error
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
      {/* Navigation - FIXED POSITIONING */}
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
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>Home</a>
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
          {isAuthenticated && (
            <>
              <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Achievement</a>
            </>
          )}
          <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
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

      {/* Main Content - exactly like demo */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Hero Section */}
        <header style={{
          textAlign: 'center',
          padding: '2rem 0',
          background: 'linear-gradient(135deg, #E8F5E8, #E3F2FD)',
          borderRadius: '15px',
          marginBottom: '0'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: '#2E7D32'
          }}>
            Make a Big Impact with Little Projects
          </h1>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '2rem',
            color: '#666'
          }}>
            Connect with local service opportunities in Blacksburg, Virginia
          </p>
        </header>

        {/* Featured Projects */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '2rem',
            color: '#2E7D32',
            textAlign: 'center'
          }}>
            Featured Projects
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '1.5rem', color: '#666' }}>Loading featured projects...</div>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '0.5rem' }}>No projects available</h3>
              <p style={{ color: '#999' }}>Check back soon for new volunteer opportunities!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {featuredProjects.map(project => (
                <div key={project.id} style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s'
                }}>
                  <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                    {getCategoryIcon(project.category || '')}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                    {project.title}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    {project.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    <span>📅 {formatDate(project.startDate)}</span>
                    <span>⏱️ {project.duration} hours</span>
                    <span>📍 {project.location}</span>
                  </div>
                  <a href={`/project/${project.id}`} style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FFC107, #FF9800)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'transform 0.3s',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center'
                  }}>
                    Learn More
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
              {stats.totalHours}
            </h3>
            <p style={{ color: '#666', fontWeight: 'bold' }}>Hours Volunteered</p>
          </div>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
              {stats.totalProjects}
            </h3>
            <p style={{ color: '#666', fontWeight: 'bold' }}>Projects Completed</p>
          </div>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
              {stats.activeVolunteers}
            </h3>
            <p style={{ color: '#666', fontWeight: 'bold' }}>Active Volunteers</p>
          </div>
        </section>

        {/* Leaderboard CTA */}
        <section style={{
          background: 'linear-gradient(135deg, #4CAF50, #2196F3)',
          color: 'white',
          padding: '3rem',
          borderRadius: '15px',
          textAlign: 'center',
          marginBottom: '3rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            🏆 See Who's Making a Difference
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Check out our leaderboard to see the top volunteers in your community and get inspired!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/leaderboard" style={{
              background: 'white',
              color: '#4CAF50',
              textDecoration: 'none',
              padding: '1rem 2rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'transform 0.3s',
              display: 'inline-block'
            }}>
              🏆 View Leaderboard
            </a>
            <a href="/projects" style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              textDecoration: 'none',
              padding: '1rem 2rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'transform 0.3s',
              display: 'inline-block',
              border: '2px solid white'
            }}>
              📋 Browse Projects
            </a>
          </div>
        </section>
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

export default LandingPage;