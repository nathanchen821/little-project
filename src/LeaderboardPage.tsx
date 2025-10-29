import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';
import { getLeaderboard, getLeaderboardStats, type LeaderboardEntry } from './services/leaderboardService';

const LeaderboardPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('hours');
  const [timeframe, setTimeframe] = useState('all-time');
  const [user, setUser] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalSchools: 0,
    totalHours: 0,
    totalProjects: 0,
    totalPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
    loadLeaderboardData();
  }, []);

  useEffect(() => {
    loadLeaderboardData();
  }, [activeCategory]);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error getting user:', error);
      // Don't redirect - allow unauthenticated access
      setUser(null);
    }
  };

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load leaderboard data for current category
      const leaderboard = await getLeaderboard(activeCategory as 'hours' | 'projects' | 'streak' | 'points');
      setLeaderboardData(leaderboard);

      // Load school competition data (commented out since School Competition is hidden)
      // const schools = await getSchoolCompetition();
      // setSchoolData(schools);

      // Load statistics
      const leaderboardStats = await getLeaderboardStats();
      setStats(leaderboardStats);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      setError('Failed to load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
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


  const categories = [
    { id: 'hours', label: 'Hours', icon: '⏱️' },
    { id: 'projects', label: 'Projects', icon: '📋' },
    { id: 'streak', label: 'Streak', icon: '🔥' },
    { id: 'points', label: 'Points', icon: '⭐' }
  ];

  const timeframes = [
    { id: 'all-time', label: 'All Time' },
    { id: 'month', label: 'This Month' },
    { id: 'week', label: 'This Week' }
  ];

  const currentData = leaderboardData;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#666';
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
          {user && (
            <>
              <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Profile</a>
            </>
          )}
          <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>Leaderboard</a>
          <a href="/faq" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>FAQ</a>
          {user ? (
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
            <a href="/app" style={{
              background: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Sign In
            </a>
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
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: '#2E7D32'
          }}>
            🏆 Leaderboard
          </h1>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '0',
            color: '#666'
          }}>
            See how you stack up against other volunteers in your community
          </p>
        </header>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={{
                background: activeCategory === category.id ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'white',
                color: activeCategory === category.id ? 'white' : '#666',
                border: activeCategory === category.id ? 'none' : '2px solid #e2e8f0',
                padding: '1rem 2rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: activeCategory === category.id ? '0 4px 15px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Timeframe Filter */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {timeframes.map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              style={{
                background: timeframe === tf.id ? 'linear-gradient(135deg, #2196F3, #1976D2)' : 'white',
                color: timeframe === tf.id ? 'white' : '#666',
                border: timeframe === tf.id ? 'none' : '2px solid #e2e8f0',
                padding: '0.8rem 1.5rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s',
                boxShadow: timeframe === tf.id ? '0 4px 15px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <section style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ color: '#666' }}>Loading leaderboard...</h2>
          </section>
        )}

        {/* Error State */}
        {error && (
          <section style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error Loading Leaderboard</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={loadLeaderboardData}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
          </section>
        )}

        {/* Leaderboard */}
        {!loading && !error && (
          <section style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '1.8rem', color: '#2E7D32', margin: 0 }}>
              Top Volunteers - {categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <span>📊 {stats.totalVolunteers} volunteers</span>
              <span>🏫 {stats.totalSchools} schools</span>
            </div>
          </div>

          {/* Empty State */}
          {currentData.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#666'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Data Available</h3>
              <p>No volunteers found for this category. Be the first to volunteer!</p>
            </div>
          )}

          {/* Top 3 Podium */}
          {currentData.length > 0 && currentData.slice(0, 3).map((person, index) => (
            <div key={person.rank} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1.5rem',
              marginBottom: '1rem',
              background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 
                         index === 1 ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' : 
                         'linear-gradient(135deg, #CD7F32, #B8860B)',
              borderRadius: '15px',
              color: 'white',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.3s'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                minWidth: '3rem',
                textAlign: 'center'
              }}>
                {getRankIcon(person.rank)}
              </div>
              <div style={{ fontSize: '3rem' }}>
                {person.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {person.name}
                </h3>
                <p style={{ fontSize: '1rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                  {person.school}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                  <span>🔥 {person.currentStreak} week streak</span>
                  <span>⭐ {person.points} points</span>
                </div>
              </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {activeCategory === 'hours' ? `${person.totalHours}h` :
                     activeCategory === 'projects' ? `${person.totalProjects}` :
                     activeCategory === 'streak' ? `${person.currentStreak}w` :
                     `${person.points}`}
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>
                    {person.badge}
                  </div>
                </div>
            </div>
          ))}

          {/* Rest of the leaderboard */}
          {currentData.length > 3 && (
            <div style={{ marginTop: '2rem' }}>
              {currentData.slice(3).map((person) => (
              <div key={person.rank} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                marginBottom: '0.5rem',
                background: 'white',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.borderColor = '#4CAF50';
                e.currentTarget.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateX(0)';
              }}>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  minWidth: '2rem',
                  textAlign: 'center',
                  color: getRankColor(person.rank)
                }}>
                  {getRankIcon(person.rank)}
                </div>
                <div style={{ fontSize: '2rem' }}>
                  {person.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: '#2E7D32' }}>
                    {person.name}
                  </h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem', color: '#666' }}>
                    {person.school}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#666' }}>
                    <span>🔥 {person.currentStreak}w</span>
                    <span>⭐ {person.points}p</span>
                    <span>⏱️ {person.totalHours}h</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
                    {activeCategory === 'hours' ? `${person.totalHours}h` :
                     activeCategory === 'projects' ? `${person.totalProjects}` :
                     activeCategory === 'streak' ? `${person.currentStreak}w` :
                     `${person.points}`}
                  </div>
                  <div style={{ fontSize: '1.2rem' }}>
                    {person.badge}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </section>
        )}

        {/* School Competition - Hidden for now */}
        {/* 
        <section style={{
          background: 'white',
          borderRadius: '15px',
          padding: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32', textAlign: 'center' }}>
            🏫 School Competition
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {schoolData.map((school, index) => (
              <div key={school.school} style={{
                background: index === 0 ? 'linear-gradient(135deg, #4CAF50, #45a049)' :
                           index === 1 ? 'linear-gradient(135deg, #2196F3, #1976D2)' :
                           'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                color: 'white',
                padding: '2rem',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{school.school}</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {school.totalPoints.toLocaleString()}
                </div>
                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Points</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem' }}>
                  <span>👥 {school.volunteers} volunteers</span>
                  <span>⏱️ {school.totalHours} hours</span>
                  <span>📋 {school.totalProjects} projects</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        */}

        {/* Weekly Challenges */}
        <section style={{
          background: 'white',
          borderRadius: '15px',
          padding: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#2E7D32', textAlign: 'center' }}>
            🎯 Weekly Challenges
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Streak Master</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>
                Volunteer 3 weeks in a row
              </p>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Progress</div>
                <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '5px', height: '6px' }}>
                  <div style={{ background: 'white', height: '100%', borderRadius: '5px', width: '60%' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>2/3 weeks</div>
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌟</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Community Helper</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>
                Complete 2 community service projects
              </p>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Progress</div>
                <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '5px', height: '6px' }}>
                  <div style={{ background: 'white', height: '100%', borderRadius: '5px', width: '50%' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>1/2 projects</div>
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #A8E6CF, #7FCDCD)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Education Champion</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>
                Volunteer 5 hours in education
              </p>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Progress</div>
                <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '5px', height: '6px' }}>
                  <div style={{ background: 'white', height: '100%', borderRadius: '5px', width: '80%' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>4/5 hours</div>
              </div>
            </div>
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

export default LeaderboardPage;

