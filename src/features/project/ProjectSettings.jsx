import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Settings,
    Save,
    CheckCircle,
    AlertTriangle,
    ToggleLeft,
    ToggleRight,
    User,
    Clock
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { authService } from '../../services/authService';
import { formatDateTime } from '../../utils/dateUtils';
import './ProjectSettings.css';

const ProjectSettings = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState({ name: '', project_prefix: '', is_active: true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [creatorName, setCreatorName] = useState('Unknown');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const [projectsData, usersData] = await Promise.all([
                    projectService.getAll(),
                    authService.getAllUsers()
                ]);

                const current = projectsData.find(p => String(p.id) === String(projectId));
                if (current) {
                    setProject(current);
                    // Find creator name
                    // Find creator name
                    const users = Array.isArray(usersData) ? usersData : [];
                    const creator = users.find(u => u.id === current.owner_id);
                    if (creator) setCreatorName(creator.username || creator.name);
                }
            } catch (err) {
                console.error("Failed to load project details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await projectService.update(projectId, {
                name: project.name,
                project_prefix: project.project_prefix
            });
            setMessage({ type: 'success', text: 'Project settings updated successfully.' });
        } catch (err) {
            console.error("Failed to update project", err);
            setMessage({ type: 'error', text: 'Failed to update project settings.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleToggleActive = async () => {
        if (!window.confirm(`Are you sure you want to ${project.is_active ? 'deactivate' : 'activate'} this project?`)) return;

        setSaving(true);
        setMessage(null);
        try {
            await projectService.update(projectId, {
                is_active: !project.is_active
            });
            setProject(prev => ({ ...prev, is_active: !prev.is_active }));
            setMessage({
                type: 'success',
                text: `Project ${project.is_active ? 'deactivated' : 'activated'} successfully.`
            });
        } catch (err) {
            console.error("Failed to toggle project status", err);
            setMessage({ type: 'error', text: 'Failed to update project status.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };





    if (loading) return <div className="settings-loading">Loading configuration...</div>;

    return (
        <div className="settings-page animate-fade-in">
            <header className="settings-header glass">
                <div className="header-title-group">
                    <div className="title-icon-container">
                        <Settings className="title-icon" />
                    </div>
                    <div>
                        <h1>Project Settings</h1>
                        <span className="subtitle">Configure your workspace and project details</span>
                    </div>
                </div>
            </header>

            <div className="settings-container">
                <aside className="settings-nav">
                    <div className="nav-group">
                        <span className="nav-label">General</span>
                        <div className="nav-item active"><Settings size={18} /> Details</div>
                    </div>

                </aside>

                <main className="settings-main">
                    <div className="settings-card glass">
                        <form onSubmit={handleSave}>
                            <div className="settings-section">
                                <div className="section-header">
                                    <h3>General Details</h3>
                                    <p>Tell us about your project</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="jira-label">Project Name</label>
                                        <input
                                            className="jira-input-premium"
                                            type="text"
                                            value={project.name}
                                            onChange={e => setProject({ ...project, name: e.target.value })}
                                            placeholder="e.g. Website Overhaul"
                                        />
                                        <p className="field-hint">Appear in sidebars and project lists</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="jira-label">Project Key</label>
                                        <input
                                            className="jira-input-premium"
                                            type="text"
                                            value={project.project_prefix}
                                            onChange={e => setProject({ ...project, project_prefix: e.target.value })}
                                            placeholder="e.g. WEB"
                                        />
                                        <p className="field-hint">Prefix for issue IDs (e.g. WEB-123)</p>
                                    </div>


                                </div>
                            </div>

                            <div className="settings-section">
                                <div className="section-header">
                                    <h3>Project Identity</h3>
                                    <p>Core identification and administrative details</p>
                                </div>
                                <div className="identity-grid">
                                    <div className="identity-item glass-subtle">
                                        <div className="identity-icon admin">
                                            <User size={18} />
                                        </div>
                                        <div className="identity-content">
                                            <span className="identity-label">Admin / Creator</span>
                                            <span className="identity-value">{creatorName}</span>
                                        </div>
                                    </div>
                                    <div className="identity-item glass-subtle">
                                        <div className="identity-icon date">
                                            <Clock size={18} />
                                        </div>
                                        <div className="identity-content">
                                            <span className="identity-label">Created on</span>
                                            <span className="identity-value">
                                                {project.created_at ? formatDateTime(project.created_at) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {message && (
                                <div className={`settings-toast ${message.type} animate-slide-up`}>
                                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <div className="settings-footer">
                                <button type="submit" className="btn-save btn-primary" disabled={saving}>
                                    <Save size={16} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>

                                <div style={{ flex: 1 }}></div>

                                <button
                                    type="button"
                                    className={`btn-save ${project.is_active ? 'btn-danger' : 'btn-success'}`}
                                    onClick={handleToggleActive}
                                    disabled={saving}
                                >
                                    {project.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    {project.is_active ? 'Deactivate Project' : 'Activate Project'}
                                </button>
                            </div>
                        </form>
                    </div>


                </main>
            </div >
        </div >
    );
};

export default ProjectSettings;
