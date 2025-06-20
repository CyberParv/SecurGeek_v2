# SecurGeek - Cybersecurity Training Platform

A modern, comprehensive cybersecurity training platform built with React and Supabase.

## Features

- **User Authentication**: Secure signup/login with email verification
- **Course Management**: Browse and enroll in cybersecurity courses
- **Progress Tracking**: Track learning progress and earn certificates
- **Admin Dashboard**: Comprehensive admin interface for managing users and courses
- **Role-Based Access**: Separate dashboards for students, instructors, and admins
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: React.js with Vite, Tailwind CSS, Redux Toolkit
- **Backend**: Supabase (Authentication, Database, Storage)
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Netlify (Frontend), Supabase (Backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd securgeek-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Go to your Supabase project dashboard
- Navigate to the SQL Editor
- Run the migration files in order:
  1. `supabase/migrations/create_initial_schema.sql`
  2. `supabase/migrations/insert_sample_data.sql`

5. Start the development server:
```bash
npm run dev
```

## Database Setup

### Creating the Database Schema

1. **Create Initial Schema**:
   - Copy the contents of `supabase/migrations/create_initial_schema.sql`
   - Paste and run it in your Supabase SQL Editor

2. **Insert Sample Data**:
   - Copy the contents of `supabase/migrations/insert_sample_data.sql`
   - Paste and run it in your Supabase SQL Editor

### Creating an Admin User

1. **Sign up normally** through the application interface
2. **Make the user an admin** by running this SQL in Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

## User Roles

### Student (Default)
- Browse and enroll in courses
- Track learning progress
- Access personal dashboard
- Download certificates

### Instructor
- Create and manage courses
- View student progress
- Upload course materials
- Manage course content

### Admin
- Full platform access
- User management
- Course management
- Analytics dashboard
- Security monitoring

## Key Features

### Authentication & Security
- Email verification required
- Strong password requirements
- Account lockout after failed attempts
- Row Level Security (RLS) policies
- Audit logging for admin actions

### Course Management
- Rich course content with videos and resources
- Progress tracking and completion certificates
- Interactive quizzes and assessments
- Course categories and filtering
- Search functionality

### Admin Dashboard
- User management interface
- Course creation and editing
- Analytics and reporting
- Security audit logs
- System monitoring

## API Endpoints

The application uses Supabase's auto-generated REST API with the following main tables:

- `profiles` - User profiles and roles
- `courses` - Course catalog
- `lessons` - Individual course lessons
- `enrollments` - User course enrollments
- `progress` - Lesson completion tracking
- `quizzes` - Course assessments
- `certificates` - Completion certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security

This platform implements several security measures:

- Row Level Security (RLS) on all database tables
- Input sanitization and validation
- Secure authentication with Supabase Auth
- Role-based access control
- Audit logging for sensitive operations
- HTTPS enforcement in production

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@securgeek.com or create an issue in the repository.