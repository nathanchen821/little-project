import React from 'react';

const LandingPage: React.FC = () => {
  const handleSignInClick = () => {
    window.location.href = '/app';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Sign In Button */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 4rem',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
          Amplify
        </div>
        <button
          onClick={handleSignInClick}
          style={{
            background: '#3b82f6',
            border: 'none',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}
        >
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '6rem 4rem',
        textAlign: 'center',
        background: 'transparent',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '4rem 3rem',
          width: '100%',
          maxWidth: '1000px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            color: '#1e293b',
            fontSize: '3.5rem',
            marginBottom: '1.5rem',
            fontWeight: '800',
            letterSpacing: '-0.02em'
          }}>
            Welcome to Amplify
          </h1>
          
          <p style={{
            color: '#64748b',
            fontSize: '1.25rem',
            marginBottom: '3rem',
            lineHeight: '1.7',
            maxWidth: '600px',
            margin: '0 auto 3rem auto'
          }}>
            Your modern todo application powered by AWS Amplify. 
            Sign in to manage your tasks and stay organized.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <span style={{ color: 'white', fontSize: '1.2rem' }}>✨</span>
              </div>
              <h3 style={{ color: '#1e293b', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                Modern UI
              </h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                Beautiful, responsive design that works on all devices
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{ color: 'white', fontSize: '1.2rem' }}>🔐</span>
              </div>
              <h3 style={{ color: '#1e293b', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                Secure Auth
              </h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                AWS-powered authentication with enterprise-grade security
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                <span style={{ color: 'white', fontSize: '1.2rem' }}>⚡</span>
              </div>
              <h3 style={{ color: '#1e293b', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                Real-time
              </h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                Live updates and sync across all your devices
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2rem 4rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e5e7eb',
        color: '#64748b',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: 0 }}>
          Built with ❤️ using AWS Amplify and React
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
