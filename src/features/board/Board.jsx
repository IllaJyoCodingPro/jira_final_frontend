import React, { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useParams, useNavigate } from 'react-router-dom';
import { storyService } from '../../services/storyService';
import { epicService } from '../../services/epicService';
import { projectService } from '../../services/projectService';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
import BoardColumn from './BoardColumn';
import CreateIssueModal from './CreateIssueModal';
import { usePermissions } from '../../hooks/usePermissions';
import { Search, Plus, Kanban, Filter } from 'lucide-react';
import { ISSUE_STATUS, ISSUE_TYPES } from '../../constants';
import './Board.css';

const COLUMNS = [ISSUE_STATUS.TODO, ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.REVIEW, ISSUE_STATUS.DONE];

const normalizeStatus = (status) => {
    if (!status) return ISSUE_STATUS.TODO;
    const s = status.toUpperCase().replace('_', ' ').trim();
    if (s.includes('PROGRESS')) return ISSUE_STATUS.IN_PROGRESS;
    if (s.includes('REVIEW') || s.includes('VERIFY')) return ISSUE_STATUS.REVIEW;
    if (s.includes('DONE') || s.includes('COMPLETED')) return ISSUE_STATUS.DONE;
    return ISSUE_STATUS.TODO; // Default fallback
};

