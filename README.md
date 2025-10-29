# Project rush - Volunteer Management Platform
# Project rush - Volunteer Management Platform
🔗 Live site: https://main.d30jhxkza5tj8e.amplifyapp.com/

A web platform that connects high school students with local volunteer opportunities, featuring project management, hour tracking, achievements, and leaderboards.

## 🌟 What It Does

Project rush helps students find volunteer work in their community while tracking their impact. Students can:
- Browse and join volunteer projects
- Submit their own project ideas
- Track volunteer hours and earn points
- Unlock achievements and compete on leaderboards
- Complete their community service requirements

## 🚀 Current Features

### ✅ **Working Features**

**User Management**
- User registration and login with AWS Cognito
- Profile creation with school, interests, and availability
- Automatic profile completion check

**Project System**
- Browse approved volunteer projects
- Submit new project ideas (requires admin approval)
- Request to join projects (creator approval workflow)
- Track participation and project details with images and requirements
- Edit or delete your submitted projects (if pending)

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
- Manage user accounts

**Public Access**
- FAQ page explaining how the platform works
- Public project browsing (no login required)
- Platform statistics and information

### 🔧 **Technical Features**

**Database**
- 11 DynamoDB tables for complete data management
- Real-time data synchronization
- Secure user authorization

**Authentication**
- AWS Cognito integration
- Role-based access (users vs admins)
- Automatic profile creation

**User Interface**
- Responsive design for all devices
- Toast notifications for user feedback
- Loading states and error handling
- Clean, modern interface

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

## 🛠️ Technical Details

**Built With:**
- React with TypeScript
- AWS Amplify Gen2
- DynamoDB for data storage
- AWS Cognito for authentication

**Database Tables:**
- Users (profiles, stats, admin status)
- Projects (volunteer opportunities)
- VolunteerActivities (participation tracking)
- Achievements (badges and rewards)
- Organizations (partner groups)
- JoinRequests (request/approval workflow)
- And 5 more supporting tables

**Key Features:**
- Real-time data updates
- Secure user authentication
- Mobile-responsive design
- Admin approval workflow
- Achievement system
- Leaderboard rankings

## 🎯 Current Status

This is a **working demo platform** with all core features implemented:

✅ **Complete User Journey**
- Registration → Profile Setup → Browse Projects → Request to Join → Log Hours → Earn Achievements

✅ **Admin/Creator Workflow**
- Project Submission → Admin Review → Approval → Public Visibility
- Join Request → Creator Accept/Deny → Membership Added

✅ **Real Data**
- All information comes from the database
- No mock data or placeholder content
- Live statistics and leaderboards

✅ **Production Ready**
- Error handling and loading states
- Input validation and security
- Responsive design for all devices

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

## 🔒 Security & Privacy

- Secure user authentication with AWS Cognito
- Role-based access control (users vs admins)
- Data encryption in transit and at rest
- User privacy settings and controls
- Secure project approval workflow

## 🚀 Getting Started

1. **For Students**: Sign up with your school email and start browsing projects
2. **For Organizations**: Submit project ideas for admin approval
3. **For Admins**: Use the admin dashboard to manage the platform

## 🧭 Future Work

- In-app and email notifications for join requests and decisions
- Dedicated creator dashboard for managing requests and members
- Improved requester display (resolve user IDs to names/avatars)
- Capacity rules and waitlist flows
- Cooldowns/rate-limiting for repeated join requests
- Extended tests (unit/integration/UI)
- Analytics and audit logging for key actions
- Multi-language support and accessibility enhancements

## 📞 Support

Check the FAQ page (`/faq`) for answers to common questions about:
- How to create an account
- How to track volunteer hours
- How the approval process works
- How achievements and points are calculated
- How to submit projects

---

*Project rush - Connecting students with community volunteer opportunities*