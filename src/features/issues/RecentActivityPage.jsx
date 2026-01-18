import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { statsService } from '../../services/statsService';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { Activity, ArrowLeft, Loader2, User, Clock, Briefcase } from 'lucide-react';
import './RecentActivityPage.css';

const RecentActivityPage = () => {
    const { projectId } = useParams();
    const [activities, setActivities] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const promises = [statsService.getRecentActivity(projectId)];

            if (projectId) {
                promises.push(projectService.getAll().then(list => list.find(p => String(p.id) === String(projectId))));
            }

            const [activityData, projData] = await Promise.all(promises);
            setActivities(activityData);
            if (projData) setProject(projData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load activity feed');
        } finally {
            setLoading(false);
        }
    };

    const handleStoryClick = (issue) => {
        navigate(`/projects/${issue.project_id}/issues/${issue.id}`);
    };

    const formatActivityDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';

            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <div className="activity-page-container">
                <div className="activity-loading">
                    <Loader2 className="animate-spin" size={32} />
                    <p>Loading activity feed...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="activity-page-container animate-fade-in">
            <header className="activity-page-header glass">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {project ? (
                            <div className="project-icon-small" style={{
                                width: '40px',
                                height: '40px',
                                background: '#deebff',
                                color: '#0052cc',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700'
                            }}>
                                {project.name.charAt(0).toUpperCase()}
                            </div>
                        ) : (
                            <Activity size={24} color="#0052cc" />
                        )}
                        <div>
                            <h1>{project ? `${project.name} Activity` : 'Recent Activity'}</h1>
                            <p className="subtitle">
                                {project ? `Updates for project ${project.project_prefix}` : 'Global feed of all updates across your projects'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <div className="activity-count">
                        <strong>{activities.length}</strong> items
                    </div>
                </div>
            </header>

            <main className="activity-content">
                {error ? (
                    <div className="activity-error">
                        <p>{error}</p>
                        <button className="jira-btn-primary" onClick={fetchData}>Retry</button>
                    </div>
                ) : activities.length > 0 ? (
                    <div className="activity-feed-grid">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="activity-feed-item glass-hover"
                                onClick={() => handleStoryClick(activity.issue)}
                            >
                                <div className="activity-item-main">
                                    <div className="actor-avatar">
                                        {activity.actor.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="activity-details">
                                        <div className="activity-header">
                                            <span className="actor-name">{activity.actor.username}</span>
                                            <span className={`action-badge ${activity.action.toLowerCase()}`}>
                                                {activity.action}
                                            </span>
                                            <span className="target-text">an issue in</span>
                                            <span className="project-name">{activity.issue.project_name}</span>
                                        </div>

                                        <div className="issue-reference">
                                            <span className="issue-key">{activity.issue.key}</span>
                                            <span className="issue-title">{activity.issue.title}</span>
                                        </div>

                                        <div className="change-details">
                                            {activity.changes.replace(/<[^>]*>/g, '')}
                                        </div>
                                    </div>
                                    <div className="activity-time">
                                        <Clock size={12} />
                                        {formatActivityDate(activity.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-activity">
                        <Activity size={48} />
                        <h3>No activity yet</h3>
                        <p>Activities will appear here once stories are created or updated.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RecentActivityPage;
