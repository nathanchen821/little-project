import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';

const ProjectsPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState('all');
  
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

  // Mock projects data for high school students in Blacksburg/Christiansburg area
  const projects = [
    {
      id: 1,
      title: "Senior Yard Work Help",
      description: "Help elderly residents with yard maintenance, raking leaves, and light outdoor tasks",
      category: "Community Service",
      location: "Blacksburg Senior Center",
      date: "Dec 7, 2025",
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours",
      spotsAvailable: 8,
      totalSpots: 12,
      icon: "🌱",
      difficulty: "Easy",
      requirements: "Comfortable clothes, work gloves provided"
    },
    {
      id: 2,
      title: "Tech Setup for Seniors",
      description: "Help seniors set up smartphones, tablets, and basic computer tasks",
      category: "Technology",
      location: "Christiansburg Library",
      date: "Dec 14, 2025",
      time: "1:00 PM - 4:00 PM",
      duration: "3 hours",
      spotsAvailable: 6,
      totalSpots: 10,
      icon: "📱",
      difficulty: "Easy",
      requirements: "Basic tech knowledge, patience"
    },
    {
      id: 3,
      title: "School Supply Drive",
      description: "Organize and collect school supplies for local elementary schools",
      category: "Education",
      location: "Blacksburg High School",
      date: "Dec 21, 2025",
      time: "10:00 AM - 2:00 PM",
      duration: "4 hours",
      spotsAvailable: 15,
      totalSpots: 20,
      icon: "📚",
      difficulty: "Easy",
      requirements: "Organizational skills, friendly personality"
    },
    {
      id: 4,
      title: "Winter Clothing Drive",
      description: "Collect and sort winter coats, hats, and gloves for families in need",
      category: "Community Service",
      location: "Christiansburg Community Center",
      date: "Jan 4, 2026",
      time: "9:00 AM - 1:00 PM",
      duration: "4 hours",
      spotsAvailable: 12,
      totalSpots: 15,
      icon: "🧥",
      difficulty: "Easy",
      requirements: "Sorting skills, ability to lift boxes"
    },
    {
      id: 5,
      title: "Elementary Tutoring",
      description: "Help 3rd-5th graders with reading, math homework, and study skills",
      category: "Education",
      location: "Blacksburg Elementary School",
      date: "Jan 11, 2026",
      time: "3:30 PM - 5:30 PM",
      duration: "2 hours",
      spotsAvailable: 5,
      totalSpots: 8,
      icon: "✏️",
      difficulty: "Medium",
      requirements: "Good grades in math/reading, background check required",
      detailsUrl: "/project/elementary-tutoring"
    },
    {
      id: 6,
      title: "Shelter Care Packing",
      description: "Create essential care packages with toiletries, snacks, and comfort items for families in need",
      category: "Community Service",
      location: "St. Michael Lutheran Church",
      date: "Jan 18, 2026",
      time: "10:00 AM - 2:00 PM",
      duration: "4 hours",
      spotsAvailable: 8,
      totalSpots: 12,
      icon: "📦",
      difficulty: "Easy",
      requirements: "None, all materials provided"
    },
    {
      id: 7,
      title: "Park Cleanup Day",
      description: "Help clean up local parks, remove litter, and maintain trails",
      category: "Environment",
      location: "Heritage Park, Christiansburg",
      date: "Jan 25, 2026",
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours",
      spotsAvailable: 20,
      totalSpots: 25,
      icon: "🌳",
      difficulty: "Easy",
      requirements: "Comfortable clothes, work gloves provided"
    },
    {
      id: 8,
      title: "Community Center Cleanup",
      description: "Deep clean and organize community spaces for local events",
      category: "Community Service",
      location: "Blacksburg Community Center",
      date: "Feb 1, 2026",
      time: "1:00 PM - 4:00 PM",
      duration: "3 hours",
      spotsAvailable: 10,
      totalSpots: 15,
      icon: "🧹",
      difficulty: "Easy",
      requirements: "Cleaning supplies provided"
    },
    {
      id: 9,
      title: "Logging Internship",
      description: "Learn sustainable forestry practices and help with tree inventory in local forests",
      category: "Environment",
      location: "Jefferson National Forest",
      date: "Feb 8, 2026",
      time: "8:00 AM - 3:00 PM",
      duration: "7 hours",
      spotsAvailable: 3,
      totalSpots: 5,
      icon: "🌲",
      difficulty: "Hard",
      requirements: "Physical fitness, outdoor experience preferred"
    }
  ];

  const categories = ['all', 'Community Service', 'Education', 'Technology', 'Environment'];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.category === filter);

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
              onClick={() => alert('Submit New Project feature coming soon!')}
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
          {filteredProjects.map(project => (
            <div key={project.id} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{project.icon}</div>
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
                  <span>{project.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⏰</span>
                  <span>{project.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📍</span>
                  <span>{project.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⏱️</span>
                  <span>{project.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>👥</span>
                  <span>{project.spotsAvailable} spots available ({project.totalSpots - project.spotsAvailable}/{project.totalSpots} filled)</span>
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

              {project.detailsUrl ? (
                <a href={project.detailsUrl} style={{
                  width: '100%',
                  background: project.spotsAvailable > 0 
                    ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
                    : 'linear-gradient(135deg, #9E9E9E, #757575)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem',
                  borderRadius: '20px',
                  cursor: project.spotsAvailable > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  transition: 'transform 0.3s',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'center'
                }}>
                  {project.spotsAvailable > 0 ? 'Learn More' : 'Full - Join Waitlist'}
                </a>
              ) : (
                <button style={{
                  width: '100%',
                  background: project.spotsAvailable > 0 
                    ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
                    : 'linear-gradient(135deg, #9E9E9E, #757575)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem',
                  borderRadius: '20px',
                  cursor: project.spotsAvailable > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  transition: 'transform 0.3s',
                  fontSize: '0.9rem'
                }}
                disabled={project.spotsAvailable === 0}
              >
                {project.spotsAvailable > 0 ? 'Learn More' : 'Full - Join Waitlist'}
              </button>
              )}
            </div>
          ))}
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
