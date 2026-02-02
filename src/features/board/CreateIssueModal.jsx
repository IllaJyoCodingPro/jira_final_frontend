import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, Minus, Maximize2, Minimize2,
  CheckSquare, Bookmark, AlertCircle,
  ChevronDown, Plus
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { storyService } from '../../services/storyService';
import { epicService } from '../../services/epicService';
import { authService } from '../../services/authService';
import { teamService } from '../../services/teamService';
import { syncTeamMembership } from '../../utils/teamUtils';
import { useAuth } from '../../context/AuthContext';
import { ISSUE_STATUS, ISSUE_PRIORITY, ISSUE_TYPES, ROLES } from '../../constants';
import PropTypes from 'prop-types';
import './CreateIssueModal.css';

const CreateIssueModal = ({ isOpen, onClose, projectId, onIssueCreated, initialData = {} }) => {
  const defaultState = {
    title: '',
    description: '',
    assignee: '',
    assignee_id: '',
    reviewer: '',
    release_number: '',
    sprint_number: '',
    status: ISSUE_STATUS.TODO,
    issue_type: ISSUE_TYPES.STORY,
    priority: ISSUE_PRIORITY.MEDIUM,
    start_date: '',
    end_date: '',
    parent_issue_id: '',
    epic_id: '', // New field for linking to Epics
    team_id: '',
    team_ids: [] // New field for multiple teams (Epics)
  };

  const [formData, setFormData] = useState({ ...defaultState, ...initialData });
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  const teamDropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target)) {
        setIsTeamDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [teamDropdownRef]);

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [createAnother, setCreateAnother] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);
  const [epics, setEpics] = useState([]); // Store epics for the dropdown
  const [fetchingParents, setFetchingParents] = useState(false);

  const activeProjectId = projectId ? parseInt(projectId) : null;

  // Helper to check if current type is Epic
  const isEpic = formData.issue_type === 'Epic' || formData.issue_type === ISSUE_TYPES.EPIC;

  useEffect(() => {
    if (isOpen && activeProjectId) {
      // Fetch Epics for the project so they can be selected in "Epic Link"
      epicService.getByProject(activeProjectId)
        .then(data => setEpics(Array.isArray(data) ? data : []))
        .catch(err => console.error("Failed to fetch epics", err));
    }
  }, [isOpen, activeProjectId]);

  // Fetch Parent Options (for Sub-tasks or other hierarchy if needed)
  useEffect(() => {
    if (!isOpen) return;

    const fetchParents = async () => {
      setFetchingParents(true);
      try {
        if (activeProjectId && formData.issue_type) {
          if (isEpic) {
            setParentOptions([]); // Epic has no parent
          } else {
            const parents = await storyService.getAvailableParents(activeProjectId, formData.issue_type);
            setParentOptions(Array.isArray(parents) ? parents : []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch parents", err);
        setParentOptions([]);
      } finally {
        setFetchingParents(false);
      }
    };

    fetchParents();
  }, [formData.issue_type, activeProjectId, isOpen, isEpic]);


  // Load initial data only once when modal opens
  useEffect(() => {
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    authService.getAllUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));

    if (activeProjectId) {
      teamService.getByProject(activeProjectId)
        .then(data => setTeams(Array.isArray(data) ? data : []))
        .catch(() => setTeams([]));
    }
  }, [isOpen, activeProjectId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, team_ids: selectedOptions }));
  };

  const handleFileChange = e => setFile(e.target.files[0]);

  // Determine permissions for the selected team
  const selectedTeam = teams.find(t => t.id == formData.team_id);
  const isTeamLead = (selectedTeam?.lead_id == user?.id) || (selectedTeam?.lead?.id == user?.id);
  const isProjectLead = teams.some(t => (t.lead_id == user?.id) || (t.lead?.id == user?.id));
  const isAdmin = user?.view_mode === ROLES.ADMIN;
  const canAssignOthers = isAdmin || isTeamLead || isProjectLead || isEpic; // Allow assignment for Epics freely or based on policy

  // Enforce self-assignment for non-leads when team is selected (Only for non-Epics)
  useEffect(() => {
    if (!isOpen || isEpic) return; // Don't enforce for Epics
    if (!canAssignOthers && user) {
      setFormData(prev => {
        if (prev.assignee_id !== user.id) {
          return {
            ...prev,
            assignee_id: user.id,
            assignee: user.username
          };
        }
        return prev;
      });
    }
  }, [formData.team_id, canAssignOthers, user, isOpen, isEpic]);


  // --- FILTERED ASSIGNEES LOGIC ---
  const availableAssignees = useMemo(() => {
    // 1. If Epic and team_ids selected: Filter users in those teams
    if (isEpic && formData.team_ids && formData.team_ids.length > 0) {
      const selectedTeamIds = formData.team_ids.map(id => String(id));
      return users.filter(u => {
        // Check if user is in any of the selected teams
        const userTeams = teams.filter(t => selectedTeamIds.includes(String(t.id)));
        return userTeams.some(t => t.members && t.members.some(m => m.id === u.id));
      });
    }
    // 2. If Story/Bug and team_id selected: Filter users in that team
    else if (!isEpic && formData.team_id) {
      const team = teams.find(t => String(t.id) === String(formData.team_id));
      if (team && team.members) {
        return team.members;
      }
      // If team found but no members, return empty array
      return [];
    }

    // 3. Default: All Users (when "No Team" is selected)
    return users;
  }, [isEpic, formData.team_ids, formData.team_id, teams, users]);


  const handleAssigneeChange = (e) => {
    const rawValue = e.target.value;
    const userId = rawValue ? parseInt(rawValue, 10) : '';
    const selected = users.find(u => u.id === userId);
    setFormData(prev => ({
      ...prev,
      assignee_id: userId || '',
      assignee: selected ? selected.username : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (formData.start_date && formData.end_date) {
        if (new Date(formData.end_date) < new Date(formData.start_date)) {
          setError("End date cannot be earlier than start date");
          setIsLoading(false);
          return;
        }
      }

      const assigned_to_value = (typeof formData.assignee_id === 'number' && !Number.isNaN(formData.assignee_id))
        ? formData.assignee_id
        : (formData.assignee_id ? parseInt(formData.assignee_id, 10) : null);

      const commonPayload = {
        title: formData.title,
        description: formData.description,
        project_id: activeProjectId || (formData.project_id ? parseInt(formData.project_id) : null),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: formData.status,
        assigned_to: assigned_to_value || null,
      };

      if (isEpic) {
        // EPIC CREATION
        await epicService.create({
          ...commonPayload,
          team_ids: formData.team_ids ? formData.team_ids.map(id => parseInt(id)) : []
        });
      } else {
        // STORY/BUG CREATION
        // Construct explicit payload to avoid sending 'team_ids' or other extra fields to story endpoint
        const payload = {
          title: commonPayload.title,
          description: commonPayload.description,
          project_id: commonPayload.project_id,
          start_date: commonPayload.start_date || null,
          end_date: commonPayload.end_date || null,
          status: commonPayload.status,
          priority: formData.priority,
          issue_type: formData.issue_type,
          sprint_number: (formData.sprint_number && formData.sprint_number !== '') ? formData.sprint_number : null,
          parent_issue_id: (formData.parent_issue_id && formData.parent_issue_id !== '') ? parseInt(formData.parent_issue_id) : null,
          assignee: formData.assignee || '',
          assigned_to: assigned_to_value || null,
          team_id: (formData.team_id && formData.team_id !== '') ? parseInt(formData.team_id) : null,
          story_pointer: 0,
          support_doc: file,
          epic_id: (formData.epic_id && formData.epic_id !== '') ? parseInt(formData.epic_id) : null
        };

        if (payload.team_id && payload.assigned_to) {
          await syncTeamMembership(payload.team_id, payload.assigned_to);
        }
        await storyService.create(payload);
      }

      onIssueCreated();

      if (createAnother) {
        setFormData(prev => ({
          ...defaultState,
          assignee: prev.assignee,
          assignee_id: prev.assignee_id,
          team_id: prev.team_id,
          team_ids: [],
          issue_type: prev.issue_type,
          priority: prev.priority
        }));
      } else {
        onClose();
        setFormData({ ...defaultState });
      }
    } catch (err) {
      console.error('Create issue failed', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);

      // Show more detailed error to user
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const errorMessages = detail.map(e => `${e.loc?.join('.')}: ${e.msg}`).join(', ');
        setError(`Validation error: ${errorMessages}`);
      } else {
        setError(detail || 'Failed to create issue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getIssueTypeIcon = (type) => {
    switch (type) {
      case 'Epic':
      case ISSUE_TYPES.EPIC: return <Bookmark size={16} color="#904ee2" fill="#904ee2" />;
      case ISSUE_TYPES.BUG: return <AlertCircle size={16} color="#e5493a" />;
      case ISSUE_TYPES.STORY: return <Bookmark size={16} color="#65ba43" fill="#65ba43" />;
      default: return <CheckSquare size={16} color="#4bade8" />;
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="jira-create-minimized">
        <span>Create Issue</span>
        <div className="jira-create-controls">
          <button className="control-btn" onClick={() => setIsMinimized(false)}><Maximize2 size={14} /></button>
          <button className="control-btn close" onClick={onClose}><X size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="jira-create-overlay">
      <div className={`jira-create-modal ${isMaximized ? 'maximized' : ''} animate-slide-up`}>
        <div className="jira-create-header">
          <div className="header-title-group">
            <Plus size={20} color="#0052cc" />
            <h3>Create {isEpic ? 'Epic' : 'Issue'}</h3>
          </div>
          <div className="jira-create-controls">
            <button className="control-btn" onClick={() => setIsMinimized(true)} title="Minimize"><Minus size={18} /></button>
            <button className="control-btn" onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Restore" : "Maximize"}>
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button className="control-btn close" onClick={onClose} title="Close"><X size={20} /></button>
          </div>
        </div>

        <div className="jira-create-scroll-area">
          <div className="jira-create-content">
            <form onSubmit={handleSubmit} id="create-issue-form" className="create-form-grid">
              <div className="form-main">
                <section className="form-section">
                  <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Summary"
                  />
                </section>

                <section className="form-section">
                  <label className="jira-label">Description</label>
                  <textarea
                    className="jira-textarea-premium"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    rows={8}
                  />
                </section>

                <section className="form-section">
                  <div className="form-row-dates">
                    <div className="date-group">
                      <label className="jira-label">Start Date</label>
                      <input
                        type="date"
                        className="jira-input-premium"
                        name="start_date"
                        value={formData.start_date || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="date-group">
                      <label className="jira-label">End Date</label>
                      <input
                        type="date"
                        className="jira-input-premium"
                        name="end_date"
                        value={formData.end_date || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>

                {!isEpic && (
                  <section className="form-section attachments-section">
                    <label className="jira-label">Attachments</label>
                    <div className="file-upload-zone">
                      <Plus size={24} color="#6b778c" />
                      <span>Click or drag file</span>
                      <input type="file" onChange={handleFileChange} className="file-input-hidden" />
                      {file && <div className="selected-file-badge">{file.name}</div>}
                    </div>
                  </section>
                )}
              </div>

              <div className="form-sidebar">
                <div className="sidebar-field">
                  <label className="jira-label">Issue Type</label>
                  <div className="type-selector-wrapper">
                    <div className="jira-custom-select-premium" onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}>
                      <div className="selected-type">
                        {getIssueTypeIcon(formData.issue_type)}
                        <span>{formData.issue_type}</span>
                      </div>
                      <ChevronDown size={14} />
                    </div>
                    {isTypeDropdownOpen && (
                      <div className="jira-dropdown-floating">
                        {['Epic', ISSUE_TYPES.STORY, ISSUE_TYPES.BUG].map(type => (
                          <div
                            key={type}
                            className={`dropdown-item ${formData.issue_type === type ? 'active' : ''}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, issue_type: type, team_ids: [], team_id: '' })); // Reset team selection on type change
                              setIsTypeDropdownOpen(false);
                            }}
                          >
                            {getIssueTypeIcon(type)}
                            <span>{type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {!isEpic && (
                  <div className="sidebar-field">
                    <label className="jira-label">Epic Link</label>
                    <select
                      className="jira-select-premium"
                      name="epic_id"
                      value={formData.epic_id || ''}
                      onChange={handleChange}
                    >
                      <option value="">No Epic</option>
                      {epics.map(epic => (
                        <option key={epic.id} value={epic.id}>{epic.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Team Selection: Multi for Epic, Single for Story */}
                <div className="sidebar-field">
                  <label className="jira-label">Team{isEpic ? '(s)' : ''}</label>
                  {isEpic ? (
                    <div className="type-selector-wrapper" ref={teamDropdownRef}>
                      <div
                        className="jira-custom-select-premium"
                        onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                        style={{ minHeight: '36px', height: 'auto', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div className="selected-type" style={{ flexWrap: 'wrap', gap: '4px' }}>
                          {formData.team_ids && formData.team_ids.length > 0
                            ? (
                              <span style={{ lineHeight: '1.4' }}>
                                {teams.filter(t => formData.team_ids.includes(String(t.id))).map(t => t.name).join(', ')}
                              </span>
                            )
                            : <span style={{ color: '#6b778c', fontWeight: 400 }}>Select Teams</span>
                          }
                        </div>
                        <ChevronDown size={14} />
                      </div>
                      {isTeamDropdownOpen && (
                        <div className="jira-dropdown-floating" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {teams.map(t => (
                            <div
                              key={t.id}
                              className={`dropdown-item ${formData.team_ids.includes(String(t.id)) ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIds = formData.team_ids || [];
                                const idStr = String(t.id);
                                let newIds;
                                if (currentIds.includes(idStr)) {
                                  newIds = currentIds.filter(id => id !== idStr);
                                } else {
                                  newIds = [...currentIds, idStr];
                                }
                                setFormData(prev => ({ ...prev, team_ids: newIds }));
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={formData.team_ids.includes(String(t.id))}
                                readOnly
                                style={{ marginRight: '8px', cursor: 'pointer' }}
                              />
                              <span>{t.name}</span>
                            </div>
                          ))}
                          {teams.length === 0 && <div className="dropdown-item" style={{ fontStyle: 'italic', color: '#666' }}>No teams available</div>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="jira-select-premium"
                      name="team_id"
                      value={formData.team_id}
                      onChange={handleChange}
                    >
                      <option value="">No Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                  {teams.length === 0 && (
                    <div className="warning-box" style={{ padding: '8px', background: '#ffebe6', color: '#de350b', borderRadius: '3px', marginTop: '8px', fontSize: '11px', lineHeight: '1.4' }}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} />
                      No teams found.
                    </div>
                  )}
                </div>

                <div className="sidebar-field">
                  <label className="jira-label">
                    {!isEpic && formData.team_id ? "Team Members" : "Assignee"}
                  </label>
                  <select
                    className="jira-select-premium"
                    value={formData.assignee_id}
                    onChange={handleAssigneeChange}
                    disabled={!canAssignOthers}
                  >
                    <option value="">{canAssignOthers ? "Unassigned" : "Assigned to me"}</option>
                    {availableAssignees.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                </div>

                {!isEpic && (
                  <div className="sidebar-field">
                    <label className="jira-label">Priority</label>
                    <select
                      className="jira-select-premium"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value={ISSUE_PRIORITY.HIGH}>{ISSUE_PRIORITY.HIGH}</option>
                      <option value={ISSUE_PRIORITY.MEDIUM}>{ISSUE_PRIORITY.MEDIUM}</option>
                      <option value={ISSUE_PRIORITY.LOW}>{ISSUE_PRIORITY.LOW}</option>
                    </select>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="jira-create-footer">
          <div className="footer-left">
            {!isEpic && (
              <label className="create-another-checkbox">
                <input
                  type="checkbox"
                  checked={createAnother}
                  onChange={e => setCreateAnother(e.target.checked)}
                />
                <span>Create another</span>
              </label>
            )}
          </div>
          <div className="footer-right">
            <Button variant="subtle" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              form="create-issue-form"
              variant="primary"
              disabled={isLoading || (!isEpic && teams.length === 0)}
              className="create-submit-btn"
            >
              {isLoading ? 'Creating…' : ((createAnother && !isEpic) ? 'Create & Add Another' : 'Create')}
            </Button>
          </div>
        </div>
      </div>
      {error && <div className="error-toast">{error}</div>}
    </div>
  );
};

CreateIssueModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.any,
  onIssueCreated: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default CreateIssueModal;