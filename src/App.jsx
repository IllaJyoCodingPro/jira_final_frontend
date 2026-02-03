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

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><YourWork /></ProtectedRoute>} />
                    <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
                    <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectSummary /></ProtectedRoute>} />
                    <Route path="/projects/:projectId/backlog" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
                    <Route path="/projects/:projectId/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
                    <Route path="/projects/:projectId/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
                    <Route path="/projects/:projectId/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                    <Route path="/projects/:projectId/settings" element={<ProtectedRoute><ProjectSettings /></ProtectedRoute>} />
                    <Route path="/projects/:projectId/issues/:issueId" element={<ProtectedRoute><IssueDetailPage /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><YourWork /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
