import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import LandingPage from "./LandingPage.tsx";
import ProfilePage from "./ProfilePage.tsx";
import CompleteProfilePage from "./CompleteProfilePage.tsx";
import ProjectsPage from "./ProjectsPage.tsx";
import ProjectSubmissionPage from "./ProjectSubmissionPage.tsx";
import ProjectDetailsPage from "./ProjectDetailsPage.tsx";
import LeaderboardPage from "./LeaderboardPage.tsx";
import MyProjectsPage from "./MyProjectsPage.tsx";
import "./index.css";
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

// Custom Sign In Page with Landing Page Layout
function SignInPage() {
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
      {/* Navigation - Same as Landing Page */}
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
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Hero Section */}
        <header style={{
          textAlign: 'center',
          padding: '2rem 4rem',
          background: 'linear-gradient(135deg, #E8F5E8, #E3F2FD)',
          borderRadius: '15px',
          marginBottom: '2rem',
          maxWidth: '950px',
          margin: '0 auto 2rem auto'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: '#2E7D32'
          }}>
            Welcome to Little Project
          </h1>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '0',
            color: '#666'
          }}>
            Sign in to access your projects and make a difference in your community
          </p>
        </header>

        {/* Authenticator Component */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            background: 'white',
            borderRadius: '15px',
            padding: '2.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <Authenticator
              hideSignUp={false}
              signUpAttributes={['email']}
            >
              {({ user }) => {
                // After authentication, show loading message then redirect
                if (user) {
                  // Redirect immediately
                  window.location.href = '/';
                  
                  return (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      fontSize: '1.2rem',
                      color: '#2E7D32',
                      fontWeight: '500',
                      background: 'linear-gradient(135deg, #E8F5E8, #E3F2FD)',
                      borderRadius: '10px',
                      border: '1px solid #4CAF50'
                    }}>
                      Signing you in...
                    </div>
                  );
                }
                return <div></div>;
              }}
            </Authenticator>
          </div>
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
}

// Simple routing based on URL
function Router() {
  const path = window.location.pathname;
  
  // Handle both /app and /app/ paths
  if (path === '/app' || path === '/app/') {
    return <SignInPage />;
  }
  
  if (path === '/profile' || path === '/profile/') {
    return <ProfilePage />;
  }
  
  if (path === '/complete-profile' || path === '/complete-profile/') {
    return <CompleteProfilePage />;
  }
  
  if (path === '/projects' || path === '/projects/') {
    return <ProjectsPage />;
  }
  
  if (path === '/submit-project' || path === '/submit-project/') {
    return <ProjectSubmissionPage />;
  }
  
  if (path === '/project/elementary-tutoring' || path === '/project/elementary-tutoring/') {
    return <ProjectDetailsPage />;
  }
  
  if (path === '/leaderboard' || path === '/leaderboard/') {
    return <LeaderboardPage />;
  }
  
  if (path === '/my-projects' || path === '/my-projects/') {
    return <MyProjectsPage />;
  }
  
  // Default to landing page for all other paths
  return <LandingPage />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
