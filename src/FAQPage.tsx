import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';

const FAQPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error getting user:', error);
      setIsAuthenticated(false);
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

  const handleSignInClick = () => {
    window.location.href = '/app';
  };

  const faqSections = [
    {
      title: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign In' in the top navigation, then 'Create Account' to register with your email address. You'll need to complete your profile after signing up."
        },
        {
          q: "What information do I need to provide?",
          a: "You'll need your name, school, grade level, phone number, and interests. This helps us match you with relevant volunteer opportunities."
        },
        {
          q: "How do I find volunteer projects?",
          a: "Browse the 'Projects' page to see all available opportunities. You can filter by category, location, or date to find projects that interest you."
        }
      ]
    },
    {
      title: "Volunteer Hour Tracking",
      questions: [
        {
          q: "How do I log volunteer hours?",
          a: "After joining a project, go to 'My Projects' → 'Joined' tab. You'll see an hour logging form where you can enter the hours you've completed. You can log hours multiple times for the same project."
        },
        {
          q: "Is there a limit to how many hours I can log?",
          a: "Yes, you cannot log more hours than the project's stated duration. For example, if a project is 4 hours long, you can only log up to 4 hours total for that project."
        },
        {
          q: "What if I volunteer more hours than the project duration?",
          a: "The system prevents you from logging more hours than the project's duration to maintain accuracy. If you need to log additional hours, contact the project organizer or submit a new project."
        },
        {
          q: "Can I edit my logged hours?",
          a: "Currently, you cannot edit logged hours once submitted. Make sure to enter the correct number of hours when logging. If you made an error, contact support."
        }
      ]
    },
    {
      title: "Project Completion",
      questions: [
        {
          q: "How do I mark a project as completed?",
          a: "In 'My Projects' → 'Joined' tab, click the 'Mark Complete' button when you've finished volunteering. This updates your project completion count and may unlock achievements."
        },
        {
          q: "What's the difference between logging hours and completing a project?",
          a: "Logging hours records your volunteer time, while completing a project marks the entire project as finished. You should log hours throughout the project and mark it complete when done."
        },
        {
          q: "Can I complete a project without logging hours?",
          a: "No, you must log at least some volunteer hours before you can mark a project as complete. This ensures you get proper credit for your volunteer work and earn points for your time. The system requires you to log hours to track your impact and unlock achievements."
        }
      ]
    },
    {
      title: "Points, Levels & Achievements",
      questions: [
        {
          q: "How do I earn points?",
          a: "You earn 10 points for every hour you volunteer. Points are automatically calculated when you log hours and are updated in real-time."
        },
        {
          q: "What are levels and how do I level up?",
          a: "Levels are based on your total points: Level 1 (0-100 pts), Level 2 (101-200 pts), Level 3 (201-300 pts), etc. You level up automatically as you earn more points."
        },
        {
          q: "What are achievements and how do I unlock them?",
          a: "Achievements are special badges you earn for reaching milestones like 'First Project' (1 completed project), 'Hour Hero' (10+ hours), or 'Volunteer Star' (25+ hours). They unlock automatically when you meet the requirements."
        },
        {
          q: "Where can I see my achievements?",
          a: "Go to your 'Profile' page to see all your earned achievements, current level, total points, and volunteer statistics."
        }
      ]
    },
    {
      title: "Project Submission",
      questions: [
        {
          q: "How do I submit a new volunteer project?",
          a: "Click 'Submit New Project' on the Projects page, fill out the project details form, and submit. Your project will be reviewed by administrators before going live."
        },
        {
          q: "How long does project approval take?",
          a: "Project approval typically takes 1-3 business days. You'll receive a notification when your project is approved or if any changes are needed."
        },
        {
          q: "Can I edit my submitted project?",
          a: "Yes, you can edit your project if it's still pending approval. Go to 'My Projects' → 'Submitted' tab and click 'Edit' on pending projects."
        },
        {
          q: "What happens if my project is rejected?",
          a: "If your project is rejected, you'll receive feedback on why. You can make the suggested changes and resubmit, or contact support for more information."
        }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Navigation */}
      <nav style={{
        background: 'linear-gradient(135deg, #4CAF50, #2196F3)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🤝</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Project rush</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Home</a>
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
          {isAuthenticated && (
            <>
              <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Profile</a>
            </>
          )}
          <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
          <a href="/faq" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>FAQ</a>
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
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2E7D32',
            marginBottom: '1rem'
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Everything you need to know about using Project rush
          </p>
        </div>

        {/* FAQ Sections */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '2rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#2E7D32',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '0.5rem'
              }}>
                {section.title}
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {section.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    background: '#f9fafb'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: '#4CAF50' }}>❓</span>
                      {faq.q}
                    </h3>
                    <p style={{
                      color: '#666',
                      lineHeight: '1.6',
                      margin: '0',
                      fontSize: '0.95rem'
                    }}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        background: '#2E7D32',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        marginTop: '3rem'
      }}>
        <p style={{ margin: '0', opacity: 0.9 }}>
          © 2024 Project rush. Making a difference, one volunteer at a time.
        </p>
      </footer>
    </div>
  );
};

export default FAQPage;
