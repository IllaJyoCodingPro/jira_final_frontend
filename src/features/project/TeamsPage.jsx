import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import TeamsView from './TeamsView';
import { teamService } from '../../services/teamService';
import { authService } from '../../services/authService';
import CreateTeamModal from './CreateTeamModal';
import { RefreshCw, Plus } from 'lucide-react';
import './ProjectSettings.css';

const TeamsPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchTeams = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const data = await teamService.getByProject(projectId);
            setTeams(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch teams", error);
            if (teams.length === 0) {
                setError("The server encountered an error while loading teams.");
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm("Are you sure you want to delete this team?")) return;
        try {
            await teamService.delete(teamId);
            setTeams(prev => prev.filter(t => t.id !== teamId));
        } catch (err) {
            alert(`Failed to delete team: ${err.message}`);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const projects = await projectService.getAll();
                const found = projects.find(p => String(p.id) === String(projectId));
                setProject(found);

                await Promise.all([fetchTeams(true), fetchUsers()]);
            } catch (error) {
                console.error("Failed to fetch page data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    if (loading && !teams.length) {
        return (
            <div className="settings-loading" style={{ height: 'calc(100vh - 64px)' }}>
                <Loader2 className="animate-spin" /> Loading teams context...
            </div>
        );
    }

    return (
        <div className="teams-page-container container-fluid p-4">
            <header className="teams-page-header mb-4 glass p-4 rounded-3 d-flex align-items-center gap-4">
                <div style={{ flexShrink: 0 }}>
                    <h1 className="h3 mb-1">Teams {project ? `| ${project.name}` : ''}</h1>
                    <p className="text-secondary mb-0">Manage and organize teams for {project ? project.name : 'this project'}</p>
                </div>

                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid #dfe1e6', paddingLeft: '24px' }}>
                    {lastUpdated && (
                        <span className="sync-indicator" style={{ fontSize: '11px', color: '#5e6c84', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                            Last sync: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <div className="header-button-group" style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn-upload"
                            onClick={() => fetchTeams()}
                            disabled={loading}
                            style={{ height: '36px', padding: '0 12px' }}
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
                            Refresh
                        </button>
                        <button className="btn-save btn-primary" onClick={() => setShowCreateModal(true)} style={{ height: '36px' }}>
                            <Plus size={16} /> Create Team
                        </button>
                    </div>
                </div>
            </header>

            <div className="teams-page-content px-4">
                {projectId ? (
                    <TeamsView
                        projectId={projectId}
                        teams={teams}
                        users={users}
                        loading={loading}
                        error={error}
                        onDeleteTeam={handleDeleteTeam}
                    />
                ) : (
                    <div className="empty-state glass p-5 text-center">
                        <Users size={48} className="mb-3 text-secondary" />
                        <h3>No Project Selected</h3>
                        <p>Please select a project to manage its teams.</p>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateTeamModal
                    projectId={projectId}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchTeams();
                    }}
                    users={users}
                />
            )}
        </div>
    );
};

export default TeamsPage;