const Board = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [epics, setEpics] = useState([]);
    const [selectedEpicId, setSelectedEpicId] = useState(null);

    const [selectedType, setSelectedType] = useState('All');
    const [selectedTeam, setSelectedTeam] = useState('All');
    const [teams, setTeams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [project, setProject] = useState(null);
    const [issueTypes, setIssueTypes] = useState([]);
    const { canCreateIssue, canDragDrop } = usePermissions();

    useEffect(() => {
        if (projectId) {
            teamService.getByProject(projectId)
                .then(setTeams)
                .catch(err => console.error("Failed to fetch teams", err));
        }
    }, [projectId]);

    const fetchIssues = async () => {
        try {
            const data = await storyService.getByProject(projectId);
            setIssues(data);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        }
    };

    const fetchEpics = async () => {
        try {
            const data = await epicService.getByProject(projectId);
            const epicsList = Array.isArray(data) ? data : [];
            setEpics(epicsList);
            // Don't auto-select any epic - show all issues by default
        } catch (error) {
            console.error("Failed to fetch epics", error);
        }
    }

    const fetchProject = async () => {
        try {
            const projects = await projectService.getAll();
            const current = projects.find(p => String(p.id) === String(projectId));
            setProject(current);
        } catch (error) {
            console.error("Failed to fetch project", error);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchIssues();
            fetchEpics();
            fetchProject();
            storyService.getIssueTypes()
                .then(data => setIssueTypes(Array.isArray(data) ? data : []))
                .catch(err => console.error("Failed to fetch issue types", err));
        }
    }, [projectId]);

    // Helper for consistency
    const isMatch = (issue) => {
        const queryMatch = !searchQuery ||
            issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (issue.story_pointer && issue.story_pointer.toLowerCase().includes(searchQuery.toLowerCase()));

        const typeMatch = selectedType === 'All' ||
            (issue.issue_type || issue.type || ISSUE_TYPES.STORY).toUpperCase() === selectedType.toUpperCase();

        const teamMatch = selectedTeam === 'All' || String(issue.team_id) === String(selectedTeam);

        // Filter by selected Epic (if any)
        let epicMatch = true;
        if (selectedEpicId === 'NO_EPIC') {
            // Match issues explicitly WITHOUT an epic (null, undefined, or empty string)
            epicMatch = !issue.epic_id || issue.epic_id === '';
        } else if (selectedEpicId) {
            // Match issues with specific epic
            epicMatch = String(issue.epic_id) === String(selectedEpicId);
        }
        // When selectedEpicId is null, epicMatch stays true (show all issues)

        return queryMatch && typeMatch && teamMatch && epicMatch;
    };

    // Filter tasks for the board
    const getFilteredTasks = () => {
        const grouped = {};
        COLUMNS.forEach(col => grouped[col] = []);

        issues.forEach(issue => {
            // Ignore if it's an Epic itself (though epics shouldn't be in the issues list anymore usually, 
            // but just in case APIs are mixed)
            if (issue.issue_type === ISSUE_TYPES.EPIC) return;

            const normalized = normalizeStatus(issue.status);

            if (isMatch(issue)) {
                grouped[normalized].push(issue);
            }
        });
        return grouped;
    };

    const boardColumns = getFilteredTasks();

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;

        // Optimistic update
        const updatedIssues = issues.map(issue => {
            if (String(issue.id) === draggableId) {
                return { ...issue, status: newStatus };
            }
            return issue;
        });
        setIssues(updatedIssues);

        try {
            await storyService.updateStatus(parseInt(draggableId), newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            fetchIssues(); // Revert
        }
    };

    const handleEpicClick = (epicId) => {
        if (selectedEpicId === epicId) {
            setSelectedEpicId(null); // Deselect
        } else {
            setSelectedEpicId(epicId);
        }
    };

    // Filter allowed issue types for display
    const allowedTypes = issueTypes.filter(t => !['Epic', 'Task', 'Sub-task'].includes(t));

    return (
        <div className="jira-board-container">
            <header className="jira-board-header glass">
                <div className="header-left">
                    <div className="board-title-group">
                        <Kanban className="title-icon" />
                        <h1>{project ? project.name : 'Board'}</h1>
                    </div>
                </div>

                <div className="header-right">
                    <div className="board-search glass-subtle">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <div className="board-filters">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="jira-select"
                            >
                                <option value="All">All Types</option>
                                {allowedTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>

                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="jira-select"
                            >
                                <option value="All">All Teams</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            <select
                                value={selectedEpicId || 'ALL'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'ALL') {
                                        setSelectedEpicId(null);
                                    } else if (value === 'NO_EPIC') {
                                        setSelectedEpicId('NO_EPIC');
                                    } else {
                                        // Parse to number for proper comparison
                                        setSelectedEpicId(parseInt(value));
                                    }
                                }}
                                className="jira-select"
                            >
                                <option value="ALL">All Epics</option>
                                <option value="NO_EPIC">No Epic</option>
                                {epics.map(epic => (
                                    <option key={epic.id} value={epic.id}>{epic.title}</option>
                                ))}
                            </select>

                            {(selectedType !== 'All' || selectedTeam !== 'All' || searchQuery || selectedEpicId) && (
                                <button
                                    className="btn-clear-filters"
                                    onClick={() => { setSelectedType('All'); setSelectedTeam('All'); setSearchQuery(''); setSelectedEpicId(null); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#0052cc',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        padding: '0 8px',
                                        height: '32px'
                                    }}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                    {canCreateIssue() && (
                        <button className="create-issue-btn" onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} />
                            <span>Create issue</span>
                        </button>
                    )}
                </div>
            </header>

            {project && project.description && (
                <div className="board-subtitle">
                    {project.description}
                </div>
            )}

            <main className="jira-board-canvas" style={{ flexDirection: 'column', gap: '20px' }}>

                {/* 1. EPICS SECTION */}
                <div className="epics-panel-section">
                    <div className="epics-panel-header">
                        <span className="epics-panel-title">EPICS ({epics.length})</span>
                    </div>
                    <div className="epics-panel-list">
                        {epics.length === 0 ? (
                            <div className="no-epics-placeholder" style={{ padding: '12px', fontSize: '13px', color: '#6b778c', textAlign: 'center' }}>
                                No epics created yet.
                            </div>
                        ) : (
                            epics.map(epic => (
                                <div
                                    key={epic.id}
                                    className={`epic-panel-card ${selectedEpicId === epic.id ? 'active' : ''}`}
                                    onClick={() => handleEpicClick(epic.id)}
                                >
                                    <div className="epic-card-top">
                                        <span className="epic-card-key" style={{ background: selectedEpicId === epic.id ? '#fff' : undefined }}>
                                            EPIC
                                        </span>
                                    </div>
                                    <div className="epic-card-title">{epic.title}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. KANBAN BOARD SECTION (Issues) */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="simple-board-view" style={{ display: 'flex', gap: '16px', height: '100%' }}>
                        {COLUMNS.map(status => (
                            <BoardColumn
                                key={status}
                                id={status}
                                title={status}
                                isDragDisabled={!canDragDrop()}
                                issues={boardColumns[status] || []}
                                teams={teams}
                                showHeader={true}
                                onIssueClick={(issue) => navigate(`/projects/${projectId}/issues/${issue.id}`)}
                            />
                        ))}
                    </div>
                </DragDropContext>
            </main>

            <CreateIssueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
                onIssueCreated={() => {
                    fetchIssues();
                    fetchEpics(); // Also refresh epics if one was just created
                }}
            />
        </div>
    );
};

export default Board;
