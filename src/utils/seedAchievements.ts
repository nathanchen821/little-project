import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

/**
 * Seed the database with sample achievements
 * This function creates default achievements that users can earn
 */
export async function seedAchievements() {
  try {
    console.log('Seeding achievements...');
    
    const sampleAchievements = [
      {
        name: "First Steps",
        description: "Complete your first volunteer project",
        icon: "🌟",
        category: "Getting Started",
        type: "Milestone",
        points: 50,
        badge: "first-steps",
        isActive: true,
        sortOrder: 1,
        criteria: {
          type: "project_completion",
          target: 1
        }
      },
      {
        name: "Education Helper",
        description: "Volunteer 5+ hours in education projects",
        icon: "📚",
        category: "Education",
        type: "Hours",
        points: 100,
        badge: "education-helper",
        isActive: true,
        sortOrder: 2,
        criteria: {
          type: "category_hours",
          category: "Education",
          target: 5
        }
      },
      {
        name: "Community Champion",
        description: "Complete 3 community service projects",
        icon: "🤝",
        category: "Community",
        type: "Projects",
        points: 150,
        badge: "community-champion",
        isActive: true,
        sortOrder: 3,
        criteria: {
          type: "category_projects",
          category: "Community",
          target: 3
        }
      },
      // Streak achievements
      {
        name: "1-Week Streak",
        description: "Volunteer for 1 consecutive week",
        icon: "🔥",
        category: "Consistency",
        type: "Streak",
        points: 20,
        badge: "streak-1",
        isActive: true,
        sortOrder: 4,
        criteria: {
          type: "weekly_streak",
          target: 1
        }
      },
      {
        name: "5-Week Streak",
        description: "Volunteer for 5 consecutive weeks",
        icon: "🔥",
        category: "Consistency",
        type: "Streak",
        points: 100,
        badge: "streak-5",
        isActive: true,
        sortOrder: 5,
        criteria: {
          type: "weekly_streak",
          target: 5
        }
      },
      {
        name: "10-Week Streak",
        description: "Volunteer for 10 consecutive weeks",
        icon: "🔥",
        category: "Consistency",
        type: "Streak",
        points: 200,
        badge: "streak-10",
        isActive: true,
        sortOrder: 6,
        criteria: {
          type: "weekly_streak",
          target: 10
        }
      },
      {
        name: "25-Week Streak",
        description: "Volunteer for 25 consecutive weeks",
        icon: "🔥",
        category: "Consistency",
        type: "Streak",
        points: 400,
        badge: "streak-25",
        isActive: true,
        sortOrder: 7,
        criteria: {
          type: "weekly_streak",
          target: 25
        }
      },
      {
        name: "52-Week Streak",
        description: "Volunteer for 52 consecutive weeks",
        icon: "🔥",
        category: "Consistency",
        type: "Streak",
        points: 800,
        badge: "streak-52",
        isActive: true,
        sortOrder: 8,
        criteria: {
          type: "weekly_streak",
          target: 52
        }
      },
      {
        name: "Diamond Volunteer",
        description: "Complete 50+ volunteer hours",
        icon: "💎",
        category: "Milestone",
        type: "Hours",
        points: 500,
        badge: "diamond-volunteer",
        isActive: true,
        sortOrder: 5,
        criteria: {
          type: "total_hours",
          target: 50
        }
      },
      {
        name: "Weekend Warrior",
        description: "Complete a project on both weekend days",
        icon: "⚡",
        category: "Special",
        type: "Weekend",
        points: 75,
        badge: "weekend-warrior",
        isActive: true,
        sortOrder: 20,
        criteria: {
          type: "weekend_completion",
          target: 1
        }
      },
      {
        name: "Team Player",
        description: "Complete 5 projects with friends",
        icon: "👥",
        category: "Social",
        type: "Collaboration",
        points: 125,
        badge: "team-player",
        isActive: true,
        sortOrder: 21,
        criteria: {
          type: "team_projects",
          target: 5
        }
      },
      {
        name: "Early Bird",
        description: "Complete your first project within 7 days of joining",
        icon: "🐦",
        category: "Getting Started",
        type: "Speed",
        points: 25,
        badge: "early-bird",
        isActive: true,
        sortOrder: 22,
        criteria: {
          type: "quick_start",
          target: 1
        }
      }
    ];

    const results = [];
    
    for (const achievement of sampleAchievements) {
      try {
        // Check if achievement already exists
        const { data: existing } = await client.models.Achievement.list({
          filter: { name: { eq: achievement.name } }
        });
        
        if (existing && existing.length > 0) {
          console.log(`Achievement "${achievement.name}" already exists, skipping...`);
          continue;
        }
        
        const { data, errors } = await client.models.Achievement.create(achievement);
        
        if (errors) {
          console.error(`Error creating achievement "${achievement.name}":`, errors);
        } else {
          console.log(`Created achievement: ${achievement.name}`);
          results.push(data);
        }
      } catch (error) {
        console.error(`Error creating achievement "${achievement.name}":`, error);
      }
    }
    
    console.log(`Successfully seeded ${results.length} achievements`);
    return results;
  } catch (error) {
    console.error('Error seeding achievements:', error);
    throw error;
  }
}

/**
 * Check if achievements exist in the database
 */
export async function checkAchievementsExist(): Promise<boolean> {
  try {
    const { data: achievements } = await client.models.Achievement.list();
    return (achievements && achievements.length > 0);
  } catch (error) {
    console.error('Error checking achievements:', error);
    return false;
  }
}

/**
 * Ensure streak achievements (1,5,10,25,52 weeks) exist even if other achievements already exist
 */
export async function ensureStreakAchievementsExists(): Promise<void> {
  const streaks = [
    { name: '1-Week Streak', target: 1, points: 20, badge: 'streak-1', sortOrder: 4 },
    { name: '5-Week Streak', target: 5, points: 100, badge: 'streak-5', sortOrder: 5 },
    { name: '10-Week Streak', target: 10, points: 200, badge: 'streak-10', sortOrder: 6 },
    { name: '25-Week Streak', target: 25, points: 400, badge: 'streak-25', sortOrder: 7 },
    { name: '52-Week Streak', target: 52, points: 800, badge: 'streak-52', sortOrder: 8 },
  ];
  for (const s of streaks) {
    try {
      const { data: existing } = await client.models.Achievement.list({ filter: { name: { eq: s.name } } });
      if (existing && existing.length > 0) continue;
      await client.models.Achievement.create({
        name: s.name,
        description: `Volunteer for ${s.target} consecutive week${s.target > 1 ? 's' : ''}`,
        icon: '🔥',
        category: 'Consistency',
        type: 'Streak',
        points: s.points,
        badge: s.badge,
        isActive: true,
        sortOrder: s.sortOrder,
        criteria: { type: 'weekly_streak', target: s.target }
      });
    } catch (e) {
      console.error('Error ensuring streak achievement', s.name, e);
    }
  }
}
