import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { getOrCreateUserProfile } from './utils/userProfile';

const client = generateClient<Schema>();

interface Project {
  id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  city?: string;
  state?: string;
  startDate: string;
  duration?: number;
  currentVolunteers?: number;
  maxVolunteers?: number;
  spotsAvailable?: number;
  status?: string;
  isApproved?: boolean;
  images?: string[];
  createdAt: string;
}

const MyProjectsPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<Project[]>([]);
  const [myJoinedProjects, setMyJoinedProjects] = useState<Project[]>([]);
  const [myCompletedProjects, setMyCompletedProjects] = useState<Project[]>([]);
  const [volunteerActivities, setVolunteerActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submitted' | 'joined' | 'completed'>('joined');
  const [unjoinLoading, setUnjoinLoading] = useState<string | null>(null);
  const [completingProject, setCompletingProject] = useState<string | null>(null);
  const [loggingHours, setLoggingHours] = useState<string | null>(null);
  const [hoursInput, setHoursInput] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  useEffect(() => {
    checkAuthState();
  }, []);
  
  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
      await loadMySubmissions();
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const loadMySubmissions = async () => {
    try {
      setLoading(true);
      
      // Get current user profile
      const userProfile = await getOrCreateUserProfile();
      if (!userProfile) {
        console.error('No user profile found');
        setLoading(false);
        return;
      }
      
      // Check if user is admin
      if (userProfile.isAdmin) {
        setIsAdmin(true);
      }
      
      // Query projects where createdById === current user's id (submitted projects)
      const { data: allProjects, errors } = await client.models.Project.list();
      
      if (errors) {
        console.error('Error fetching projects:', errors);
        setLoading(false);
        return;
      }
      
      // Filter projects created by this user
      const userProjects = allProjects?.filter(p => p.createdById === userProfile.id) || [];
      
      // Sort by creation date (newest first)
      const sortedProjects = userProjects.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setMySubmissions(sortedProjects as Project[]);
      
      // Load joined projects from VolunteerActivity
      await loadJoinedProjects(userProfile.id);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setLoading(false);
    }
  };

  const loadJoinedProjects = async (userId: string) => {
    try {
      // Query volunteer activities for this user
      const { data: volunteerActivities, errors } = await client.models.VolunteerActivity.list({
        filter: { userId: { eq: userId } }
      });
      
      if (errors) {
        console.error('Error fetching volunteer activities:', errors);
        return;
      }
      
      if (!volunteerActivities || volunteerActivities.length === 0) {
        setMyJoinedProjects([]);
        setMyCompletedProjects([]);
        setVolunteerActivities([]);
        return;
      }
      
      // Store volunteer activities for later use
      setVolunteerActivities(volunteerActivities);
      
      // Separate joined and completed activities
      const joinedActivities = volunteerActivities.filter(activity => activity.status !== 'Completed');
      const completedActivities = volunteerActivities.filter(activity => activity.status === 'Completed');
      
      // Get project IDs from volunteer activities
      const joinedProjectIds = joinedActivities.map(activity => activity.projectId);
      const completedProjectIds = completedActivities.map(activity => activity.projectId);
      
      // Fetch project details for joined projects
      const { data: allProjects } = await client.models.Project.list();
      const joinedProjects = allProjects?.filter(p => joinedProjectIds.includes(p.id)) || [];
      const completedProjects = allProjects?.filter(p => completedProjectIds.includes(p.id)) || [];
      
      // Sort joined projects by join date (newest first)
      const sortedJoinedProjects = joinedProjects.sort((a, b) => {
        const activityA = joinedActivities.find(va => va.projectId === a.id);
        const activityB = joinedActivities.find(va => va.projectId === b.id);
        if (!activityA || !activityB) return 0;
        return new Date(activityB.joinedAt || activityB.createdAt).getTime() - 
               new Date(activityA.joinedAt || activityA.createdAt).getTime();
      });
      
      // Sort completed projects by completion date (newest first)
      const sortedCompletedProjects = completedProjects.sort((a, b) => {
        const activityA = completedActivities.find(va => va.projectId === a.id);
        const activityB = completedActivities.find(va => va.projectId === b.id);
        if (!activityA || !activityB) return 0;
        return new Date(activityB.completedAt || activityB.updatedAt).getTime() - 
               new Date(activityA.completedAt || activityA.updatedAt).getTime();
      });
      
      setMyJoinedProjects(sortedJoinedProjects as Project[]);
      setMyCompletedProjects(sortedCompletedProjects as Project[]);
    } catch (error) {
      console.error('Error loading joined projects:', error);
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

  const handleCompleteProject = async (projectId: string) => {
    setCompletingProject(projectId);
    setNotification(null);

    try {
      // Get current user profile
      const { getOrCreateUserProfile } = await import('./utils/userProfile');
      const userProfile = await getOrCreateUserProfile();
      
      if (!userProfile) {
        setNotification({ type: 'error', message: 'User profile not found. Please try again.' });
        return;
      }

      // Find the volunteer activity for this project
      const activity = volunteerActivities.find(va => va.projectId === projectId && va.userId === userProfile.id);
      if (!activity) {
        setNotification({ type: 'error', message: 'Volunteer activity not found.' });
        return;
      }

      // Validate that hours have been logged before allowing completion
      if ((activity.hoursLogged || 0) === 0) {
        setNotification({ type: 'error', message: 'You must log at least some volunteer hours before marking this project as complete.' });
        return;
      }

      // Update the volunteer activity to completed
      const { errors } = await client.models.VolunteerActivity.update({
        id: activity.id,
        status: 'Completed',
        completedAt: new Date().toISOString()
      });

      if (errors) {
        console.error('Error completing project:', errors);
        setNotification({ type: 'error', message: 'Failed to complete project. Please try again.' });
        return;
      }

      // Update user statistics
      await updateUserStats(userProfile.id);

      setNotification({ type: 'success', message: 'Project completed successfully! Your hours have been recorded.' });
      
      // Reload joined projects to reflect changes
      await loadJoinedProjects(userProfile.id);
      
    } catch (error) {
      console.error('Error completing project:', error);
      setNotification({ type: 'error', message: 'Failed to complete project. Please try again.' });
    } finally {
      setCompletingProject(null);
    }
  };

  const handleLogHours = async (projectId: string) => {
    setLoggingHours(projectId);
    setNotification(null);

    try {
      const hours = parseFloat(hoursInput[projectId]);
      if (isNaN(hours) || hours <= 0) {
        setNotification({ type: 'error', message: 'Please enter a valid number of hours.' });
        return;
      }

      // Get current user profile
      const { getOrCreateUserProfile } = await import('./utils/userProfile');
      const userProfile = await getOrCreateUserProfile();
      
      if (!userProfile) {
        setNotification({ type: 'error', message: 'User profile not found. Please try again.' });
        return;
      }

      // Find the volunteer activity for this project
      const activity = volunteerActivities.find(va => va.projectId === projectId && va.userId === userProfile.id);
      if (!activity) {
        setNotification({ type: 'error', message: 'Volunteer activity not found.' });
        return;
      }

      // Find the project to get its duration
      const project = myJoinedProjects.find(p => p.id === projectId);
      if (!project) {
        setNotification({ type: 'error', message: 'Project not found.' });
        return;
      }

      // Check if project has a duration limit
      const currentHoursLogged = activity.hoursLogged || 0;
      const newTotalHours = currentHoursLogged + hours;
      
      if (project.duration && newTotalHours > project.duration) {
        const remainingHours = project.duration - currentHoursLogged;
        if (remainingHours <= 0) {
          setNotification({ type: 'error', message: `You have already logged the maximum ${project.duration} hours for this project.` });
        } else {
          setNotification({ type: 'error', message: `You can only log ${remainingHours.toFixed(1)} more hours (project duration: ${project.duration} hours).` });
        }
        return;
      }

      // Update the volunteer activity with logged hours
      const newHoursLogged = currentHoursLogged + hours;
      const { errors } = await client.models.VolunteerActivity.update({
        id: activity.id,
        hoursLogged: newHoursLogged,
        status: newHoursLogged > 0 ? 'Active' : 'Joined'
      });

      if (errors) {
        console.error('Error logging hours:', errors);
        setNotification({ type: 'error', message: 'Failed to log hours. Please try again.' });
        return;
      }

      // Update user statistics
      await updateUserStats(userProfile.id);

      const successMessage = project.duration 
        ? `${hours} hours logged successfully! Total: ${newHoursLogged}/${project.duration} hours.`
        : `${hours} hours logged successfully! Total: ${newHoursLogged} hours.`;
      
      setNotification({ type: 'success', message: successMessage });
      
      // Clear the input
      setHoursInput({ ...hoursInput, [projectId]: '' });
      
      // Reload joined projects to reflect changes
      await loadJoinedProjects(userProfile.id);
      
    } catch (error) {
      console.error('Error logging hours:', error);
      setNotification({ type: 'error', message: 'Failed to log hours. Please try again.' });
    } finally {
      setLoggingHours(null);
    }
  };

  const updateUserStats = async (userId: string) => {
    try {
      // Get all volunteer activities for this user
      const { data: activities } = await client.models.VolunteerActivity.list({
        filter: { userId: { eq: userId } }
      });

      if (!activities) return;

      // Calculate totals
      const totalHours = activities.reduce((sum, activity) => sum + (activity.hoursLogged || 0), 0);
      const totalProjects = activities.filter(activity => activity.status === 'Completed').length;
      const points = Math.floor(totalHours * 10); // 10 points per hour
      const level = Math.floor(points / 100) + 1; // Level 1: 0-100 pts, Level 2: 101-200 pts, etc.

      // Update user record
      await client.models.User.update({
        id: userId,
        totalHours,
        totalProjects,
        points,
        level
      });

      // Check for achievements
      await checkAndAwardAchievements(userId, totalHours, totalProjects, points);

    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const checkAndAwardAchievements = async (userId: string, totalHours: number, totalProjects: number, points: number) => {
    try {
      // Get all achievements
      const { data: achievements } = await client.models.Achievement.list();
      if (!achievements) return;

      // Get user's existing achievements
      const { data: userAchievements } = await client.models.UserAchievement.list({
        filter: { userId: { eq: userId } }
      });

      const existingAchievementIds = new Set(userAchievements?.map(ua => ua.achievementId) || []);

      // Check each achievement
      for (const achievement of achievements) {
        if (existingAchievementIds.has(achievement.id)) continue; // Already earned

        let shouldAward = false;

        // Check achievement criteria based on achievement type/name
        if (achievement.name === 'First Project' && totalProjects >= 1) {
          shouldAward = true;
        } else if (achievement.name === 'Hour Hero' && totalHours >= 10) {
          shouldAward = true;
        } else if (achievement.name === 'Volunteer Star' && totalHours >= 25) {
          shouldAward = true;
        } else if (achievement.name === 'Project Champion' && totalProjects >= 5) {
          shouldAward = true;
        } else if (achievement.name === 'Community Leader' && totalHours >= 50) {
          shouldAward = true;
        } else if (achievement.name === 'Level Up' && points >= 100) {
          shouldAward = true;
        }

        if (shouldAward) {
          // Award the achievement
          await client.models.UserAchievement.create({
            userId,
            achievementId: achievement.id,
            status: 'Completed',
            progress: 100,
            target: 100,
            completedAt: new Date().toISOString()
          });

          // Show achievement notification
          setNotification({ 
            type: 'success', 
            message: `🎉 Achievement Unlocked: ${achievement.name}! ${achievement.description}` 
          });
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const getCategoryIcon = (category: string | undefined) => {
    if (!category) return '📋';
    if (category.includes('Education')) return '📚';
    if (category.includes('Environment')) return '🌳';
    if (category.includes('Community')) return '🤝';
    if (category.includes('Technology')) return '💻';
    if (category.includes('Health')) return '❤️';
    if (category.includes('Animals')) return '🐾';
    if (category.includes('Arts')) return '🎨';
    return '📋';
  };

  const getStatusBadge = (status: string | undefined, isApproved: boolean | undefined) => {
    if (status === 'Active' && isApproved) {
      return {
        text: 'Active',
        bg: '#d1fae5',
        color: '#065f46',
        icon: '🟢'
      };
    } else if (status === 'Pending' || !isApproved) {
      return {
        text: 'Pending',
        bg: '#fef3c7',
        color: '#92400e',
        icon: '🟡'
      };
    } else if (status === 'Rejected') {
      return {
        text: 'Rejected',
        bg: '#fee2e2',
        color: '#991b1b',
        icon: '🔴'
      };
    }
    return {
      text: status || 'Unknown',
      bg: '#e5e7eb',
      color: '#374151',
      icon: '⚪'
    };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const handleEditProject = (projectId: string) => {
    // Navigate to edit page (we'll implement this next)
    window.location.href = `/submit-project?edit=${projectId}`;
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { errors } = await client.models.Project.delete({ id: projectId });
      
      if (errors) {
        console.error('Error deleting project:', errors);
        alert('Failed to delete project. Please try again.');
        return;
      }

      // Reload the submissions
      await loadMySubmissions();
      alert('Project deleted successfully.');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleLeaveProject = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Are you sure you want to leave "${projectTitle}"? You can rejoin later if spots are available.`)) {
      return;
    }

    setUnjoinLoading(projectId);
    setNotification(null);

    try {
      // Get current user profile
      const userProfile = await getOrCreateUserProfile();
      if (!userProfile) {
        setNotification({ type: 'error', message: 'User profile not found. Please try again.' });
        return;
      }

      // Find and delete the volunteer activity
      const { data: volunteerActivities } = await client.models.VolunteerActivity.list({
        filter: { 
          userId: { eq: userProfile.id },
          projectId: { eq: projectId }
        }
      });

      if (!volunteerActivities || volunteerActivities.length === 0) {
        setNotification({ type: 'error', message: 'No participation record found for this project.' });
        return;
      }

      // Delete the volunteer activity
      const { errors } = await client.models.VolunteerActivity.delete({ 
        id: volunteerActivities[0].id 
      });

      if (errors) {
        console.error('Error deleting volunteer activity:', errors);
        setNotification({ type: 'error', message: 'Failed to leave project. Please try again.' });
        return;
      }

      // Update project's current volunteers count
      const project = myJoinedProjects.find(p => p.id === projectId);
      if (project) {
        const newCurrentVolunteers = Math.max((project.currentVolunteers || 0) - 1, 0);
        const newSpotsAvailable = (project.spotsAvailable || 0) + 1;

        const { errors: updateErrors } = await client.models.Project.update({
          id: projectId,
          currentVolunteers: newCurrentVolunteers,
          spotsAvailable: newSpotsAvailable
        });

        if (updateErrors) {
          console.error('Error updating project:', updateErrors);
          // Don't show error to user since they're already unjoined
        }
      }

      // Reload joined projects
      await loadJoinedProjects(userProfile.id);
      setNotification({ type: 'success', message: 'Successfully left the project.' });
      
      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error leaving project:', error);
      setNotification({ type: 'error', message: 'Failed to leave project. Please try again.' });
      
      // Auto-dismiss error notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setUnjoinLoading(null);
    }
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
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Project rush</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Home</a>
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
          {isAuthenticated && (
            <>
              <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>My Projects</a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Profile</a>
              <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
              {isAdmin && (
                <a href="/admin" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
                  ⚙️ Admin
                </a>
              )}
            </>
          )}
          <a href="/faq" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>FAQ</a>
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

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                marginLeft: '0.5rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

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
            View and manage your submitted projects and projects you've joined
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          background: 'white',
          borderRadius: '12px',
          padding: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          width: '500px',
          margin: '0 auto 2rem auto'
        }}>
          <button
            onClick={() => setActiveTab('joined')}
            style={{
              width: '200px',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              background: activeTab === 'joined' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'transparent',
              color: activeTab === 'joined' ? 'white' : '#718096',
              transition: 'all 0.2s ease'
            }}
          >
            🤝 Joined ({myJoinedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            style={{
              width: '200px',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              background: activeTab === 'submitted' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'transparent',
              color: activeTab === 'submitted' ? 'white' : '#718096',
              transition: 'all 0.2s ease'
            }}
          >
            📝 Submitted ({mySubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              width: '200px',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              background: activeTab === 'completed' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'transparent',
              color: activeTab === 'completed' ? 'white' : '#718096',
              transition: 'all 0.2s ease'
            }}
          >
            ✅ Completed ({myCompletedProjects.length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#718096'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>⏳</div>
            <p>Loading your submissions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && ((activeTab === 'submitted' && mySubmissions.length === 0) || (activeTab === 'joined' && myJoinedProjects.length === 0) || (activeTab === 'completed' && myCompletedProjects.length === 0)) && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {activeTab === 'submitted' ? '📝' : activeTab === 'joined' ? '🤝' : '✅'}
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              {activeTab === 'submitted' ? 'No Submitted Projects Yet' : activeTab === 'joined' ? 'No Joined Projects Yet' : 'No Completed Projects Yet'}
            </h3>
            <p style={{
              color: '#718096',
              marginBottom: '1.5rem'
            }}>
              {activeTab === 'submitted' 
                ? "You haven't submitted any projects yet. Start making a difference!"
                : activeTab === 'joined'
                ? "You haven't joined any projects yet. Browse available projects to get started!"
                : "You haven't completed any projects yet. Join projects and complete them to see them here!"
              }
            </p>
            <button
              onClick={() => window.location.href = activeTab === 'submitted' ? '/submit-project' : '/projects'}
              style={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {activeTab === 'submitted' ? 'Submit Your First Project' : activeTab === 'joined' ? 'Browse Projects' : 'Browse Projects'}
            </button>
          </div>
        )}

        {/* Projects List */}
        {!loading && ((activeTab === 'submitted' && mySubmissions.length > 0) || (activeTab === 'joined' && myJoinedProjects.length > 0) || (activeTab === 'completed' && myCompletedProjects.length > 0)) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {(activeTab === 'submitted' ? mySubmissions : activeTab === 'joined' ? myJoinedProjects : myCompletedProjects).map((project) => {
              const statusBadge = getStatusBadge(project.status, project.isApproved);
              const locationStr = project.city && project.state 
                ? `${project.city}, ${project.state}`
                : project.location || 'Location TBD';
              
              // Get volunteer activity for joined and completed projects
              const volunteerActivity = (activeTab === 'joined' || activeTab === 'completed')
                ? volunteerActivities.find(va => va.projectId === project.id)
                : null;
              
              return (
                <div key={project.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease'
                }}>
                  {/* Project Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                      <span style={{ fontSize: '2.5rem' }}>{getCategoryIcon(project.category)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <h3 style={{
                            fontSize: '1.35rem',
                            fontWeight: '600',
                            color: '#2d3748',
                            margin: '0'
                          }}>
                            {project.title}
                          </h3>
                          <button
                            onClick={() => window.location.href = `/project/${project.id}`}
                            style={{
                              background: '#f3f4f6',
                              color: '#374151',
                              border: 'none',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            🔍 View Details
                          </button>
                        </div>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#718096',
                          margin: '0'
                        }}>
                          📍 {locationStr}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                      whiteSpace: 'nowrap'
                    }}>
                      <span>{statusBadge.icon}</span>
                      {statusBadge.text}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: '#4a5568',
                    marginBottom: '1rem',
                    lineHeight: '1.6',
                    fontSize: '0.95rem'
                  }}>
                    {project.description}
                  </p>

                  {/* Project Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Category
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {project.category || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Start Date
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {formatDate(project.startDate)}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Duration
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {project.duration ? `${project.duration} hours` : 'TBD'}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Volunteers
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {project.currentVolunteers || 0} / {project.maxVolunteers || 0}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Created
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                    
                    {/* Volunteer Activity Information - Only for joined and completed projects */}
                    {(activeTab === 'joined' || activeTab === 'completed') && volunteerActivity && (
                      <>
                        <div>
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#718096',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Hours Logged
                          </span>
                          <p style={{
                            margin: 0,
                            fontSize: '0.95rem',
                            color: '#2d3748',
                            fontWeight: '600'
                          }}>
                            {volunteerActivity.hoursLogged || 0} hours
                          </p>
                        </div>
                        
                        <div>
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#718096',
                            fontWeight: '500',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Status
                          </span>
                          <p style={{
                            margin: 0,
                            fontSize: '0.95rem',
                            color: volunteerActivity.status === 'Completed' ? '#10b981' : 
                                   volunteerActivity.status === 'Active' ? '#3b82f6' : '#f59e0b',
                            fontWeight: '600'
                          }}>
                            {volunteerActivity.status}
                          </p>
                        </div>
                        
                        {volunteerActivity.joinedAt && (
                          <div>
                            <span style={{
                              fontSize: '0.8rem',
                              color: '#718096',
                              fontWeight: '500',
                              display: 'block',
                              marginBottom: '0.25rem'
                            }}>
                              Joined
                            </span>
                            <p style={{
                              margin: 0,
                              fontSize: '0.95rem',
                              color: '#2d3748',
                              fontWeight: '600'
                            }}>
                              {formatDate(volunteerActivity.joinedAt)}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {activeTab === 'submitted' && statusBadge.text === 'Pending' && (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <button
                        onClick={() => handleEditProject(project.id)}
                        style={{
                          flex: 1,
                          background: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        style={{
                          flex: 1,
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Completion Status - Only for completed projects */}
                  {activeTab === 'completed' && volunteerActivity && (
                    <div style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid #e2e8f0',
                      background: 'linear-gradient(135deg, #E8F5E8, #E3F2FD)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>✅</span>
                        <h4 style={{
                          margin: 0,
                          color: '#2E7D32',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}>
                          Project Completed
                        </h4>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        fontSize: '0.9rem',
                        color: '#666'
                      }}>
                        <div>
                          <strong>Hours Logged:</strong> {volunteerActivity.hoursLogged || 0}
                        </div>
                        <div>
                          <strong>Completed:</strong> {volunteerActivity.completedAt ? formatDate(volunteerActivity.completedAt) : 'N/A'}
                        </div>
                        <div>
                          <strong>Points Earned:</strong> {((volunteerActivity.hoursLogged || 0) * 10).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Volunteer Activity Actions - Only for joined projects (not completed) */}
                  {activeTab === 'joined' && volunteerActivity && (
                    <div style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      {/* Hour Logging Section */}
                      {volunteerActivity.status !== 'Completed' && (
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#2d3748',
                            margin: '0 0 0.75rem 0'
                          }}>
                            📝 Log Volunteer Hours
                          </h4>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                          }}>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={project.duration ? project.duration - (volunteerActivity.hoursLogged || 0) : undefined}
                              placeholder={project.duration ? `Max ${project.duration} hours` : 'Enter hours'}
                              value={hoursInput[project.id] || ''}
                              onChange={(e) => setHoursInput({ ...hoursInput, [project.id]: e.target.value })}
                              disabled={!!(project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration)}
                              style={{
                                flex: 1,
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                opacity: project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration ? 0.5 : 1,
                                backgroundColor: project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration ? '#f3f4f6' : 'white'
                              }}
                            />
                            <button
                              onClick={() => handleLogHours(project.id)}
                              disabled={loggingHours === project.id || !hoursInput[project.id] || !!(project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration)}
                              style={{
                                background: loggingHours === project.id ? '#f3f4f6' : 
                                           (project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration) ? '#f3f4f6' : '#10b981',
                                color: loggingHours === project.id ? '#9ca3af' : 
                                       (project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration) ? '#9ca3af' : 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: (loggingHours === project.id || (project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration)) ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                opacity: (loggingHours === project.id || (project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration)) ? 0.7 : 1,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {loggingHours === project.id ? 'Logging...' : 
                               (project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration) ? 'Max Reached' : 'Log Hours'}
                            </button>
                          </div>
                          <p style={{
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            margin: '0.5rem 0 0 0'
                          }}>
                            Current total: {volunteerActivity.hoursLogged || 0} hours
                            {project.duration && (
                              <span style={{ color: '#10b981', fontWeight: '500' }}>
                                {' '}/ {project.duration} hours
                              </span>
                            )}
                          </p>
                          {project.duration && (volunteerActivity.hoursLogged || 0) >= project.duration && (
                            <p style={{
                              fontSize: '0.8rem',
                              color: '#10b981',
                              margin: '0.5rem 0 0 0',
                              fontWeight: '500'
                            }}>
                              ✅ Maximum hours reached for this project
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Completion and Leave Buttons */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {volunteerActivity.status !== 'Completed' && (
                            <button
                              onClick={() => handleCompleteProject(project.id)}
                              disabled={completingProject === project.id || (volunteerActivity.hoursLogged || 0) === 0}
                              style={{
                                background: (completingProject === project.id || (volunteerActivity.hoursLogged || 0) === 0) ? '#f3f4f6' : '#10b981',
                                color: (completingProject === project.id || (volunteerActivity.hoursLogged || 0) === 0) ? '#9ca3af' : 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: (completingProject === project.id || (volunteerActivity.hoursLogged || 0) === 0) ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                opacity: (completingProject === project.id || (volunteerActivity.hoursLogged || 0) === 0) ? 0.7 : 1,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {completingProject === project.id ? 'Completing...' : '✅ Mark Complete'}
                            </button>
                          )}
                          
                          {volunteerActivity.status === 'Completed' && (
                            <div style={{
                              background: '#f0fdf4',
                              color: '#10b981',
                              border: '1px solid #10b981',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              🎉 Completed!
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleLeaveProject(project.id, project.title)}
                          disabled={unjoinLoading === project.id}
                          style={{
                            background: unjoinLoading === project.id ? '#f3f4f6' : '#fee2e2',
                            color: unjoinLoading === project.id ? '#9ca3af' : '#991b1b',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: unjoinLoading === project.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            opacity: unjoinLoading === project.id ? 0.7 : 1,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {unjoinLoading === project.id ? 'Leaving...' : '🚪 Leave'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Section */}
        {!loading && ((activeTab === 'submitted' && mySubmissions.length > 0) || (activeTab === 'joined' && myJoinedProjects.length > 0) || (activeTab === 'completed' && myCompletedProjects.length > 0)) && (
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
              marginBottom: '1.5rem'
            }}>
              {activeTab === 'submitted' ? 'Submission Summary' : activeTab === 'joined' ? 'Participation Summary' : 'Completion Summary'}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {activeTab === 'submitted' ? (
                <>
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#3b82f6',
                      marginBottom: '0.5rem'
                    }}>
                      {mySubmissions.length}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Total Submissions
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#10b981',
                      marginBottom: '0.5rem'
                    }}>
                      {mySubmissions.filter(p => p.status === 'Active' && p.isApproved).length}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Active Projects
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#f59e0b',
                      marginBottom: '0.5rem'
                    }}>
                      {mySubmissions.filter(p => p.status === 'Pending' || !p.isApproved).length}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Pending Approval
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#6366f1',
                      marginBottom: '0.5rem'
                    }}>
                      {mySubmissions.reduce((sum, p) => sum + (p.currentVolunteers || 0), 0)}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Total Volunteers
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#3b82f6',
                      marginBottom: '0.5rem'
                    }}>
                      {myJoinedProjects.length}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Projects Joined
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#10b981',
                      marginBottom: '0.5rem'
                    }}>
                      {myJoinedProjects.filter(p => p.status === 'Active' && p.isApproved).length}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Active Projects
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#f59e0b',
                      marginBottom: '0.5rem'
                    }}>
                      {myJoinedProjects.filter(p => p.status === 'Pending' || !p.isApproved).length}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Pending Projects
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#6366f1',
                      marginBottom: '0.5rem'
                    }}>
                      {volunteerActivities.reduce((sum, va) => sum + (va.hoursLogged || 0), 0).toFixed(1)}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Hours Logged
                    </div>
                  </div>
                  
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#10b981',
                      marginBottom: '0.5rem'
                    }}>
                      {volunteerActivities.filter(va => va.status === 'Completed').length}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      Completed Projects
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyProjectsPage;
