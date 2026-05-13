# Career GPS Platform - Frontend

React-based frontend application for the Career GPS Platform, built with Vite, React Router, and Tailwind CSS.

## Features Implemented

### Task 20.1: React Project Setup ✅
- **Vite Configuration**: Modern build tool with React plugin
- **Tailwind CSS**: Utility-first CSS framework configured
- **React Router**: Client-side routing with v6
- **Environment Configuration**: `.env` file for API URL and app settings
- **Proxy Setup**: Vite proxy configured to forward `/api` requests to backend (port 5000)

### Task 20.2: Authentication Context and Hooks ✅
- **AuthContext**: Global authentication state management
- **useAuth Hook**: Custom hook for accessing auth state
- **Login/Register**: Functions to authenticate users
- **Logout**: Clear auth state and tokens
- **Token Management**: 
  - Store JWT tokens in localStorage
  - Automatic token refresh every 50 minutes
  - Token expiration handling
- **User State**: Persist user data across page refreshes

### Task 20.3: API Service Layer ✅
- **Axios Instance**: Configured with base URL and timeout
- **Request Interceptor**: Automatically adds Authorization header with JWT token
- **Response Interceptor**: 
  - Handles 401 errors
  - Automatically refreshes expired tokens
  - Retries failed requests with new token
  - Redirects to login on refresh failure
- **API Modules**:
  - `authAPI`: register, login, logout, refreshToken
  - `usersAPI`: getMe, updateMe, getUserById, deleteAccount
  - `careerAPI`: createOrUpdateProfile, analyzeSkillGap, generateRoadmap, getDashboard
  - `coursesAPI`: listCourses, getCourseById, createCourse, updateCourse, deleteCourse, getCourseLessons
  - `lessonsAPI`: getLessonById, createLesson, updateLesson, deleteLesson, markLessonComplete, getTranscript
  - `enrollmentsAPI`: enrollInCourse, getUserEnrollments, getEnrollmentById, unenrollFromCourse
  - `certificatesAPI`: getUserCertificates, getCertificateById, verifyCertificate, downloadCertificate
  - `creatorsAPI`: applyAsCreator, getMyApplication, getCreatorDashboard, getCreatorCourses, getCreatorAnalytics
  - `adminAPI`: listCreatorApplications, reviewApplication, getPlatformAnalytics, listUsers, updateUserRole, deleteUser, getSkillDemandAnalytics

### Task 20.4: Protected Route Component ✅
- **ProtectedRoute**: Wrapper component for authenticated routes
- **Loading State**: Shows spinner while checking authentication
- **Authentication Check**: Redirects to login if not authenticated
- **Role-Based Access**: Supports `allowedRoles` prop for role-based routing
- **Unauthorized Handling**: Redirects to unauthorized page if role doesn't match
- **Location State**: Preserves intended destination for post-login redirect

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx       # Protected route wrapper
│   ├── context/
│   │   └── AuthContext.jsx          # Authentication context and provider
│   ├── pages/                       # Page components (to be implemented)
│   ├── services/
│   │   └── api.js                   # API service layer with axios
│   ├── test/
│   │   └── setup.js                 # Test configuration
│   ├── utils/                       # Utility functions
│   ├── App.jsx                      # Main app component with routing
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles with Tailwind
├── .env                             # Environment variables
├── .env.example                     # Environment variables template
├── index.html                       # HTML template
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind CSS configuration
├── vite.config.js                   # Vite configuration
└── README.md                        # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running on http://localhost:5000

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Career GPS Platform
VITE_APP_VERSION=1.0.0
```

## Usage Examples

### Using Authentication

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      console.log('Logged in:', result.user);
    } else {
      console.error('Login failed:', result.error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Using API Services

```jsx
import { coursesAPI } from './services/api';

async function fetchCourses() {
  try {
    const data = await coursesAPI.listCourses({ page: 1, limit: 20 });
    console.log('Courses:', data.courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
  }
}
```

### Creating Protected Routes

```jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Home />} />
      
      {/* Protected route - requires authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Role-based route - requires creator or admin role */}
      <Route
        path="/creator/*"
        element={
          <ProtectedRoute allowedRoles={['creator', 'admin']}>
            <CreatorArea />
          </ProtectedRoute>
        }
      />
      
      {/* Admin-only route */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Testing

The project includes unit tests for:
- **AuthContext**: Authentication state management and token handling
- **API Service**: API endpoint structure and configuration
- **ProtectedRoute**: Route protection and role-based access

Run tests with:
```bash
npm test
```

## Next Steps

The following features are ready to be implemented:

1. **Authentication Pages**: Login, Register, and Password Reset forms
2. **Dashboard Pages**: Learner, Creator, and Admin dashboards
3. **Course Pages**: Course catalog, course details, lesson viewer
4. **Career Pages**: Skill gap analysis, learning roadmap
5. **Profile Pages**: User profile management
6. **Admin Pages**: User management, creator applications, analytics

## API Integration

All API endpoints are configured and ready to use. The backend must be running on `http://localhost:5000` for the frontend to work properly.

### Backend Requirements
- Node.js/Express API running on port 5000
- JWT authentication enabled
- CORS configured to allow requests from http://localhost:5173
- All endpoints documented in the design specification

## Technologies

- **React 18**: UI library
- **Vite 5**: Build tool and dev server
- **React Router 6**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS 3**: Utility-first CSS framework
- **Vitest**: Unit testing framework
- **Testing Library**: React component testing

## License

This project is part of the Career GPS Platform.
