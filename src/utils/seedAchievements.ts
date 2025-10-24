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
      {
        name: "Volunteer Streak",
        description: "Volunteer for 5 consecutive weeks",
        icon: "🔥",
        category: "Consistency",
        type: "Streak",
        points: 200,
        badge: "volunteer-streak",
        isActive: true,
        sortOrder: 4,
        criteria: {
          type: "weekly_streak",
          target: 5
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
        sortOrder: 6,
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
        sortOrder: 7,
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
        sortOrder: 8,
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
