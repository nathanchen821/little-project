# Project rush - Connecting students with community volunteer opportunities
**Live site:** https://main.d30jhxkza5tj8e.amplifyapp.com/

Project rush connects high school students with local volunteer opportunities in a simple, modern web app bringing discovery, hour tracking, achievements, and leaderboards together so students can easily find projects, document their impact, and showcase their service.

## 🌟 Overview

A streamlined platform for discovering local service opportunities, tracking hours, and showcasing impact with achievements and leaderboards.

## 🚀 Website Features

**User Roles**
- General user: browse and join projects, track hours, earn achievements, generate a volunteer resume
- Website admin: review and approve projects, view platform statistics

**User Management**
- User registration and login
- Profile creation with school, interests, and availability
- Automatic profile completion check

**Project System**
- Browse approved volunteer projects
- Submit new project ideas (requires admin approval)
- Request to join projects (creator approval workflow)
- Track participation and project details with images and requirements
- Edit or delete the submitted projects (if pending)

**Volunteer Tracking**
- Log volunteer hours for joined projects
- Mark projects as completed
- Track total hours, projects, and points
- Automatic achievement unlocking

**Gamification**
- Points system (10 points per hour)
- Level progression based on points
- Achievement badges for milestones
- Real-time leaderboard rankings

**Admin Features**
- Admin dashboard for project approval
- Approve or reject submitted projects
- View platform statistics


**Public Access**
- FAQ page explaining how the platform works
- Browse projects
- Leaderboards and platform statistics


## 📱 How to Use

### For Students

1. **Sign Up**: Create an account with your school email
2. **Complete Profile**: Add your school, grade, and interests
3. **Browse Projects**: Look for volunteer opportunities that interest you
4. **Request to Join**: Click "Request to Join" on a project (creator approves)
5. **Track Hours**: Log your volunteer hours as you work
6. **Complete Projects**: Mark projects as finished when done
7. **Earn Rewards**: Unlock achievements and climb the leaderboard

### For Project Creators

1. **Submit Project**: Click "Submit New Project" to create a volunteer opportunity
2. **Fill Details**: Add project description, location, requirements, and images
3. **Review Requests**: Accept or deny join requests from students
4. **Manage Projects**: Edit or delete your projects from "My Projects"

### For Admins

1. **Access Dashboard**: Use the admin link in the navigation (admin users only)
2. **Review Projects**: See all pending project submissions
3. **Approve/Reject**: Make decisions on project submissions
4. **View Statistics**: Monitor platform usage and activity

## 🛠️ Tech Stack

- React (JavaScript), AWS Amplify Gen2, DynamoDB, AWS Cognito
- Core models: Users, Projects, VolunteerActivities, Achievements, JoinRequests

## 🔗 Navigation

- **Home** (`/`) - Featured projects and platform overview
- **Projects** (`/projects`) - Browse all volunteer opportunities
- **Submit Project** (`/submit-project`) - Create new volunteer projects
- **My Projects** (`/my-projects`) - Your submitted and joined projects
- **Profile** (`/profile`) - Your stats, achievements, and progress
- **Leaderboard** (`/leaderboard`) - Rankings and competition
- **FAQ** (`/faq`) - How the platform works
- **Admin** (`/admin`) - Project approval dashboard (admin only)

## 🎮 Gamification System

**Points & Levels:**
- Earn 10 points for each volunteer hour
- Level up based on total points earned
- Level 1: 0-100 points, Level 2: 101-250 points, etc.

**Achievements:**
- 🌟 First Project - Complete your first volunteer project
- ⏰ Hour Hero - Log 10+ volunteer hours
- ⭐ Volunteer Star - Log 25+ volunteer hours
- And more achievements unlock as you volunteer

**Leaderboards:**
- Rank by total hours volunteered
- Rank by total points earned
- School competition rankings
- Monthly and all-time leaderboards

## 📊 Platform Statistics

The platform tracks and displays:
- Total volunteer hours logged
- Number of active projects
- Registered users and volunteers
- Projects by category and location
- School participation rates

## 🔮 Future work

- Smarter on‑site notifications for requests and approvals
- Enhance creator dashboard for easier request and member management
- Expand admin tools to support user moderation and role updates
- Add an insights dashboard with usage trends and activity summaries
- Enable volunteer discovery with quick profile previews


