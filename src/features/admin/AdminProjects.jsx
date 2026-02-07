import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Users } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';
import ManageTeamsModal from './ManageTeamsModal';
import { formatDateTime } from '../../utils/dateUtils';
import './AdminProjects.css';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCreatorPopup, setActiveCreatorPopup] = useState(null);
    const [activeNamePopup, setActiveNamePopup] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAll();
            setProjects(data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };



    const [selectedProjectForTeams, setSelectedProjectForTeams] = useState(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.project_prefix.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="admin-projects-loading">Loading projects list...</div>;

    return (
        <div className="admin-projects-container">
            <div className="admin-projects-controls">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="projects-table-container">
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Key</th>
                            <th>Created At</th>
                            <th>Creator</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <div className="project-cell">
                                            <div className="project-icon" style={{
                                                background: `linear-gradient(135deg, #0052cc, #00b8d9)`
                                            }}>
                                                {project.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="project-name-wrapper">
                                                <span
                                                    className={`project-name-text ${project.name.length > 15 ? 'truncated' : ''}`}
                                                    onClick={() => project.name.length > 15 && setActiveNamePopup(activeNamePopup === project.id ? null : project.id)}
                                                >
                                                    {project.name.length > 15 ? `${project.name.substring(0, 15)}...` : project.name}
                                                </span>
                                                {activeNamePopup === project.id && (
                                                    <div className="name-popup animate-scale-in">
                                                        <div className="popup-header">Full Project Name</div>
                                                        <div className="popup-content">{project.name}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="key-badge">{project.project_prefix}</span></td>
                                    <td className="date-cell">{formatDateTime(project.created_at)}</td>
                                    <td className="creator-cell">
                                        <div
                                            className="creator-badge"
                                            onClick={() => setActiveCreatorPopup(activeCreatorPopup === project.id ? null : project.id)}
                                        >
                                            {project.admin_email ? project.admin_email.substring(0, 3).toUpperCase() : 'N/A'}
                                        </div>
                                        {activeCreatorPopup === project.id && (
                                            <div className="creator-popup animate-scale-in">
                                                <div className="popup-header">Created By</div>
                                                <div className="popup-content">
                                                    <strong>Email:</strong> {project.admin_email || 'N/A'}
                                                </div>
                                                <div className="popup-footer">Master Administrator</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn view"
                                            onClick={() => navigate(`/projects/${project.id}/summary`)}
                                            title="View Project"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                        <button
                                            className="action-btn-teamleads"
                                            onClick={() => setSelectedProjectForTeams(project)}
                                            title="Team Leads"
                                        >
                                            <Users size={14} style={{ marginRight: '6px' }} />
                                            Team Leads
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data">No projects found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedProjectForTeams && (
                <ManageTeamsModal
                    project={selectedProjectForTeams}
                    onClose={() => setSelectedProjectForTeams(null)}
                />
            )}
        </div>
    );
};

export default AdminProjects;
