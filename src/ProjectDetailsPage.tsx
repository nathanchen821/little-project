import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';

const ProjectDetailsPage: React.FC = () => {
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

  const handleBackClick = () => {
    window.location.href = '/projects';
  };

  const handleJoinProject = () => {
    if (!isAuthenticated) {
      window.location.href = '/app';
    } else {
      // In a real app, this would handle joining the project
      alert('Project joined! You will receive confirmation details via email.');
    }
  };

  // Project details for Elementary Tutoring
  const project = {
    id: 5,
    title: "Elementary Tutoring",
    description: "Help 3rd-5th graders with reading, math homework, and study skills in a supportive learning environment",
    category: "Education",
    location: "Blacksburg Elementary School",
    address: "123 Main Street, Blacksburg, VA 24060",
    date: "January 11, 2026",
    time: "3:30 PM - 5:30 PM",
    duration: "2 hours",
    spotsAvailable: 5,
    totalSpots: 8,
    icon: "✏️",
    difficulty: "Medium",
    requirements: "Good grades in math/reading, background check required",
    ageRequirement: "High school students (ages 14-18)",
    whatToBring: "Positive attitude, patience, and enthusiasm for learning",
    whatToExpect: "Work one-on-one or in small groups with elementary students, helping with homework, reading practice, and basic math concepts",
    impact: "Make a real difference in young students' academic confidence and success",
    skills: ["Patience", "Communication", "Teaching", "Math", "Reading"],
    contact: "Ms. Sarah Johnson - sjohnson@blacksburg.edu - (540) 555-0123"
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
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '4rem' }}>{project.icon}</div>
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
            </div>
          </div>
          
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
            {project.description}
          </p>
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
                <strong style={{ color: '#333' }}>Date:</strong> {project.date}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Time:</strong> {project.time}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Duration:</strong> {project.duration}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Location:</strong> {project.location}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Address:</strong> {project.address}
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
                <strong style={{ color: '#333' }}>Age:</strong> {project.ageRequirement}
              </div>
              <div>
                <strong style={{ color: '#333' }}>Requirements:</strong> {project.requirements}
              </div>
              <div>
                <strong style={{ color: '#333' }}>What to Bring:</strong> {project.whatToBring}
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
              🎯 What to Expect
            </h3>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              {project.whatToExpect}
            </p>
            <p style={{ color: '#666', fontWeight: 'bold' }}>
              {project.impact}
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
              🎓 Skills You'll Use
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {project.skills.map((skill, index) => (
                <span key={index} style={{
                  background: '#E8F5E8',
                  color: '#2E7D32',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {skill}
                </span>
              ))}
            </div>
            <div>
              <strong style={{ color: '#333' }}>Contact:</strong>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                {project.contact}
              </p>
            </div>
          </div>
        </div>

        {/* Join Button */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2E7D32' }}>
            Ready to Make a Difference?
          </h3>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Join this project and help elementary students succeed in their studies!
          </p>
          <button
            onClick={handleJoinProject}
            style={{
              background: project.spotsAvailable > 0 
                ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
                : 'linear-gradient(135deg, #9E9E9E, #757575)',
              color: 'white',
              border: 'none',
              padding: '1rem 3rem',
              borderRadius: '25px',
              cursor: project.spotsAvailable > 0 ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'transform 0.3s'
            }}
            disabled={project.spotsAvailable === 0}
          >
            {project.spotsAvailable > 0 ? 'Join This Project' : 'Project Full - Join Waitlist'}
          </button>
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
