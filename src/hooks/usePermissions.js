import { useAuth } from '../context/AuthContext';
import { ROLES, ISSUE_TYPES } from '../constants';

/**
 * Custom hook for role-based permission checks
 * Roles: ADMIN, DEVELOPER, TESTER, OTHER
 */
export const usePermissions = () => {
    const { user } = useAuth();
    const userRole = user?.role?.toUpperCase() || ROLES.OTHER;

    // Check if user can create projects
    const canCreateProject = () => {
        return userRole === ROLES.ADMIN;
    };

    // Check if user can create issues
    const canCreateIssue = (issueType = null) => {
        if (userRole === ROLES.ADMIN || userRole === ROLES.DEVELOPER) {
            return true;
        }
        if (userRole === ROLES.TESTER) {
            // Testers can only create Bug type issues
            return !issueType || issueType.toUpperCase() === ISSUE_TYPES.BUG.toUpperCase();
        }
        return false;
    };

    // Check if user can edit an issue
    const canEditIssue = (issue) => {
        if (userRole === ROLES.ADMIN) {
            return true; // Admin can edit any issue
        }
        if (userRole === ROLES.DEVELOPER || userRole === ROLES.TESTER) {
            // Can only edit their own assigned issues
            return issue?.assignee_id === user?.id;
        }
        return false; // OTHER role cannot edit
    };

    // Check if user can delete issues
    const canDeleteIssue = () => {
        return userRole === ROLES.ADMIN;
    };

    // Check if user can manage users
    const canManageUsers = () => {
        return userRole === ROLES.ADMIN;
    };

    // Check if user can change sprint/release
    const canChangeSprintRelease = () => {
        return userRole === ROLES.ADMIN || userRole === ROLES.DEVELOPER;
    };

    // Check if user can update status
    const canUpdateStatus = () => {
        return userRole === ROLES.ADMIN || userRole === ROLES.DEVELOPER || userRole === ROLES.TESTER;
    };

    // Check if user can assign issues to others
    const canAssignIssues = () => {
        return userRole === ROLES.ADMIN;
    };

    // Check if user can drag and drop issues
    const canDragDrop = () => {
        return userRole !== ROLES.OTHER;
    };

    // Check if user has read-only access
    const isReadOnly = () => {
        return userRole === ROLES.OTHER;
    };

    // Get available issue types for user
    const getAvailableIssueTypes = () => {
        if (userRole === ROLES.TESTER) {
            return [ISSUE_TYPES.BUG];
        }
        return [ISSUE_TYPES.STORY, ISSUE_TYPES.TASK, ISSUE_TYPES.BUG];
    };

    // Check if user is admin
    const isAdmin = () => {
        return userRole === ROLES.ADMIN;
    };

    // Check if team field is editable
    const canEditTeamField = () => {
        return userRole === ROLES.ADMIN || userRole === ROLES.DEVELOPER;
    };

    // Check if user is a team lead (role-wise)
    const isTeamLead = () => {
        return userRole === ROLES.ADMIN || userRole === ROLES.DEVELOPER;
    };

    // Check if issue is read-only
    const isIssueReadOnly = (issue) => {
        return !canEditIssue(issue);
    };

    return {
        userRole,
        isAdmin,
        canCreateProject,
        canCreateIssue,
        canEditIssue,
        canDeleteIssue,
        canManageUsers,
        canChangeSprintRelease,
        canUpdateStatus,
        canAssignIssues,
        canDragDrop,
        isReadOnly,
        getAvailableIssueTypes,
        canEditTeamField,
        isTeamLead,
        isIssueReadOnly,
    };
};

export default usePermissions;
