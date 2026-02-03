import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/projectService';
import { storyService } from '../../services/storyService';
import { authService } from '../../services/authService';
import { ISSUE_STATUS, ROLES } from '../../constants';
import CreateProjectModal from './CreateProjectModal';
import CreateTeamModal from './CreateTeamModal';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProjectList.css';
import {
    Hash,
    ChevronRight,
    Users,
    Layers,
    Search,
    Filter,
    MoreHorizontal,
    Settings
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

const ProjectList = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [projectStats, setProjectStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [teamProjectId, setTeamProjectId] = useState(null);
    const [users, setUsers] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navigate = useNavigate();

    // Fetch users for the Team Modal
    useEffect(() => {
        if (isTeamModalOpen) {
            authService.getAllUsers()
                .then(data => setUsers(Array.isArray(data) ? data : []))
                .catch(err => console.error("Failed to fetch users", err));
        }
    }, [isTeamModalOpen]);
    
    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.more-btn') && !event.target.closest('.project-card-dropdown')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    const handleOpenTeamModal = (projectId) => {
        setTeamProjectId(projectId);
        setIsTeamModalOpen(true);
    };

    const fetchStats = async (projectsData) => {
        try {
            const stats = {};
            await Promise.all(projectsData.map(async (project) => {
                const stories = await storyService.getByProject(project.id);
                const total = stories.length;
                const done = stories.filter(s => [ISSUE_STATUS.DONE, 'DONE', 'COMPLETED'].includes(s.status?.toUpperCase() || s.status)).length;
                stats[project.id] = {
                    total,
                    done,
                    percent: total > 0 ? Math.round((done / total) * 100) : 0,
                    todo: stories.filter(s => [ISSUE_STATUS.TODO, 'TODO'].includes(s.status?.toUpperCase() || s.status)).length,
                    inProgress: stories.filter(s => [ISSUE_STATUS.IN_PROGRESS, 'IN_PROGRESS'].includes(s.status?.toUpperCase() || s.status)).length,
                };
            }));
            setProjectStats(stats);
        } catch (error) {
            console.error("Failed to fetch project stats", error);
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAll();
            setProjects(data);
            await fetchStats(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.project_prefix.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="project-list-loading">Loading your workspace...</div>;

    return (
        <div className="project-list-page animate-fade-in">
            <header className="project-list-header glass">
                <div className="header-left">
                    <h1>Projects</h1>
                    <div className="breadcrumb">Manage and switch between your active workspaces</div>
                </div>
                <div className="header-actions">
                    <div className="search-box glass-subtle">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Find a project..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {user?.view_mode === ROLES.ADMIN && !user?.is_master_admin && (
                        <Button onClick={() => setIsModalOpen(true)} variant="primary">Create Project</Button>
                    )}
                </div>
            </header>

            <div className="project-list-content">
                <div className="project-grid">
                    {filteredProjects.map((project) => {
                        const stats = projectStats[project.id] || { total: 0, done: 0, percent: 0 };

                        return (
                            <div
                                key={project.id}
                                className="project-card glass-hover"
                                onClick={() => navigate(`/projects/${project.id}/summary`)}
                            >
                                <div className="card-top">
                                    <div className="project-avatar" style={{
                                        background: `linear-gradient(135deg, #0052cc, #00b8d9)`,
                                        boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)'
                                    }}>
                                        {project.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="project-info">
                                        <h3 className="project-name">{project.name}</h3>
                                        <span className="project-key">{project.project_prefix} Project</span>
                                    </div>
                                    <div className="more-btn-container" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            className="more-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === project.id ? null : project.id);
                                            }}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                        
                                        {activeDropdown === project.id && (
                                            <div className="project-card-dropdown glass animate-scale-in">
                                                <div 
                                                    className="dropdown-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/projects/${project.id}/settings`);
                                                        setActiveDropdown(null);
                                                    }}
                                                >
                                                    <Settings size={14} />
                                                    <span>Project Settings</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="stat-row">
                                        <div className="stat-item">
                                            <span className="stat-label">Total Issues</span>
                                            <span className="stat-value">{stats.total}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Progress</span>
                                            <span className="stat-value">{stats.percent}%</span>
                                        </div>
                                    </div>

                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${stats.percent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="footer-left">
                                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                            Created: {formatDateTime(project.created_at)}
                                        </span>
                                    </div>
                                    <ChevronRight className="arrow-icon" size={18} />
                                </div>
                            </div>
                        );
                    })}

                    {filteredProjects.length === 0 && (
                        <div className="no-projects-empty">
                            <Layers size={48} color="#dfe1e6" />
                            <h3>No projects found</h3>
                            <p>Get started by creating your first project.</p>
                            {user?.view_mode === ROLES.ADMIN ? (
                                <Button onClick={() => setIsModalOpen(true)} variant="primary">New Project</Button>
                            ) : (
                                <p style={{ fontSize: '13px', color: '#6b778c', marginTop: '10px' }}>
                                    Switch to <strong>Admin Mode</strong> in your profile to create a project.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={(newProject) => {
                    fetchProjects();
                    if (newProject && newProject.id) {
                        navigate(`/projects/${newProject.id}/board`);
                    }
                }}
                onCreateTeam={handleOpenTeamModal}
            />

            {isTeamModalOpen && (
                <CreateTeamModal
                    projectId={teamProjectId}
                    users={users}
                    onClose={() => setIsTeamModalOpen(false)}
                    onSuccess={() => {
                        setIsTeamModalOpen(false);
                        // Optionally refresh specific project stats or just let it be
                    }}
                />
            )}
        </div>
    );
};

export default ProjectList;
