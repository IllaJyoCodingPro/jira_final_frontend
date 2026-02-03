import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Features
import LandingPage from './features/landing/LandingPage';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import JiraIntroduction from './features/intro/JiraIntroduction';
import ProjectList from './features/project/ProjectList';
import ProjectSummary from './features/project/ProjectSummary';
import Issues from './features/issues/Issues';
import Board from './features/board/Board';
import Timeline from './features/timeline/Timeline';
import ProjectSettings from './features/project/ProjectSettings';
import Calendar from './features/calendar/Calendar';
import IssueDetailPage from './features/issues/IssueDetailPage';
import YourWork from './features/issues/YourWork';
import ProfilePage from './features/auth/ProfilePage';
import NotificationsPage from './features/notifications/NotificationsPage';
import RecentActivityPage from './features/issues/RecentActivityPage';
import UserManagement from './features/admin/UserManagement';
import ActiveSprints from './features/board/ActiveSprints';
import ListView from './features/issues/ListView';
import TeamsPage from './features/project/TeamsPage';
import TeamDetailsPage from './features/project/TeamDetailsPage';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';

// Layout
import Layout from './components/layout/Layout';

// Common Components
import DashboardRedirect from './components/common/DashboardRedirect';
import GlobalToast from './components/common/GlobalToast';
import GlobalModalContainer from './components/common/GlobalModalContainer';
import GlobalProjectModalContainer from './components/common/GlobalProjectModalContainer';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
};

// Standalone Route (for pages that don't require authentication)
const StandaloneRoute = ({ children }) => {
    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <GlobalToast />
                <GlobalModalContainer />
                <GlobalProjectModalContainer />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<StandaloneRoute><LandingPage /></StandaloneRoute>} />
                    <Route path="/login" element={<StandaloneRoute><Login /></StandaloneRoute>} />
                    <Route path="/signup" element={<StandaloneRoute><Signup /></StandaloneRoute>} />
                    <Route path="/about" element={<StandaloneRoute><JiraIntroduction /></StandaloneRoute>} />
                    <Route path="/forgot-password" element={<StandaloneRoute><ForgotPassword /></StandaloneRoute>} />
                    <Route path="/reset-password" element={<StandaloneRoute><ResetPassword /></StandaloneRoute>} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<YourWork />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/activity" element={<RecentActivityPage />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/projects" element={<ProjectList />} />
                        <Route path="/projects/:projectId" element={<ProjectSummary />} />
                        <Route path="/projects/:projectId/summary" element={<ProjectSummary />} />
                        <Route path="/projects/:projectId/backlog" element={<Issues />} />
                        <Route path="/projects/:projectId/board" element={<Board />} />
                        <Route path="/projects/:projectId/active-sprints" element={<ActiveSprints />} />
                        <Route path="/projects/:projectId/timeline" element={<Timeline />} />
                        <Route path="/projects/:projectId/activity" element={<RecentActivityPage />} />
                        <Route path="/projects/:projectId/calendar" element={<Calendar />} />
                        <Route path="/projects/:projectId/list" element={<ListView />} />
                        <Route path="/projects/:projectId/teams" element={<TeamsPage />} />
                        <Route path="/projects/:projectId/teams/:teamId" element={<TeamDetailsPage />} />
                        <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
                        <Route path="/projects/:projectId/issues/:issueId" element={<IssueDetailPage />} />
                        <Route path="/admin" element={<YourWork />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
