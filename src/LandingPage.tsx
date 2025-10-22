import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';

const LandingPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    checkAuthState();
  }, []);
  
  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
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
          <a href="#" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>Home</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
          {isAuthenticated && (
            <>
              <a href="#" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Achievement</a>
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
          <button style={{
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'transform 0.3s'
          }}>
            Browse Projects
          </button>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>Tutoring at Local Library</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Help elementary students with reading and homework</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <span>📅 Jun 15, 2025</span>
                <span>⏱️ 2 hours</span>
                <span>📍 Blacksburg Library</span>
              </div>
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FFC107, #FF9800)',
                color: 'white',
                border: 'none',
                padding: '0.8rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.3s'
              }}>
                Join Project
              </button>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🌱</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>Community Garden Cleanup</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Help maintain the neighborhood community garden</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <span>📅 Jul 8, 2025</span>
                <span>⏱️ 3 hours</span>
                <span>📍 Blacksburg Municipal Park</span>
              </div>
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FFC107, #FF9800)',
                color: 'white',
                border: 'none',
                padding: '0.8rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.3s'
              }}>
                Join Project
              </button>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s'
            }}>
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🎓</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>Youth Tutoring</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Help middle and high school students with homework and study skills</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <span>📅 Aug 12, 2025</span>
                <span>⏱️ 4 hours</span>
                <span>📍 Blacksburg Community Center</span>
              </div>
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FFC107, #FF9800)',
                color: 'white',
                border: 'none',
                padding: '0.8rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.3s'
              }}>
                Join Project
              </button>
            </div>
          </div>
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
            <h3 style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '0.5rem' }}>47</h3>
            <p style={{ color: '#666', fontWeight: 'bold' }}>Hours Volunteered</p>
          </div>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '0.5rem' }}>8</h3>
            <p style={{ color: '#666', fontWeight: 'bold' }}>Projects Completed</p>
          </div>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '0.5rem' }}>12</h3>
            <p style={{ color: '#666', fontWeight: 'bold' }}>Active Volunteers</p>
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