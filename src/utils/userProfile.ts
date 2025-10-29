import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  school?: string | null;
  grade?: string | null;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  interests?: string[] | null;
  availability?: string[] | null;
  locationPreferences?: string[] | null;
  totalHours: number;
  totalProjects: number;
  currentStreak: number;
  points: number;
  level: number;
  isAdmin: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  profileComplete?: boolean; // Flag to check if user completed profile
}

/**
 * Get or create user profile
 * - Fetches user from database by email
 * - If not found, creates a new profile with Cognito data
 * - Returns the user profile
 */
export async function getOrCreateUserProfile(): Promise<UserProfile | null> {
  try {
    // 1. Get Cognito user info
    await getCurrentUser();
    const userAttributes = await fetchUserAttributes();
    
    if (!userAttributes.email) {
      throw new Error('User email not found in Cognito');
    }
    
    // 2. List all users owned by current user (should only be one or zero)
    const { data: allUsers } = await client.models.User.list();
    
    // 3. Filter by email
    const existingUser = allUsers?.find(u => u.email === userAttributes.email);
    
    if (existingUser) {
      // Update last login time
      try {
        await client.models.User.update({
          id: existingUser.id,
          lastLoginAt: new Date().toISOString()
        });
      } catch (updateError) {
        // Non-critical, continue anyway
      }
      
      return existingUser as UserProfile;
    }
    
    // 4. If no profile, create one with Cognito data
    const { data: newUser, errors: createErrors } = await client.models.User.create({
      email: userAttributes.email,
      firstName: userAttributes.given_name || 'New',
      lastName: userAttributes.family_name || 'User',
      totalHours: 0,
      totalProjects: 0,
      currentStreak: 0,
      points: 0,
      level: 1,
      isAdmin: false,
      isActive: true,
      lastLoginAt: new Date().toISOString()
    });
    
    if (createErrors) {
      console.error('Error creating user:', createErrors);
      throw new Error('Failed to create user profile');
    }
    
    return newUser as UserProfile;
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<UserProfile> & { id: string }) {
  try {
    const { data, errors } = await client.models.User.update(updates);
    
    if (errors) {
      console.error('Error updating user:', errors);
      throw new Error('Failed to update user profile');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Check if user has completed their profile
 */
export function isProfileComplete(user: UserProfile): boolean {
  // Check if all required fields are filled
  return !!(
    user.firstName && 
    user.firstName !== 'New' &&
    user.lastName && 
    user.lastName !== 'User' &&
    user.school &&
    user.grade
  );
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(userId: string) {
  try {
    // Fetch user's volunteer activities
    const { data: activities } = await client.models.VolunteerActivity.list({
      filter: { userId: { eq: userId } }
    });
    
    // Fetch user's achievements (persisted rows)
    const { data: achievements } = await client.models.UserAchievement.list({
      filter: { userId: { eq: userId } }
    });
    
    // Calculate stats
    const completedActivities = activities?.filter(a => a.status === 'Completed') || [];
    const totalHours = completedActivities.reduce((sum, a) => sum + (a.hoursVerified || 0), 0);
    const totalProjects = new Set(completedActivities.map(a => a.projectId)).size;
    // Compute earned achievements using the same logic as the Achievements tab
    // so the "Achievements Earned" count matches what users see there.
    let computedAchievementData = await getUserAchievementData(userId);
    const completedAchievementsCount = (computedAchievementData && computedAchievementData.length > 0)
      ? computedAchievementData.filter(a => a.isEarned).length
      : ((achievements || []).filter(a => a.status === 'Completed').length);
    
    return {
      totalHours,
      totalProjects,
      completedActivities: completedActivities.length,
      completedAchievements: completedAchievementsCount,
      inProgressActivities: activities?.filter(a => a.status === 'In Progress').length || 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalHours: 0,
      totalProjects: 0,
      completedActivities: 0,
      completedAchievements: 0,
      inProgressActivities: 0
    };
  }
}

/**
 * Get all available achievements
 */
export async function getAllAchievements() {
  try {
    const { data: achievements, errors } = await client.models.Achievement.list({
      filter: { isActive: { eq: true } }
    });
    
    if (errors) {
      console.error('Error fetching achievements:', errors);
      return [];
    }
    
    return achievements || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

/**
 * Get user's achievement progress
 */
export async function getUserAchievements(userId: string) {
  try {
    const { data: userAchievements, errors } = await client.models.UserAchievement.list({
      filter: { userId: { eq: userId } }
    });
    
    if (errors) {
      console.error('Error fetching user achievements:', errors);
      return [];
    }
    
    return userAchievements || [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

/**
 * Calculate achievement progress based on user's actual volunteer activities
 */
async function calculateAchievementProgress(userId: string, achievement: any) {
  try {
    // Fetch user's volunteer activities
    const { data: activities } = await client.models.VolunteerActivity.list({
      filter: { userId: { eq: userId } }
    });
    
    const completedActivities = activities?.filter(a => a.status === 'Completed') || [];
    const totalHours = completedActivities.reduce((sum, a) => sum + (a.hoursVerified || 0), 0);
    const totalProjects = new Set(completedActivities.map(a => a.projectId)).size;
    
    console.log(`Calculating progress for achievement: ${achievement.name}`);
    console.log(`User activities: ${activities?.length || 0} total, ${completedActivities.length} completed`);
    console.log(`Total hours: ${totalHours}, Total projects: ${totalProjects}`);
    
    // Fetch project details to get categories
    const projectIds = [...new Set(completedActivities.map(a => a.projectId))];
    let projects = [];
    
    // Fetch projects one by one since 'in' filter is not available
    for (const projectId of projectIds) {
      try {
        const { data: project } = await client.models.Project.get({ id: projectId });
        if (project) {
          projects.push(project);
        }
      } catch (error) {
        console.error(`Error fetching project ${projectId}:`, error);
      }
    }
    
    const projectCategories = projects?.reduce((acc, project) => {
      if (project.category) {
        acc[project.id] = project.category;
      }
      return acc;
    }, {} as Record<string, string>) || {};
    
    // Calculate progress based on achievement criteria
    const criteria = achievement.criteria || {};
    let progress = 0;
    let target = 1;
    let isEarned = false;
    
    switch (criteria.type) {
      case 'project_completion':
        progress = totalProjects;
        target = criteria.target || 1;
        break;
        
      case 'total_hours':
        progress = totalHours;
        target = criteria.target || 1;
        break;
        
      case 'category_hours':
        const categoryHours = completedActivities
          .filter(a => projectCategories[a.projectId] === criteria.category)
          .reduce((sum, a) => sum + (a.hoursVerified || 0), 0);
        progress = categoryHours;
        target = criteria.target || 1;
        break;
        
      case 'category_projects':
        const categoryProjects = new Set(
          completedActivities
            .filter(a => projectCategories[a.projectId] === criteria.category)
            .map(a => a.projectId)
        ).size;
        progress = categoryProjects;
        target = criteria.target || 1;
        break;
        
      case 'weekly_streak':
        // Use only the user's currentStreak field for streak achievements
        try {
          const { data: user } = await client.models.User.get({ id: userId });
          progress = (user && typeof user.currentStreak === 'number') ? user.currentStreak : 0;
        } catch (e) {
          progress = 0;
        }
        target = criteria.target || 1;
        break;
        
      case 'weekend_completion':
        const weekendProjects = completedActivities.filter(a => {
          const date = new Date(a.completedAt || a.joinedAt || '');
          const day = date.getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        });
        progress = weekendProjects.length > 0 ? 1 : 0;
        target = criteria.target || 1;
        break;
        
      case 'team_projects':
        // For now, assume all projects are team projects
        progress = totalProjects;
        target = criteria.target || 1;
        break;
        
      case 'quick_start':
        // Check if first project was completed within 7 days of user creation
        try {
          const { data: user } = await client.models.User.get({ id: userId });
          if (user && completedActivities.length > 0) {
            const firstProject = completedActivities
              .sort((a, b) => new Date(a.joinedAt || '').getTime() - new Date(b.joinedAt || '').getTime())[0];
            // Use a default date if createdAt is not available
            const userCreated = new Date('2024-01-01'); // Default to a reasonable date
            const firstProjectDate = new Date(firstProject.joinedAt || '');
            const daysDiff = (firstProjectDate.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24);
            progress = daysDiff <= 7 ? 1 : 0;
          }
        } catch (error) {
          console.error('Error fetching user for quick_start achievement:', error);
          progress = 0;
        }
        target = criteria.target || 1;
        break;
        
      default:
        progress = 0;
        target = 1;
    }
    
    isEarned = progress >= target;
    
    console.log(`Achievement ${achievement.name}: progress=${progress}, target=${target}, earned=${isEarned}`);
    
    return {
      progress: Math.min(progress, target),
      target,
      isEarned,
      status: isEarned ? 'Completed' : (progress > 0 ? 'In Progress' : 'Not Started')
    };
  } catch (error) {
    console.error('Error calculating achievement progress:', error);
    return {
      progress: 0,
      target: 1,
      isEarned: false,
      status: 'Not Started'
    };
  }
}

/**
 * Get user's achievement data with progress information
 */
export async function getUserAchievementData(userId: string) {
  try {
    // Fetch all available achievements
    const allAchievements = await getAllAchievements();
    
    // Calculate progress for each achievement based on user's actual activities
    const achievementData = await Promise.all(
      allAchievements.map(async (achievement) => {
        const progressData = await calculateAchievementProgress(userId, achievement);
        
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon || '🏆',
          category: achievement.category,
          type: achievement.type,
          points: achievement.points || 0,
          badge: achievement.badge,
          isEarned: progressData.isEarned,
          progress: progressData.progress,
          target: progressData.target,
          completedAt: progressData.isEarned ? new Date().toISOString() : null,
          status: progressData.status
        };
      })
    );
    
    return achievementData;
  } catch (error) {
    console.error('Error fetching user achievement data:', error);
    return [];
  }
}

