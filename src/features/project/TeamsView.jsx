import React from 'react';
import { Users, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProjectSettings.css';

const TeamsView = ({ teams, users, loading, error, projectId }) => {
    const navigate = useNavigate();

    if (loading && !teams.length) return <div className="settings-loading"><Loader2 className="animate-spin" /> Loading teams...</div>;

    return (
        <div className="teams-view animate-fade-in">
            <div className="teams-grid">
                {error && (
                    <div className="error-banner" style={{ margin: '20px 0' }}>
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {!error && teams.length === 0 ? (
                    <div className="empty-teams glass">
                        <Users size={48} className="empty-icon" />
                        <p>No teams created yet for this project.</p>
                    </div>
                ) : (
                    !error && teams.map((team, index) => (
                        <div
                            key={team.id}
                            className="team-card glass"
                            onClick={() => navigate(`/projects/${projectId}/teams/${team.id}`)}
                            style={{
                                cursor: 'pointer',
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div className="team-card-header">
                                <div className="team-icon">
                                    <Users size={20} />
                                </div>
                                <div className="team-info">
                                    <h4>{team.name}</h4>
                                    <span className="team-meta">{team.members?.length || 0} members</span>
                                </div>
                            </div>

                            <div className="team-leader">
                                <Shield size={14} className="leader-icon" title="Team Lead" />
                                <span>{team.lead?.username || users.find(u => u.id === team.lead_id)?.username || 'No Leader'}</span>
                            </div>

                            <div className="team-members">
                                {team.members && team.members.slice(0, 5).map((member, idx) => (
                                    <div key={idx} className="member-avatar-mini" title={member.username}>
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                                {team.members && team.members.length > 5 && (
                                    <div className="member-avatar-mini more">
                                        +{team.members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamsView;
