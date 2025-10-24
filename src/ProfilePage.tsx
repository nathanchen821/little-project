import React, { useState, useEffect } from 'react';
import { signOut as amplifySignOut } from 'aws-amplify/auth';
import { getOrCreateUserProfile, getUserStats, isProfileComplete, getUserAchievementData, type UserProfile } from './utils/userProfile';
import { seedAchievements, checkAchievementsExist } from './utils/seedAchievements';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await getOrCreateUserProfile();
      
      if (profile) {
        setUserProfile(profile);

        // Check if profile is complete, redirect if not
        if (!isProfileComplete(profile)) {
          window.location.href = '/complete-profile';
          return;
        }

        // Load user stats
        const stats = await getUserStats(profile.id);
        setUserStats(stats);

        // Load achievements
        await loadAchievements(profile.id);
        
        // Load recent activities
        await loadRecentActivities(profile.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      window.location.href = '/app';
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async (userId: string) => {
    try {
      setAchievementsLoading(true);
      
      // Check if achievements exist, if not, seed them
      const achievementsExist = await checkAchievementsExist();
      if (!achievementsExist) {
        console.log('No achievements found, seeding sample achievements...');
        await seedAchievements();
      }
      
      const achievementData = await getUserAchievementData(userId);
      setAchievements(achievementData);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
    } finally {
      setAchievementsLoading(false);
    }
  };

  const loadRecentActivities = async (userId: string) => {
    try {
      
      // Fetch user's volunteer activities
      const { data: activities } = await client.models.VolunteerActivity.list({
        filter: { userId: { eq: userId } }
      });
      
      console.log('User activities:', activities);
      
      // Debug: List all projects to see what's available
      const { data: allProjects } = await client.models.Project.list();
      console.log('All projects in database:', allProjects);
      
      // Fetch project details for activities
      const projectIds = [...new Set(activities?.map(a => a.projectId) || [])];
      console.log('Project IDs to fetch:', projectIds);
      
      let projects = [];
      
      // Fetch projects one by one since 'in' filter is not available
      for (const projectId of projectIds) {
        try {
          const { data: project } = await client.models.Project.get({ id: projectId });
          if (project) {
            console.log('Fetched project:', project.title, 'ID:', project.id);
            projects.push(project);
          }
        } catch (error) {
          console.error(`Error fetching project ${projectId}:`, error);
        }
      }
      
      const projectMap = new Map();
      projects.forEach(project => {
        projectMap.set(project.id, project);
      });
      
      console.log('Project map:', projectMap);
      
      // Create activity feed from volunteer activities
      const activityFeed = activities?.map(activity => {
        const project = projectMap.get(activity.projectId);
        const activityDate = new Date(activity.joinedAt || activity.createdAt || '');
        
        console.log('Activity:', activity.id, 'Project ID:', activity.projectId, 'Project:', project?.title || 'NOT FOUND');
        
        return {
          id: activity.id,
          type: activity.status,
          title: getActivityTitle(activity.status, project?.title || 'Unknown Project'),
          description: getActivityDescription(activity.status, project?.title || 'Unknown Project', activity.hoursVerified || 0),
          date: activityDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          hours: activity.hoursVerified || 0,
          category: project?.category || 'General',
          projectTitle: project?.title || 'Unknown Project',
          status: activity.status,
          completedAt: activity.completedAt,
          joinedAt: activity.joinedAt
        };
      }).sort((a, b) => {
        // Sort by most recent first
        const dateA = new Date(a.joinedAt || a.completedAt || '');
        const dateB = new Date(b.joinedAt || b.completedAt || '');
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 10); // Show only last 10 activities
      
      setRecentActivities(activityFeed || []);
    } catch (error) {
      console.error('Error loading recent activities:', error);
      setRecentActivities([]);
    }
  };

  const getActivityTitle = (status: string, projectTitle: string) => {
    switch (status) {
      case 'Joined':
        return `Joined ${projectTitle}`;
      case 'In Progress':
        return `Started ${projectTitle}`;
      case 'Completed':
        return `Completed ${projectTitle}`;
      default:
        return `Updated ${projectTitle}`;
    }
  };

  const getActivityDescription = (status: string, projectTitle: string, hours: number) => {
    switch (status) {
      case 'Joined':
        return `You joined the volunteer project "${projectTitle}"`;
      case 'In Progress':
        return `You started volunteering at "${projectTitle}"`;
      case 'Completed':
        return `You completed volunteering at "${projectTitle}"${hours > 0 ? ` with ${hours} hours` : ''}`;
      default:
        return `Activity update for "${projectTitle}"`;
    }
  };

  const getActivityIcon = (status: string, category: string) => {
    if (status === 'Completed') return '✅';
    if (status === 'In Progress') return '🔄';
    if (status === 'Joined') return '👋';
    if (category === 'Education') return '📚';
    if (category === 'Community') return '🤝';
    return '📋';
  };

  const getActivityIconBackground = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'linear-gradient(135deg, #4CAF50, #45a049)';
      case 'In Progress':
        return 'linear-gradient(135deg, #FF9800, #F57C00)';
      case 'Joined':
        return 'linear-gradient(135deg, #2196F3, #1976D2)';
      default:
        return 'linear-gradient(135deg, #9E9E9E, #757575)';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#4CAF50';
      case 'In Progress':
        return '#FF9800';
      case 'Joined':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const getActivityStatusText = (status: string) => {
    switch (status) {
      case 'Completed':
        return '✅ Completed';
      case 'In Progress':
        return '🔄 In Progress';
      case 'Joined':
        return '👋 Joined';
      default:
        return '📋 Updated';
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8f9fa'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#666' }}>Loading your profile...</div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  // Format achievement data for display
  const formatAchievementDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatProgress = (achievement: any) => {
    if (achievement.isEarned) {
      return `Earned ${formatAchievementDate(achievement.completedAt)}`;
    } else if (achievement.status === 'In Progress') {
      // Format progress based on achievement type
      if (achievement.type === 'Hours') {
        return `${achievement.progress}/${achievement.target} hours`;
      } else if (achievement.type === 'Projects') {
        return `${achievement.progress}/${achievement.target} projects`;
      } else if (achievement.type === 'Streak') {
        return `${achievement.progress}/${achievement.target} weeks`;
      } else {
        return `${achievement.progress}/${achievement.target}`;
      }
    } else {
      return 'Not Started';
    }
  };

  // Real activities are now loaded from the database

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
                {userProfile.firstName} {userProfile.lastName}
              </h2>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                {userProfile.school} • {userProfile.grade}
              </p>
              {userProfile.bio && (
                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  "{userProfile.bio}"
                </p>
              )}
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#666' }}>
                <span>⏱️ {userProfile.totalHours} hours</span>
                <span>📋 {userProfile.totalProjects} projects</span>
                <span>⭐ {userProfile.points} points</span>
                <span>🔥 {userProfile.currentStreak} week streak</span>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/complete-profile'}
              style={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
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
                      Level {userProfile.level}
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
                        width: `${Math.min((userProfile.points % 100) / 100 * 100, 100)}%`
                      }}></div>
                    </div>
                    <small style={{ color: '#666' }}>{100 - (userProfile.points % 100)} points to next level</small>
                  </div>
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏅</div>
                    <h3 style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                      --
                    </h3>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>Overall Ranking</p>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Check leaderboard
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥</div>
                    <h3 style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                      {userProfile.currentStreak}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>Week Streak</p>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {userProfile.currentStreak > 0 ? 'Keep it going!' : 'Start your streak!'}
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
                    {userProfile.totalHours}
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
                      width: `${Math.min((userProfile.totalHours / 50) * 100, 100)}%`
                    }}></div>
                  </div>
                  <small style={{ color: '#666' }}>Goal: 50 hours</small>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                    {userProfile.totalProjects}
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
                      width: `${Math.min((userProfile.totalProjects / 10) * 100, 100)}%`
                    }}></div>
                  </div>
                  <small style={{ color: '#666' }}>Goal: 10 projects</small>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '0.5rem' }}>
                    {userStats?.completedAchievements || 0}
                  </h3>
                  <p style={{ color: '#666', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Achievements Earned
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
                      width: `${Math.min(((userStats?.completedAchievements || 0) / 10) * 100, 100)}%`
                    }}></div>
                  </div>
                  <small style={{ color: '#666' }}>Goal: 10 achievements</small>
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
                {recentActivities.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#666'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                      No Recent Activity
                    </h3>
                    <p>Start volunteering to see your activity here!</p>
                  </div>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div key={activity.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 0',
                      borderBottom: index < recentActivities.length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}>
                      <div style={{
                        fontSize: '2rem',
                        background: getActivityIconBackground(activity.status),
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {getActivityIcon(activity.status, activity.category)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '0.5rem', color: '#2E7D32' }}>
                          {activity.title}
                        </h4>
                        <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                          {activity.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                          <span>📅 {activity.date}</span>
                          {activity.hours > 0 && <span>⏱️ {activity.hours} hours</span>}
                          <span>🏷️ {activity.category}</span>
                        </div>
                      </div>
                      <span style={{
                        background: getActivityStatusColor(activity.status),
                        color: 'white',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {getActivityStatusText(activity.status)}
                      </span>
                    </div>
                  ))
                )}
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
            {achievementsLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem',
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading achievements...</div>
              </div>
            ) : achievements.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '4rem',
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2E7D32' }}>
                  No Achievements Available
                </h3>
                <p style={{ color: '#666', marginBottom: '0' }}>
                  Start volunteering to unlock achievements and earn badges!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                {achievements.map(achievement => (
                  <div key={achievement.id} style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '2rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    border: achievement.isEarned ? '2px solid #4CAF50' : '2px solid #e2e8f0',
                    opacity: achievement.isEarned ? 1 : 0.7
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {achievement.icon}
                    </div>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#2E7D32' }}>
                      {achievement.name}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>
                      {achievement.description}
                    </p>
                    {achievement.isEarned ? (
                      <span style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        ✅ {formatProgress(achievement)}
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
                        🔒 {formatProgress(achievement)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
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
