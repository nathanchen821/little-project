import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * Project rush - Data Model Schema
 * AWS Amplify Gen2 with DynamoDB
 * 
 * This schema defines all data models for the volunteer management platform
 * connecting high school students with local volunteer opportunities.
 */

const schema = a.schema({
  // ============================================================================
  // CORE ENTITIES
  // ============================================================================
  
  /**
   * Users - High school students and administrators
   */
  User: a
    .model({
      email: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      school: a.string(),
      grade: a.string(),
      phone: a.string(),
      avatar: a.string(),
      bio: a.string(),
      interests: a.string().array(),
      availability: a.string().array(),
      locationPreferences: a.string().array(),
      privacySettings: a.json(),
      totalHours: a.float().default(0),
      totalProjects: a.integer().default(0),
      currentStreak: a.integer().default(0),
      points: a.integer().default(0),
      level: a.integer().default(1),
      isAdmin: a.boolean().default(false),
      isActive: a.boolean().default(true),
      lastLoginAt: a.datetime(),
      
      // Relationships
      createdProjects: a.hasMany('Project', 'createdById'),
      volunteerActivities: a.hasMany('VolunteerActivity', 'userId'),
      userAchievements: a.hasMany('UserAchievement', 'userId'),
      leaderboardEntries: a.hasMany('Leaderboard', 'userId'),
      adminActivities: a.hasMany('AdminActivity', 'adminId'),
      userChallenges: a.hasMany('UserChallenge', 'userId'),
      // Reciprocal for JoinRequest.requester
      joinRequests: a.hasMany('JoinRequest', 'requesterUserId'),
    })
    .authorization(allow => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.publicApiKey().to(['read']),
      allow.group('admins'),
    ]),

  /**
   * Organizations - Partner organizations hosting volunteer projects
   */
  Organization: a
    .model({
      name: a.string().required(),
      description: a.string(),
      category: a.string(),
      address: a.string(),
      city: a.string().required(),
      state: a.string().required(),
      contactEmail: a.string(),
      contactPhone: a.string(),
      website: a.string(),
      logo: a.string(),
      isVerified: a.boolean().default(false),
      isActive: a.boolean().default(true),
      totalProjects: a.integer().default(0),
      totalVolunteerHours: a.float().default(0),
      rating: a.float(),
      
      // Relationships
      projects: a.hasMany('Project', 'organizationId'),
    })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('admins'),
    ]),

  /**
   * ProjectCategories - Project categories and their configurations
   */
  ProjectCategory: a
    .model({
      name: a.string().required(),
      description: a.string(),
      icon: a.string(),
      color: a.string(),
      isActive: a.boolean().default(true),
      sortOrder: a.integer(),
    })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('admins'),
    ]),

  // ============================================================================
  // PROJECT MANAGEMENT
  // ============================================================================

  /**
   * Projects - Volunteer opportunities and activities
   */
  Project: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      category: a.string().required(),
      organizationId: a.id(),
      createdById: a.id(),
      location: a.string().required(),
      address: a.string(),
      city: a.string().required(),
      state: a.string().required(),
      startDate: a.datetime().required(),
      endDate: a.datetime(),
      duration: a.float(),
      maxVolunteers: a.integer().required(),
      currentVolunteers: a.integer().default(0),
      spotsAvailable: a.integer(),
      difficulty: a.string(),
      requirements: a.string(),
      whatToBring: a.string(),
      whatToExpect: a.string(),
      impact: a.string(),
      skills: a.string().array(),
      ageRequirement: a.string(),
      contactInfo: a.string(),
      icon: a.string(),
      images: a.string().array(),
      status: a.string().default('Draft'),
      isRecurring: a.boolean().default(false),
      recurrencePattern: a.string(),
      tags: a.string().array(),
      rating: a.float(),
      totalHours: a.float().default(0),
      isApproved: a.boolean().default(false),
      approvedById: a.id(),
      approvedAt: a.datetime(),
      rejectionReason: a.string(),
      
      // Relationships
      organization: a.belongsTo('Organization', 'organizationId'),
      createdBy: a.belongsTo('User', 'createdById'),
      volunteerActivities: a.hasMany('VolunteerActivity', 'projectId'),
      joinRequests: a.hasMany('JoinRequest', 'projectId'),
    })
    .authorization(allow => [
      // Allow public read access for approved projects
      allow.publicApiKey(),
      // Allow authenticated users full access
      allow.authenticated(),
      allow.group('admins'),
    ]),

  /**
   * VolunteerActivities - User participation in volunteer projects
   */
  VolunteerActivity: a
    .model({
      userId: a.id().required(),
      projectId: a.id().required(),
      status: a.string().required().default('Joined'),
      hoursLogged: a.float().default(0),
      hoursVerified: a.float().default(0),
      joinedAt: a.datetime(),
      startedAt: a.datetime(),
      completedAt: a.datetime(),
      checkInTime: a.datetime(),
      checkOutTime: a.datetime(),
      notes: a.string(),
      feedback: a.string(),
      rating: a.float(),
      isVerified: a.boolean().default(false),
      verifiedById: a.id(),
      verifiedAt: a.datetime(),
      certificateGenerated: a.boolean().default(false),
      certificateUrl: a.string(),
      
      // Relationships
      user: a.belongsTo('User', 'userId'),
      project: a.belongsTo('Project', 'projectId'),
    })
    .authorization(allow => [
      allow.authenticated(),
      allow.group('admins'),
    ]),

  /**
   * JoinRequest - Request/approval workflow for joining projects
   */
  JoinRequest: a
    .model({
      projectId: a.id().required(),
      requesterUserId: a.id().required(),
      status: a.string().required().default('Pending'), // Pending | Accepted | Denied | Cancelled
      message: a.string(),
      decisionById: a.id(),
      decisionAt: a.datetime(),

      // Relationships
      project: a.belongsTo('Project', 'projectId'),
      requester: a.belongsTo('User', 'requesterUserId'),
    })
    .authorization(allow => [
      // Authenticated users can create and read; app-level logic restricts visibility
      allow.authenticated(),
      allow.group('admins'),
    ]),

  // ============================================================================
  // GAMIFICATION
  // ============================================================================

  /**
   * Achievements - Achievement definitions
   */
  Achievement: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      icon: a.string(),
      category: a.string(),
      type: a.string(),
      criteria: a.json(),
      points: a.integer().default(0),
      badge: a.string(),
      isActive: a.boolean().default(true),
      sortOrder: a.integer(),
      
      // Relationships
      userAchievements: a.hasMany('UserAchievement', 'achievementId'),
    })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('admins'),
    ]),

  /**
   * UserAchievements - User achievement progress and completion
   */
  UserAchievement: a
    .model({
      userId: a.id().required(),
      achievementId: a.id().required(),
      status: a.string().required().default('In Progress'),
      progress: a.float().default(0),
      target: a.float(),
      completedAt: a.datetime(),
      
      // Relationships
      user: a.belongsTo('User', 'userId'),
      achievement: a.belongsTo('Achievement', 'achievementId'),
    })
    .authorization(allow => [
      allow.authenticated(),
      allow.group('admins'),
    ]),

  /**
   * Leaderboards - Individual student rankings
   */
  Leaderboard: a
    .model({
      userId: a.id().required(),
      category: a.string().required(),
      timeframe: a.string().required(),
      rank: a.integer(),
      value: a.float(),
      previousRank: a.integer(),
      rankChange: a.integer(),
      period: a.string(),
      
      // Relationships
      user: a.belongsTo('User', 'userId'),
    })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('admins'),
    ]),

  // ============================================================================
  // CHALLENGES AND ADMIN
  // ============================================================================

  /**
   * WeeklyChallenges - Weekly challenges for users
   */
  WeeklyChallenge: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      type: a.string().required(),
      criteria: a.json(),
      reward: a.json(),
      startDate: a.datetime().required(),
      endDate: a.datetime().required(),
      isActive: a.boolean().default(true),
      
      // Relationships
      userChallenges: a.hasMany('UserChallenge', 'challengeId'),
    })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('admins'),
    ]),

  /**
   * UserChallenges - User participation in weekly challenges
   */
  UserChallenge: a
    .model({
      userId: a.id().required(),
      challengeId: a.id().required(),
      status: a.string().required().default('In Progress'),
      progress: a.float().default(0),
      target: a.float(),
      completedAt: a.datetime(),
      rewardClaimed: a.boolean().default(false),
      
      // Relationships
      user: a.belongsTo('User', 'userId'),
      challenge: a.belongsTo('WeeklyChallenge', 'challengeId'),
    })
    .authorization(allow => [
      allow.authenticated(),
      allow.group('admins'),
    ]),

  /**
   * AdminActivities - Administrative actions and approvals
   */
  AdminActivity: a
    .model({
      adminId: a.id().required(),
      action: a.string().required(),
      targetType: a.string(),
      targetId: a.string(),
      description: a.string(),
      data: a.json(),
      status: a.string(),
      
      // Relationships
      admin: a.belongsTo('User', 'adminId'),
    })
    .authorization(allow => [
      allow.group('admins'),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
