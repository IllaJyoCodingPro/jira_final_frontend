import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, LayoutGrid, List, SlidersHorizontal, Download } from 'lucide-react';
import { ISSUE_PRIORITY } from '../../constants';
import { storyService } from '../../services/storyService';
import { teamService } from '../../services/teamService';

import SprintSection from './SprintSection';
import CreateSprintModal from './CreateSprintModal';
import { usePermissions } from '../../hooks/usePermissions';

import './Issues.css';


const Issues = () => {

    const { projectId } = useParams();
    const navigate = useNavigate();

    const [backlogIssues, setBacklogIssues] = useState([]);
    const [sprints, setSprints] = useState([]);

    const [allStories, setAllStories] = useState([]);

    const [selectedSprint, setSelectedSprint] = useState('All');
    const [selectedAssignee, setSelectedAssignee] = useState('All');
    const [selectedTeam, setSelectedTeam] = useState('All');

    const [allSprintsList, setAllSprintsList] = useState([]);
    const [allAssigneesList, setAllAssigneesList] = useState([]);

    const [teams, setTeams] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);


    useEffect(() => {
        fetchStories();

        if (projectId) {
            teamService.getByProject(projectId)
                .then(setTeams)
                .catch(() => setTeams([]));
        }

    }, [projectId]);


    const fetchStories = async () => {
        if (!projectId) return;

        setLoading(true);

        try {

            const data = await storyService.getByProject(projectId);
            setAllStories(data);

            const uniqueSprints = [...new Set(
                data.map(i => i.sprint_number).filter(s => s && s !== 'Backlog')
            )];

            const uniqueAssignees = [...new Set(
                data.map(i => i.assignee).filter(a => a)
            )];

            setAllSprintsList(uniqueSprints);
            setAllAssigneesList(uniqueAssignees);

            applyFilters(data, selectedSprint, selectedAssignee, selectedTeam);

        } finally {
            setLoading(false);
        }
    };


    const applyFilters = (data, sprintFilter, assigneeFilter, teamFilter) => {

        const backlog = [];
        const sprintMap = {};

        data.forEach(issue => {

            const matchesSprint =
                sprintFilter === 'All' ||
                String(issue.sprint_number) === sprintFilter;

            const matchesAssignee =
                assigneeFilter === 'All' ||
                String(issue.assignee) === String(assigneeFilter);

            const matchesTeam =
                teamFilter === 'All' ||
                String(issue.team_id) === String(teamFilter);

            if (!(matchesSprint && matchesAssignee && matchesTeam)) return;

            if (!issue.sprint_number || issue.sprint_number === 'Backlog') {
                backlog.push(issue);
            } else {
                if (!sprintMap[issue.sprint_number]) {
                    sprintMap[issue.sprint_number] = {
                        id: `sprint-${issue.sprint_number}`,
                        name: `Sprint ${issue.sprint_number}`,
                        issues: []
                    };
                }
                sprintMap[issue.sprint_number].issues.push(issue);
            }
        });

        const weight = {
            [ISSUE_PRIORITY.HIGH.toLowerCase()]: 3,
            [ISSUE_PRIORITY.MEDIUM.toLowerCase()]: 2,
            [ISSUE_PRIORITY.LOW.toLowerCase()]: 1
        };

        const sortIssues = arr =>
            [...arr].sort((a, b) =>
                (weight[(b.priority || ISSUE_PRIORITY.MEDIUM).toLowerCase()] ?? 0) -
                (weight[(a.priority || ISSUE_PRIORITY.MEDIUM).toLowerCase()] ?? 0)
            );

        setBacklogIssues(sortIssues(backlog));

        setSprints(
            Object.values(sprintMap)
                .map(s => ({ ...s, issues: sortIssues(s.issues) }))
                .sort((a, b) => b.name.localeCompare(a.name))
        );
    };


    useEffect(() => {
        if (allStories.length)
            applyFilters(allStories, selectedSprint, selectedAssignee, selectedTeam);
    }, [selectedSprint, selectedAssignee, selectedTeam]);


    const onDragEnd = async (result) => {

        const { source, destination } = result;
        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        const getList = id => {
            if (id === 'backlog') return backlogIssues;
            return (sprints.find(s => s.id === id) || {}).issues || [];
        };

        const sourceList = getList(source.droppableId);
        const destList = getList(destination.droppableId);

        const [moved] = sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, moved);

        let newSprint = 'Backlog';

        if (destination.droppableId !== 'backlog') {
            newSprint = destination.droppableId.replace('sprint-', '');
        }

        try {
            await storyService.update(moved.id, {
                ...moved,
                sprint_number: newSprint
            });

            fetchStories();
        } catch (err) {
            console.error('Drag update failed', err);
        }
    };


    const handleCreateSprint = async sprintData => {
        try {
            if (!sprintData.selectedStoryIds || sprintData.selectedStoryIds.length === 0) {
                alert("No stories selected for this sprint.");
                return;
            }

            await Promise.all(
                sprintData.selectedStoryIds.map(issueId => {
                    const issue = allStories.find(i => i.id === issueId);
                    return storyService.update(issueId, {
                        ...issue,
                        sprint_number: sprintData.sprint_number
                    });
                })
            );

            fetchStories();

        } catch (err) {
            console.error('Sprint create failed', err);
        }
    };


    const { canDragDrop, canChangeSprintRelease } = usePermissions();

    if (loading) return <div style={{ padding: 40 }}>Loading…</div>;


    return (
        <DragDropContext onDragEnd={canDragDrop() ? onDragEnd : undefined}>

            <div className="backlog-container">

                <div className="backlog-header">

                    <h1>Issues</h1>

                    <div className="filters">

                        <select value={selectedSprint} onChange={e => setSelectedSprint(e.target.value)}>
                            <option value="All">All Sprints</option>
                            {allSprintsList.map(s => <option key={s} value={s}>Sprint {s}</option>)}
                        </select>

                        <select value={selectedAssignee} onChange={e => setSelectedAssignee(e.target.value)}>
                            <option value="All">All Assignees</option>
                            {allAssigneesList.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>

                        <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                            <option value="All">All Teams</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>

                        {(selectedSprint !== 'All' || selectedAssignee !== 'All' || selectedTeam !== 'All') && (
                            <button
                                className="clear-all-btn"
                                onClick={() => { setSelectedSprint('All'); setSelectedAssignee('All'); setSelectedTeam('All'); }}
                            >
                                Clear all
                            </button>
                        )}

                    </div>

                </div>


                {sprints.map(sprint => (
                    <SprintSection
                        key={sprint.id}
                        sprintId={sprint.id}
                        title={sprint.name}
                        issues={sprint.issues}
                        teams={teams}
                        onIssueClick={(issue) => navigate(`/projects/${projectId}/issues/${issue.id}`)}
                    />
                ))}


                <div className="backlog-section">

                    <div className="backlog-section-header">
                        <div>Backlog ({backlogIssues.length})</div>

                        {canChangeSprintRelease() && (
                            <button onClick={() => setIsSprintModalOpen(true)}>
                                Create Sprint
                            </button>
                        )}
                    </div>

                    <SprintSection
                        sprintId="backlog"
                        title="Backlog"
                        issues={backlogIssues}
                        isBacklog
                        teams={teams}
                        onIssueClick={(issue) => navigate(`/projects/${projectId}/issues/${issue.id}`)}
                    />

                </div>


                <CreateSprintModal
                    isOpen={isSprintModalOpen}
                    onClose={() => setIsSprintModalOpen(false)}
                    backlogIssues={backlogIssues}
                    onCreate={handleCreateSprint}
                />

            </div>
        </DragDropContext>
    );
};

export default Issues;