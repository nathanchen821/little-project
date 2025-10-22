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
    
    // Fetch user's achievements
    const { data: achievements } = await client.models.UserAchievement.list({
      filter: { userId: { eq: userId } }
    });
    
    // Calculate stats
    const completedActivities = activities?.filter(a => a.status === 'Completed') || [];
    const totalHours = completedActivities.reduce((sum, a) => sum + (a.hoursVerified || 0), 0);
    const totalProjects = new Set(completedActivities.map(a => a.projectId)).size;
    const completedAchievements = achievements?.filter(a => a.status === 'Completed') || [];
    
    return {
      totalHours,
      totalProjects,
      completedActivities: completedActivities.length,
      completedAchievements: completedAchievements.length,
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

