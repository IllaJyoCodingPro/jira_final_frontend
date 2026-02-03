import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    Users,
    Calendar as CalendarIcon,
    ArrowRight,
    Search,
    User,
    Layout,
    CheckCircle,
    Clock,
    Zap,
    Plus,
    Activity,
    BarChart2,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ChevronUp,
    ChevronDown,
    Minus,
    PieChart
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { storyService } from '../../services/storyService';
import { statsService } from '../../services/statsService';
import { formatRelativeTime } from '../../utils/dateUtils'; // Shared date formatting
import { logError } from '../../utils/renderUtils'; // Standardized logging
import { ISSUE_STATUS, ISSUE_PRIORITY, ISSUE_TYPES } from '../../constants';
import './ProjectSummary.css';

const ProjectSummary = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [issues, setIssues] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Batch fetch project details, issues, and activity logs
                const [projData, issuesData, activityData] = await Promise.all([
                    projectService.getAll().then(list => list.find(p => String(p.id) === String(projectId))),
                    storyService.getByProject(projectId),
                    statsService.getRecentActivity(projectId)
                ]);
                setProject(projData);
                setIssues(issuesData);
                setRecentActivity(activityData);
            } catch (err) {
                logError('ProjectSummaryLoad', err); // Using shared error logger
            } finally {
                setLoading(false); // Stop loading regardless of outcome
            }
        };
        loadData();
    }, [projectId]);

    const stats = useMemo(() => {
        const total = issues.length;
        const normalize = (s) => (s ? s.toString().toLowerCase().replace(/[_\s-]+/g, '') : '');

        const done = issues.filter(i => normalize(i.status) === normalize(ISSUE_STATUS.DONE)).length;
        const inProgress = issues.filter(i => normalize(i.status) === normalize(ISSUE_STATUS.IN_PROGRESS)).length;
        const todo = issues.filter(i => !i.status || normalize(i.status) === normalize(ISSUE_STATUS.TODO)).length;

        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        const typeCount = issues.reduce((acc, i) => {
            const type = i.issue_type || ISSUE_TYPES.STORY;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const priorityCount = issues.reduce((acc, i) => {
            const priority = i.priority || ISSUE_PRIORITY.MEDIUM;
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {});

        return { total, done, inProgress, todo, percent, typeCount, priorityCount };
    }, [issues]);

    const handleIssueClick = (issueId) => {
        navigate(`/projects/${projectId}/issues/${issueId}`);
    };

    if (loading) return <div className="summary-loading">Gathering project insights...</div>;

    return (
        <div className="summary-page animate-fade-in">
            <header className="summary-header">
                <div className="project-breadcrumb">
                    <Link to="/projects">Projects</Link>
                    <span>/</span>
                    <span className="current">{project?.name || 'Loading...'}</span>
                </div>
                <div className="project-title-row">
                    <div className="project-icon-large">
                        {project?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="project-info-main">
                        <h1>{project?.name}</h1>
                        <p className="project-desc">{project?.project_prefix} project • Software</p>
                    </div>
                </div>
            </header>

            <div className="stats-grid-modern animate-fade-in">
                <div className="stat-card-v2 glass-subtle">
                    <div className="stat-icon-v2 todo"><Clock size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">To Do</span>
                        <span className="stat-value">{stats.todo}</span>
                    </div>
                </div>
                <div className="stat-card-v2 glass-subtle">
                    <div className="stat-icon-v2 progress"><TrendingUp size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">In Progress</span>
                        <span className="stat-value">{stats.inProgress}</span>
                    </div>
                </div>
                <div className="stat-card-v2 glass-subtle">
                    <div className="stat-icon-v2 done"><CheckCircle2 size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{stats.done}</span>
                    </div>
                </div>
                <div className="stat-card-v2 glass-subtle">
                    <div className="stat-icon-v2 total"><AlertCircle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Issues</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
            </div>

            <div className="summary-grid">
                <div className="summary-main">
                    <div className="quick-actions-row">
                        <Link to={`/projects/${projectId}/board`} className="quick-action-card glass-subtle">
                            <Layout size={20} color="#0052cc" />
                            <span>Board</span>
                        </Link>
                        <Link to={`/projects/${projectId}/backlog`} className="quick-action-card glass-subtle">
                            <Plus size={20} color="#36b37e" />
                            <span>Backlog</span>
                        </Link>
                    </div>

                    {/* 1. PROJECT HEALTH (Top of main area) */}
                    <section className="summary-section glass stats-container-new full-width-health">
                        <div className="section-header">
                            <h2>Project Health</h2>
                            <div className="health-badge good">On Track</div>
                        </div>
                        <div className="health-content">
                            <div className="progress-ring-section">
                                <div className="percent">{stats.percent}%</div>
                                <div className="label">Complete</div>
                            </div>
                            <div className="health-details">
                                <div className="progress-bar-stack">
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${stats.percent}%` }}></div>
                                    </div>
                                    <div className="progress-counts">
                                        <div className="count-item">
                                            <span className="dot done"></span>
                                            <span>{stats.done} Done</span>
                                        </div>
                                        <div className="count-item">
                                            <span className="dot remaining"></span>
                                            <span>{stats.total - stats.done} Remaining</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. ISSUE TYPE DISTRIBUTION & RECENT ACTIVITY (Side-by-side) */}
                    <div className="distribution-activity-row">
                        <section className="summary-section glass chart-section-compact">
                            <div className="section-header">
                                <h2>Issue Types</h2>
                                <span className="section-subtitle">Breakdown</span>
                            </div>
                            <div className="distribution-content compact">
                                <div className="donut-wrapper-v2 small">
                                    <svg viewBox="0 0 100 100" className="donut-svg">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="#f4f5f7" strokeWidth="10" />
                                        {Object.entries(stats.typeCount).map(([type, count], idx, arr) => {
                                            let offset = 0;
                                            for (let i = 0; i < idx; i++) offset += (arr[i][1] / stats.total) * 100;
                                            const percent = (count / stats.total) * 100;
                                            const colors = ['#0052cc', '#36b37e', '#ffab00', '#ff5630', '#6554c0'];
                                            return (
                                                <circle
                                                    key={type}
                                                    cx="50" cy="50" r="42"
                                                    fill="transparent"
                                                    stroke={colors[idx % colors.length]}
                                                    strokeWidth="10"
                                                    strokeDasharray={`${percent} ${100 - percent}`}
                                                    strokeDashoffset={-offset}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 50 50)"
                                                    className="donut-segment"
                                                />
                                            );
                                        })}
                                    </svg>
                                    <div className="donut-center">
                                        <span className="total-num small">{stats.total}</span>
                                        <span className="total-label small">Issues</span>
                                    </div>
                                </div>
                                <div className="chart-legend-v2 vertical">
                                    {Object.entries(stats.typeCount).map(([type, count], idx) => (
                                        <div key={type} className="legend-item-v3">
                                            <span className="dot" style={{ background: ['#0052cc', '#36b37e', '#ffab00', '#ff5630', '#6554c0'][idx % 5] }}></span>
                                            <div className="legend-info">
                                                <span className="label">{type}</span>
                                                <span className="percent">{Math.round((count / stats.total) * 100)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="summary-section glass activity-section-compact">
                            <div className="section-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Activity size={20} color="#0052cc" />
                                    <h2>Activity</h2>
                                </div>
                                <Link to={`/projects/${projectId}/activity`} className="section-link">
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="recent-list-modern">
                                {recentActivity.length > 0 ? (
                                    recentActivity.slice(0, 3).map((activity, idx) => (
                                        <div key={idx} className="summary-activity-item compact" onClick={() => handleIssueClick(activity.issue.id)}>
                                            <div className="activity-meta">
                                                <span className="activity-user">{activity.actor.username}</span>
                                                <span>{formatRelativeTime(activity.created_at)}</span>
                                            </div>
                                            <div className="activity-title">
                                                <span style={{ color: '#0052cc', marginRight: '4px', fontSize: '11px' }}>{activity.issue.key}</span>
                                                {activity.issue.title.substring(0, 30)}...
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-activity-small" style={{ textAlign: 'center', padding: '20px', color: '#6b778c', fontSize: '13px' }}>
                                        No recent activity.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="summary-sidebar">
                    <section className="summary-section glass sidebar-section">
                        <h3>About this project</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <User size={16} />
                                <div>
                                    <span className="info-label">Lead</span>
                                    <span className="info-value">{project?.owner?.username || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <Search size={16} />
                                <div>
                                    <span className="info-label">Key</span>
                                    <span className="info-value">{project?.project_prefix}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <CalendarIcon size={16} />
                                <div>
                                    <span className="info-label">Created on</span>
                                    <span className="info-value">
                                        {project?.created_at
                                            ? new Date(project.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })
                                            : 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="summary-section glass sidebar-section">
                        <h3>Quick Links</h3>
                        <div className="quick-links">
                            <Link to={`/projects/${projectId}/calendar`} className="quick-link-item">
                                <CalendarIcon size={16} />
                                <span>Calendar View</span>
                            </Link>
                            <Link to={`/projects/${projectId}/timeline`} className="quick-link-item">
                                <TrendingUp size={16} />
                                <span>Project Roadmap</span>
                            </Link>
                        </div>
                    </section>

                    {/* 3. PRIORITY DISTRIBUTION (Sidebar) */}
                    <section className="summary-section glass sidebar-section priority-sidebar-section">
                        <h3>Priority Distribution</h3>
                        <div className="priority-list-sidebar">
                            {[ISSUE_PRIORITY.HIGH, ISSUE_PRIORITY.MEDIUM, ISSUE_PRIORITY.LOW].map((p) => {
                                const count = stats.priorityCount[p] || 0;
                                const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                return (
                                    <div key={p} className={`priority-item-sidebar p-${p.toLowerCase()}`}>
                                        <div className="p-header-sidebar">
                                            <span className="p-dot"></span>
                                            <span className="p-label">{p}</span>
                                            <span className="p-count-sidebar">{count}</span>
                                        </div>
                                        <div className="p-progress-sidebar">
                                            <div className="p-fill-sidebar" style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProjectSummary;
