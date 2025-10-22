import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';

const MyProjectsPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [volunteerHours, setVolunteerHours] = useState<{[key: number]: number}>({
    5: 12, // Elementary Tutoring - 12 hours logged
    1: 6   // Senior Yard Work Help - 6 hours logged (completed)
  });
  
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

  const handleHoursChange = (projectId: number, hours: number) => {
    setVolunteerHours(prev => ({
      ...prev,
      [projectId]: hours
    }));
  };

  // Mock data for user's joined projects
  const myProjects = [
    {
      id: 5,
      title: "Elementary Tutoring",
      description: "Help 3rd-5th graders with reading, math homework, and study skills",
      category: "Education",
      location: "Blacksburg Elementary School",
      date: "Jan 11, 2026",
      time: "3:30 PM - 5:30 PM",
      duration: "2 hours",
      icon: "✏️",
      difficulty: "Medium",
      status: "Working",
      totalHours: volunteerHours[5] || 0
    },
    {
      id: 1,
      title: "Senior Yard Work Help",
      description: "Help elderly residents with yard maintenance, raking leaves, and light outdoor tasks",
      category: "Community Service",
      location: "Blacksburg Senior Center",
      date: "Dec 7, 2025",
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours",
      icon: "🌱",
      difficulty: "Easy",
      status: "Completed",
      totalHours: volunteerHours[1] || 0
    }
  ];

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
            My Projects
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#718096',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Track your volunteer hours and manage your ongoing projects
          </p>
        </div>

        {/* Projects List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {myProjects.map((project) => (
            <div key={project.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{project.icon}</span>
                  <div>
                    {project.id === 5 ? (
                      <a href="/project/elementary-tutoring" style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#3b82f6',
                        margin: '0 0 0.25rem 0',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}>
                        {project.title}
                      </a>
                    ) : (
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#2d3748',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {project.title}
                      </h3>
                    )}
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      margin: '0'
                    }}>
                      {project.location} • {project.date}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    backgroundColor: project.status === 'Working' ? '#fef3c7' : '#d1fae5',
                    color: project.status === 'Working' ? '#92400e' : '#065f46'
                  }}>
                    {project.status}
                  </span>
                </div>
              </div>

              <p style={{
                color: '#4a5568',
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                {project.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '2rem',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{
                      fontSize: '0.85rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Category
                    </span>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      fontWeight: '500'
                    }}>
                      {project.category}
                    </p>
                  </div>
                  <div>
                    <span style={{
                      fontSize: '0.85rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Difficulty
                    </span>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.9rem',
                      color: '#2d3748',
                      fontWeight: '500'
                    }}>
                      {project.difficulty}
                    </p>
                  </div>
                </div>

                {/* Volunteer Hours Section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.85rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Total Hours
                    </span>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '1.1rem',
                      color: '#2d3748',
                      fontWeight: '600'
                    }}>
                      {project.totalHours} hours
                    </p>
                  </div>
                  {project.status === 'Working' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={project.totalHours}
                        onChange={(e) => handleHoursChange(project.id, parseInt(e.target.value) || 0)}
                        style={{
                          width: '60px',
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          textAlign: 'center'
                        }}
                        placeholder="0"
                      />
                      <button
                        onClick={() => handleHoursChange(project.id, project.totalHours + 1)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        +1
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section */}
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
            marginBottom: '1rem'
          }}>
            Volunteer Hours Summary
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              background: '#f7fafc',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '0.5rem'
              }}>
                {Object.values(volunteerHours).reduce((sum, hours) => sum + hours, 0)}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#718096',
                fontWeight: '500'
              }}>
                Total Hours
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              background: '#f7fafc',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '0.5rem'
              }}>
                {myProjects.filter(p => p.status === 'Completed').length}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#718096',
                fontWeight: '500'
              }}>
                Completed Projects
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              background: '#f7fafc',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#f59e0b',
                marginBottom: '0.5rem'
              }}>
                {myProjects.filter(p => p.status === 'Working').length}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#718096',
                fontWeight: '500'
              }}>
                Active Projects
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyProjectsPage;
