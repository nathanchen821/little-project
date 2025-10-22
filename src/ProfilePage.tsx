import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error getting user:', error);
      // Redirect to sign in if not authenticated
      window.location.href = '/app';
    }
  };

  const handleSignOutClick = async () => {
    try {
      await amplifySignOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  // Mock data - in a real app, this would come from your backend
  const mockStats = {
    hoursVolunteered: 12.5,
    projectsCompleted: 3,
    peopleHelped: 15,
    goalHours: 50,
    goalProjects: 10,
    goalPeople: 100,
    points: 250,
    streak: 2,
    rank: 15,
    level: 3,
    nextLevelPoints: 50
  };

  const mockAchievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first volunteer project",
      icon: "🌟",
      earned: true,
      date: "Nov 15, 2025"
    },
    {
      id: 2,
      title: "Education Helper",
      description: "Volunteer 5+ hours in education projects",
      icon: "📚",
      earned: true,
      date: "Nov 30, 2025"
    },
    {
      id: 3,
      title: "Community Champion",
      description: "Complete 3 community service projects",
      icon: "🤝",
      earned: true,
      date: "Nov 30, 2025"
    },
    {
      id: 4,
      title: "Volunteer Streak",
      description: "Volunteer for 5 consecutive weeks",
      icon: "🔥",
      earned: false,
      progress: "2/5 weeks"
    },
    {
      id: 5,
      title: "Diamond Volunteer",
      description: "Complete 50+ volunteer hours",
      icon: "💎",
      earned: false,
      progress: "12.5/50 hours"
    }
  ];

  const mockStories = [
    {
      id: 1,
      title: "Helping at the Food Bank",
      description: "Spent 4 hours organizing donations and helping families in need.",
      date: "Nov 30, 2025",
      hours: 4,
      category: "Community"
    },
    {
      id: 2,
      title: "Senior Center Activities",
      description: "Led arts and crafts activities for elderly residents.",
      date: "Nov 25, 2025",
      hours: 2.5,
      category: "Community"
    },
    {
      id: 3,
      title: "Tutoring Program",
      description: "Helped elementary students with reading and math homework.",
      date: "Nov 15, 2025",
      hours: 6,
      category: "Education"
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
              <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
          <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>My Achievement</a>
          <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
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
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: '#2E7D32'
          }}>
            My Achievement
          </h1>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '0',
            color: '#666'
          }}>
            Track your volunteer journey and celebrate your achievements
          </p>
        </header>

        {/* Profile Overview */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{
              fontSize: '4rem',
              background: 'linear-gradient(135deg, #4CAF50, #2196F3)',
              borderRadius: '50%',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                {user?.signInDetails?.loginId || user?.username || 'Volunteer'}
              </h2>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                High School Volunteer • Member since Nov 2025
              </p>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#666' }}>
                <span>⏱️ {mockStats.hoursVolunteered} hours</span>
                <span>📋 {mockStats.projectsCompleted} projects</span>
                <span>👥 {mockStats.peopleHelped} lives helped</span>
                <span>⭐ {mockStats.points} points</span>
                <span>🔥 {mockStats.streak} week streak</span>
              </div>
            </div>
            <button style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              ✏️ Edit Profile
            </button>
          </div>
        </section>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e2e8f0',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' },
            { id: 'social', label: 'Social', icon: '👥' },
            { id: 'stories', label: 'Stories & Photos', icon: '📸' },
            { id: 'trophies', label: 'Trophies', icon: '🏅' },
            { id: 'challenges', label: 'Challenges', icon: '🎯' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '20px 20px 0 0',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Level & Ranking */}
            <section style={{ marginBottom: '2rem' }}>
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
              }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32', textAlign: 'center' }}>
                  🏆 Your Status
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '2rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
                    <h3 style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                      Level {mockStats.level}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>Volunteer Level</p>
                    <div style={{
                      background: '#e2e8f0',
                      borderRadius: '10px',
                      height: '8px',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        height: '100%',
                        borderRadius: '10px',
                        width: `${(mockStats.points / (mockStats.points + mockStats.nextLevelPoints)) * 100}%`
                      }}></div>
                    </div>
                    <small style={{ color: '#666' }}>{mockStats.nextLevelPoints} points to next level</small>
                  </div>
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏅</div>
                    <h3 style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                      #{mockStats.rank}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>Overall Ranking</p>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Top 15% of volunteers
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥</div>
                    <h3 style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                      {mockStats.streak}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>Week Streak</p>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Keep it going!
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Impact Stats */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32' }}>
                Your Impact Dashboard
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                    {mockStats.hoursVolunteered}
                  </h3>
                  <p style={{ color: '#666', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Hours Volunteered
                  </p>
                  <div style={{
                    background: '#e2e8f0',
                    borderRadius: '10px',
                    height: '8px',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      height: '100%',
                      borderRadius: '10px',
                      width: `${(mockStats.hoursVolunteered / mockStats.goalHours) * 100}%`
                    }}></div>
                  </div>
                  <small style={{ color: '#666' }}>Goal: {mockStats.goalHours} hours</small>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                    {mockStats.projectsCompleted}
                  </h3>
                  <p style={{ color: '#666', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Projects Completed
                  </p>
                  <div style={{
                    background: '#e2e8f0',
                    borderRadius: '10px',
                    height: '8px',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      height: '100%',
                      borderRadius: '10px',
                      width: `${(mockStats.projectsCompleted / mockStats.goalProjects) * 100}%`
                    }}></div>
                  </div>
                  <small style={{ color: '#666' }}>Goal: {mockStats.goalProjects} projects</small>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                    {mockStats.peopleHelped}
                  </h3>
                  <p style={{ color: '#666', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Lives Impacted
                  </p>
                  <div style={{
                    background: '#e2e8f0',
                    borderRadius: '10px',
                    height: '8px',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      height: '100%',
                      borderRadius: '10px',
                      width: `${(mockStats.peopleHelped / mockStats.goalPeople) * 100}%`
                    }}></div>
                  </div>
                  <small style={{ color: '#666' }}>Goal: {mockStats.goalPeople} lives</small>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32' }}>
                Recent Activity
              </h2>
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                {mockStories.map((story, index) => (
                  <div key={story.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 0',
                    borderBottom: index < mockStories.length - 1 ? '1px solid #e2e8f0' : 'none'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      background: 'linear-gradient(135deg, #4CAF50, #2196F3)',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {story.category === 'Education' ? '📚' : '🤝'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: '0.5rem', color: '#2E7D32' }}>
                        {story.title}
                      </h4>
                      <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                        {story.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        <span>📅 {story.date}</span>
                        <span>⏱️ {story.hours} hours</span>
                        <span>🏷️ {story.category}</span>
                      </div>
                    </div>
                    <span style={{
                      background: '#4CAF50',
                      color: 'white',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      ✅ Completed
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32' }}>
              🏆 Achievements & Badges
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {mockAchievements.map(achievement => (
                <div key={achievement.id} style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  border: achievement.earned ? '2px solid #4CAF50' : '2px solid #e2e8f0',
                  opacity: achievement.earned ? 1 : 0.7
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {achievement.icon}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                    {achievement.title}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    {achievement.description}
                  </p>
                  {achievement.earned ? (
                    <span style={{
                      background: '#4CAF50',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      ✅ Earned {achievement.date}
                    </span>
                  ) : (
                    <span style={{
                      background: '#e2e8f0',
                      color: '#666',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      🔒 {achievement.progress}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32' }}>
              📸 Stories & Photos
            </h2>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '2rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2E7D32' }}>
                Share Your Impact
              </h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Upload photos and stories from your volunteer experiences to inspire others
              </p>
              <button style={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginRight: '1rem'
              }}>
                📤 Upload Photos
              </button>
              <button style={{
                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                ✍️ Write Story
              </button>
            </div>
          </section>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32' }}>
              👥 Social & Friends
            </h2>
            
            {/* Friends List */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#2E7D32' }}>
                Your Volunteer Squad
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                {[
                  { name: "Sarah Chen", school: "Blacksburg High", avatar: "👩‍🎓", hours: 67.5, streak: 8, status: "online" },
                  { name: "Marcus Johnson", school: "Christiansburg High", avatar: "👨‍🎓", hours: 58.2, streak: 5, status: "offline" },
                  { name: "Emily Rodriguez", school: "Blacksburg High", avatar: "👩‍🎓", hours: 52.8, streak: 6, status: "online" }
                ].map((friend, index) => (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ fontSize: '2.5rem' }}>{friend.avatar}</div>
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: friend.status === 'online' ? '#4CAF50' : '#ccc',
                        border: '2px solid white'
                      }}></div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: '#2E7D32' }}>
                        {friend.name}
                      </h4>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>
                        {friend.school}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#666' }}>
                        <span>⏱️ {friend.hours}h</span>
                        <span>🔥 {friend.streak}w</span>
                      </div>
                    </div>
                    <button style={{
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '15px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}>
                      👋 Wave
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Challenges */}
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#2E7D32' }}>
                Team Challenges
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏫</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>School Rivalry</h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>
                    Blacksburg vs Christiansburg
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Blacksburg High</div>
                    <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '5px', height: '6px' }}>
                      <div style={{ background: 'white', height: '100%', borderRadius: '5px', width: '65%' }}></div>
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>2,847 pts</div>
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Friend Challenge</h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>
                    Complete 5 projects with friends
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Progress</div>
                    <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '5px', height: '6px' }}>
                      <div style={{ background: 'white', height: '100%', borderRadius: '5px', width: '40%' }}></div>
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>2/5 projects</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32' }}>
              🎯 Weekly Challenges
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {[
                {
                  id: 1,
                  title: "Streak Master",
                  description: "Volunteer 3 weeks in a row",
                  icon: "🔥",
                  progress: 2,
                  total: 3,
                  reward: "50 points",
                  color: "linear-gradient(135deg, #FF6B6B, #FF8E53)"
                },
                {
                  id: 2,
                  title: "Community Helper",
                  description: "Complete 2 community service projects",
                  icon: "🤝",
                  progress: 1,
                  total: 2,
                  reward: "75 points",
                  color: "linear-gradient(135deg, #4ECDC4, #44A08D)"
                },
                {
                  id: 3,
                  title: "Education Champion",
                  description: "Volunteer 5 hours in education",
                  icon: "📚",
                  progress: 4,
                  total: 5,
                  reward: "100 points",
                  color: "linear-gradient(135deg, #A8E6CF, #7FCDCD)"
                },
                {
                  id: 4,
                  title: "Weekend Warrior",
                  description: "Complete a project on both weekend days",
                  icon: "⚡",
                  progress: 0,
                  total: 1,
                  reward: "25 points",
                  color: "linear-gradient(135deg, #FFD93D, #FF6B6B)"
                }
              ].map(challenge => (
                <div key={challenge.id} style={{
                  background: challenge.color,
                  color: 'white',
                  padding: '2rem',
                  borderRadius: '15px',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{challenge.icon}</div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{challenge.title}</h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                    {challenge.description}
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Progress</div>
                    <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '5px', height: '8px', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        background: 'white', 
                        height: '100%', 
                        borderRadius: '5px', 
                        width: `${(challenge.progress / challenge.total) * 100}%` 
                      }}></div>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                      {challenge.progress}/{challenge.total}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                    🎁 Reward: {challenge.reward}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trophies Tab */}
        {activeTab === 'trophies' && (
          <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32' }}>
              🏆 Trophies & Certificates
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                  Food Bank Volunteer
                </h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  4 hours • November 30, 2025
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    📥 Download PDF
                  </button>
                  <button style={{
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    📤 Share
                  </button>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                  Senior Center Activities
                </h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  2.5 hours • November 25, 2025
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    📥 Download PDF
                  </button>
                  <button style={{
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    📤 Share
                  </button>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                  Tutoring Program
                </h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  6 hours • November 15, 2025
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    📥 Download PDF
                  </button>
                  <button style={{
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    📤 Share
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
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

export default ProfilePage;
