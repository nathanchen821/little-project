import React, { useState, useEffect } from 'react';
import { signOut as amplifySignOut } from 'aws-amplify/auth';
import { getOrCreateUserProfile, getUserAchievementData, type UserProfile } from './utils/userProfile';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

const ResumePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [volunteerActivities, setVolunteerActivities] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await getOrCreateUserProfile();
      
      if (profile) {
        setUserProfile(profile);

        // Load achievements
        const achievementData = await getUserAchievementData(profile.id);
        setAchievements(achievementData);

        // Load volunteer activities
        await loadVolunteerActivities(profile.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      window.location.href = '/app';
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteerActivities = async (userId: string) => {
    try {
      // Query volunteer activities for this user
      const { data: activities } = await client.models.VolunteerActivity.list({
        filter: { userId: { eq: userId } }
      });

      if (activities) {
        setVolunteerActivities(activities);

        // Get completed projects
        const completedActivities = activities.filter(activity => activity.status === 'Completed');
        const completedProjectIds = completedActivities.map(activity => activity.projectId);
        
        // Fetch project details for completed projects
        const { data: allProjects } = await client.models.Project.list();
        const completedProjects = allProjects?.filter(p => completedProjectIds.includes(p.id)) || [];
        
        // Sort by completion date (newest first)
        const sortedCompletedProjects = completedProjects.sort((a, b) => {
          const activityA = completedActivities.find(va => va.projectId === a.id);
          const activityB = completedActivities.find(va => va.projectId === b.id);
          if (!activityA || !activityB) return 0;
          return new Date(activityB.completedAt || activityB.updatedAt).getTime() - 
                 new Date(activityA.completedAt || activityA.updatedAt).getTime();
        });

        setCompletedProjects(sortedCompletedProjects);
      }
    } catch (error) {
      console.error('Error loading volunteer activities:', error);
    }
  };

  // (removed unused weeks-of-activity helper)

  const handleSignOutClick = async () => {
    try {
      await amplifySignOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Simple PDF generation using browser's print to PDF
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Education': '📚',
      'Community': '🤝',
      'Environment': '🌱',
      'Health': '🏥',
      'Technology': '💻',
      'Arts': '🎨',
      'Sports': '⚽',
      'Animals': '🐾'
    };
    return icons[category] || '📋';
  };

  // Build a human-friendly summary of top volunteer categories from completed projects
  const getCategorySummary = (): { listText: string; uniqueCount: number } => {
    const categories = (completedProjects || [])
      .map((p: any) => p?.category)
      .filter((c: any): c is string => Boolean(c));

    const counts = new Map<string, number>();
    categories.forEach((c) => counts.set(c, (counts.get(c) || 0) + 1));

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    const top = sorted.slice(0, 3);

    const uniqueCount = counts.size;

    let listText = '';
    if (top.length === 1) {
      listText = top[0];
    } else if (top.length === 2) {
      listText = `${top[0]} and ${top[1]}`;
    } else if (top.length >= 3) {
      listText = `${top[0]}, ${top[1]}, and ${top[2]}`;
    }

    return { listText, uniqueCount };
  };

  // Build example project list (up to 2 titles)
  const getExampleProjects = (): string => {
    const titles = (completedProjects || [])
      .map((p: any) => p?.title)
      .filter((t: any): t is string => Boolean(t));
    if (titles.length === 0) return '';
    const top = titles.slice(0, 2);
    if (top.length === 1) return top[0];
    return `${top[0]} and ${top[1]}`;
  };

  // Summarize skills from projects; fallback to profile interests
  const getSkillsSummary = (): string => {
    const skillsFromProjects = new Set<string>();
    (completedProjects || []).forEach((p: any) => {
      if (Array.isArray(p?.skills)) {
        p.skills.forEach((s: any) => { if (s && typeof s === 'string') skillsFromProjects.add(s); });
      }
    });
    let skills: string[] = Array.from(skillsFromProjects);
    if (skills.length === 0 && Array.isArray(userProfile?.interests)) {
      skills = userProfile!.interests.filter((i: any): i is string => Boolean(i));
    }
    const top = skills.slice(0, 3);
    if (top.length === 0) return '';
    if (top.length === 1) return top[0];
    if (top.length === 2) return `${top[0]} and ${top[1]}`;
    return `${top[0]}, ${top[1]}, and ${top[2]}`;
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
        <div style={{ fontSize: '1.5rem', color: '#666' }}>Loading your resume...</div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

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
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Home</a>
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
          <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
          <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Profile</a>
          <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
          <a href="/faq" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>FAQ</a>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownloadPDF}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              📄 PDF
            </button>
          </div>
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

      {/* Resume Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        background: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        borderRadius: '10px',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Header */}
        <header style={{
          textAlign: 'center',
          paddingBottom: '2rem',
          borderBottom: '3px solid #4CAF50',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            color: '#2E7D32',
            fontWeight: 'bold'
          }}>
            {userProfile.firstName} {userProfile.lastName}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '0.5rem'
          }}>
            {userProfile.school} • {userProfile.grade}
          </p>
          {userProfile.bio && (
            <p style={{
              fontSize: '1rem',
              color: '#666',
              fontStyle: 'italic',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              "{userProfile.bio}"
            </p>
          )}
        </header>

        

        {/* Volunteer Summary */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#2E7D32',
            marginBottom: '1rem',
            borderBottom: '2px solid #4CAF50',
            paddingBottom: '0.5rem'
          }}>
            Volunteer Summary
          </h2>
          {(() => {
            const weeks = userProfile.currentStreak || 0;
            const { listText: categoriesText } = getCategorySummary();
            const exampleProjects = getExampleProjects();
            const skillsText = getSkillsSummary();
            const parts: string[] = [];
            parts.push(`Over ${userProfile.totalHours || 0} volunteer hours across ${userProfile.totalProjects || 0} completed projects over approximately ${weeks} weeks.`);
            if (categoriesText) parts.push(`Experience includes work in ${categoriesText}.`);
            if (exampleProjects) parts.push(`Representative projects: ${exampleProjects}.`);
            if (skillsText) parts.push(`Skills applied: ${skillsText}.`);
            return (
              <div style={{
                background: '#f8f9fa',
                padding: '1.25rem 1.5rem',
                borderRadius: '8px',
                color: '#374151',
                fontSize: '1rem'
              }}>
                {parts.join(' ')}
              </div>
            );
          })()}
        </section>

        {/* Volunteer Experience */}
        {completedProjects.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#2E7D32',
              marginBottom: '1rem',
              borderBottom: '2px solid #4CAF50',
              paddingBottom: '0.5rem'
            }}>
              Volunteer Experience
            </h2>
            {completedProjects.map((project) => {
              const activity = volunteerActivities.find(va => va.projectId === project.id);
              return (
                <div key={project.id} style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#f8f9fa'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      color: '#2E7D32',
                      margin: 0
                    }}>
                      {getCategoryIcon(project.category || 'General')} {project.title}
                    </h3>
                  </div>
                  <p style={{
                    color: '#666',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem'
                  }}>
                    {project.description}
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    <div>
                      <strong>Category:</strong> {project.category}
                    </div>
                    <div>
                      <strong>Location:</strong> {project.city}, {project.state}
                    </div>
                    <div>
                      <strong>Hours:</strong> {activity?.hoursLogged || 0}
                    </div>
                    <div>
                      <strong>Completed:</strong> {activity?.completedAt ? formatDate(activity.completedAt) : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Achievements */}
        {achievements.filter(a => a.isEarned).length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#2E7D32',
              marginBottom: '1rem',
              borderBottom: '2px solid #4CAF50',
              paddingBottom: '0.5rem'
            }}>
              Achievements & Recognition
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {achievements.filter(a => a.isEarned).map((achievement, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #E8F5E8, #E3F2FD)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {achievement.icon || '🏆'}
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#2E7D32',
                    marginBottom: '0.25rem'
                  }}>
                    {achievement.name}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    {achievement.completedAt ? formatDate(achievement.completedAt) : 'Earned'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Interests */}
        {(userProfile.interests && userProfile.interests.length > 0) && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#2E7D32',
              marginBottom: '1rem',
              borderBottom: '2px solid #4CAF50',
              paddingBottom: '0.5rem'
            }}>
              Interests & Skills
            </h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {userProfile.interests.map((interest, index) => (
                <span key={index} style={{
                  background: '#4CAF50',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '15px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          paddingTop: '2rem',
          borderTop: '2px solid #4CAF50',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          <p>
            This resume was generated by Little Project - Volunteer Management Platform
          </p>
          <p>
            Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </footer>
      </main>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white !important;
            }
            
            nav {
              display: none !important;
            }
            
            main {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 1rem !important;
              max-width: none !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            @page {
              margin: 0.5in;
              size: A4;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ResumePage;
