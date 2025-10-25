import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  school: string;
  avatar: string;
  totalHours: number;
  totalProjects: number;
  currentStreak: number;
  points: number;
  level: number;
  badge: string;
}

export interface SchoolCompetitionEntry {
  school: string;
  totalPoints: number;
  totalHours: number;
  totalProjects: number;
  volunteers: number;
  rank: number;
}

/**
 * Get leaderboard data for a specific category
 */
export async function getLeaderboard(category: 'hours' | 'projects' | 'streak' | 'points'): Promise<LeaderboardEntry[]> {
  try {
    // Fetch all users from the database
    const { data: users, errors } = await client.models.User.list({
      filter: { isActive: { eq: true } }
    });

    if (errors) {
      console.error('Error fetching users for leaderboard:', errors);
      return [];
    }

    if (!users || users.length === 0) {
      return [];
    }

    // Sort users based on the selected category
    const sortedUsers = [...users].sort((a, b) => {
      switch (category) {
        case 'hours':
          return (b.totalHours || 0) - (a.totalHours || 0);
        case 'projects':
          return (b.totalProjects || 0) - (a.totalProjects || 0);
        case 'streak':
          return (b.currentStreak || 0) - (a.currentStreak || 0);
        case 'points':
          return (b.points || 0) - (a.points || 0);
        default:
          return 0;
      }
    });

    // Create leaderboard entries with rankings
    const leaderboardEntries: LeaderboardEntry[] = sortedUsers.map((user, index) => {
      const rank = index + 1;
      const name = `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`;
      const school = user.school || 'Unknown School';
      const avatar = user.avatar || '👤';
      
      // Determine badge based on rank
      let badge = '⭐';
      if (rank === 1) badge = '🏆';
      else if (rank === 2) badge = '🥇';
      else if (rank === 3) badge = '🥈';
      else if (rank <= 5) badge = '🥉';
      else if (rank <= 10) badge = '⭐';

      return {
        rank,
        id: user.id,
        name,
        school,
        avatar,
        totalHours: user.totalHours || 0,
        totalProjects: user.totalProjects || 0,
        currentStreak: user.currentStreak || 0,
        points: user.points || 0,
        level: user.level || 1,
        badge
      };
    });

    // Return top 10 users
    return leaderboardEntries.slice(0, 10);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get school competition data
 */
export async function getSchoolCompetition(): Promise<SchoolCompetitionEntry[]> {
  try {
    // Fetch all users from the database
    const { data: users, errors } = await client.models.User.list({
      filter: { isActive: { eq: true } }
    });

    if (errors) {
      console.error('Error fetching users for school competition:', errors);
      return [];
    }

    if (!users || users.length === 0) {
      return [];
    }

    // Group users by school and calculate totals
    const schoolStats: Record<string, {
      totalPoints: number;
      totalHours: number;
      totalProjects: number;
      volunteers: number;
    }> = {};

    users.forEach(user => {
      const school = user.school || 'Unknown School';
      
      if (!schoolStats[school]) {
        schoolStats[school] = {
          totalPoints: 0,
          totalHours: 0,
          totalProjects: 0,
          volunteers: 0
        };
      }

      schoolStats[school].totalPoints += user.points || 0;
      schoolStats[school].totalHours += user.totalHours || 0;
      schoolStats[school].totalProjects += user.totalProjects || 0;
      schoolStats[school].volunteers += 1;
    });

    // Convert to array and sort by total points
    const schoolEntries: SchoolCompetitionEntry[] = Object.entries(schoolStats)
      .map(([school, stats]) => ({
        school,
        totalPoints: stats.totalPoints,
        totalHours: stats.totalHours,
        totalProjects: stats.totalProjects,
        volunteers: stats.volunteers,
        rank: 0 // Will be set after sorting
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks
    schoolEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return schoolEntries;
  } catch (error) {
    console.error('Error fetching school competition:', error);
    return [];
  }
}

/**
 * Get leaderboard statistics
 */
export async function getLeaderboardStats() {
  try {
    // Fetch all users
    const { data: users, errors } = await client.models.User.list({
      filter: { isActive: { eq: true } }
    });

    if (errors) {
      console.error('Error fetching users for stats:', errors);
      return {
        totalVolunteers: 0,
        totalSchools: 0,
        totalHours: 0,
        totalProjects: 0,
        totalPoints: 0
      };
    }

    if (!users || users.length === 0) {
      return {
        totalVolunteers: 0,
        totalSchools: 0,
        totalHours: 0,
        totalProjects: 0,
        totalPoints: 0
      };
    }

    // Calculate statistics
    const totalVolunteers = users.length;
    const schools = new Set(users.map(u => u.school).filter(Boolean));
    const totalSchools = schools.size;
    const totalHours = users.reduce((sum, u) => sum + (u.totalHours || 0), 0);
    const totalProjects = users.reduce((sum, u) => sum + (u.totalProjects || 0), 0);
    const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);

    return {
      totalVolunteers,
      totalSchools,
      totalHours,
      totalProjects,
      totalPoints
    };
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    return {
      totalVolunteers: 0,
      totalSchools: 0,
      totalHours: 0,
      totalProjects: 0,
      totalPoints: 0
    };
  }
}
