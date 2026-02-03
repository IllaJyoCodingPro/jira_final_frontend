import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import kietLogo from '../../assets/kiet-logo.png';
import { statsService } from '../../services/statsService';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('Board');
    const [emailInput, setEmailInput] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statsService.getLandingStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch landing stats:", error);
                setStats({
                    total_users: 10000,
                    total_admins: 500,
                    total_developers: 2500,
                    total_testers: 1000
                });
            }
        };

        fetchStats();

        // Automatic Tab Cycling Animation on Start (Infinite Loop)
        const sequence = ['Board', 'Timeline', 'List', 'Reports'];
        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % sequence.length;
            setActiveTab(sequence[currentIndex]);
        }, 3000); // Switch every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const renderReports = () => (
        <div className="reports-view">
            <div className="reports-grid">
                <div className="report-stat-card animate-pop delay-1">
                    <span className="report-stat-value">124</span>
                    <span className="report-stat-desc">Issues resolved this week</span>
                </div>
                <div className="report-stat-card animate-pop delay-2">
                    <span className="report-stat-value">12</span>
                    <span className="report-stat-desc">Active sprints across teams</span>
                </div>
                <div className="report-insight-card animate-pop delay-3">
                    <div className="insight-header">
                        <span className="insight-icon">💡</span>
                        <span className="insight-title">Team Insight</span>
                    </div>
                    <p className="insight-text">Team velocity has increased by 15% since the last sprint. Most bottlenecks were resolved in QA.</p>
                </div>
            </div>
        </div>
    );

    const renderTimeline = () => (
        <div className="timeline-view">
            <div className="timeline-grid">
                <div className="timeline-cols">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="timeline-day-col"></div>
                    ))}
                </div>
                <div className="timeline-rows">
                    <div className="timeline-task-row row-1">
                        <div className="timeline-bar purple animate-slide">Create project brief</div>
                    </div>
                    <div className="timeline-task-row row-2">
                        <div className="timeline-bar orange animate-slide delay-1">Establish branding</div>
                    </div>
                    <div className="timeline-task-row row-3">
                        <div className="timeline-bar green animate-slide delay-2">User research</div>
                    </div>
                    <div className="timeline-task-row row-4">
                        <div className="timeline-bar blue animate-slide delay-3">Market analysis</div>
                    </div>
                    <div className="timeline-task-row row-5">
                        <div className="timeline-bar yellow animate-slide delay-4">Product design</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBoard = () => (
        <div className="kanban-columns">
            {/* To Do Column */}
            <div className="kanban-column">
                <div className="column-header">TO DO</div>
                <div className="kanban-card">
                    <div className="card-text">Create project brief and goals</div>
                    <div className="card-meta">
                        <span className="card-id">TBT-1</span>
                        <div className="card-avatar purple"></div>
                    </div>
                </div>
                <div className="kanban-card">
                    <div className="card-text">Establish your branding</div>
                    <div className="card-meta">
                        <span className="card-id">TBT-5</span>
                        <div className="card-avatar orange" style={{ backgroundImage: 'url(https://i.pravatar.cc/150?u=1)' }}></div>
                    </div>
                </div>
            </div>

            {/* In Progress Column */}
            <div className="kanban-column">
                <div className="column-header">IN PROGRESS</div>
                <div className="kanban-card">
                    <div className="card-text">Carry out user research</div>
                    <div className="card-meta">
                        <span className="card-id">TBT-2</span>
                        <div className="card-avatar yellow" style={{ backgroundImage: 'url(https://i.pravatar.cc/150?u=3)' }}></div>
                    </div>
                </div>
                <div className="kanban-card">
                    <div className="card-text">Plan content strategy</div>
                    <div className="card-meta">
                        <span className="card-id">TBT-4</span>
                        <div className="card-avatar green" style={{ backgroundImage: 'url(https://i.pravatar.cc/150?u=4)' }}></div>
                    </div>
                </div>
            </div>

            {/* Done Column */}
            <div className="kanban-column">
                <div className="column-header">DONE</div>
                <div className="kanban-card">
                    <div className="card-text">Do market research</div>
                    <div className="card-meta">
                        <span className="card-id">TBT-3</span>
                        <div className="card-avatar blue" style={{ backgroundImage: 'url(https://i.pravatar.cc/150?u=6)' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderList = () => (
        <div className="list-view">
            <div className="list-item floating-entry delay-1">
                <div className="list-check pulse-border"></div>
                <div className="list-content">
                    <div className="list-task-title">Review project requirements</div>
                    <div className="list-task-meta">TBT-10 • High Priority</div>
                </div>
            </div>
            <div className="list-item floating-entry delay-2">
                <div className="list-check"></div>
                <div className="list-content">
                    <div className="list-task-title">Design system update</div>
                    <div className="list-task-meta">TBT-11 • In Progress</div>
                </div>
            </div>
            <div className="list-item floating-entry delay-3">
                <div className="list-check pulse-border"></div>
                <div className="list-content">
                    <div className="list-task-title">Stakeholder meeting</div>
                    <div className="list-task-meta">TBT-12 • Scheduled</div>
                </div>
            </div>
            <div className="list-item floating-entry delay-4">
                <div className="list-check"></div>
                <div className="list-content">
                    <div className="list-task-title">Mobile app wireframes</div>
                    <div className="list-task-meta">TBT-13 • New</div>
                </div>
            </div>
            <div className="list-item floating-entry delay-5">
                <div className="list-check pulse-border"></div>
                <div className="list-content">
                    <div className="list-task-title">QA Testing Cycle 1</div>
                    <div className="list-task-meta">TBT-14 • Testing</div>
                </div>
            </div>
        </div>
    );


    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-nav-start">
                    <div className="landing-logo-container">
                        <img src={kietLogo} alt="KIET" style={{ height: '24px', marginRight: '8px' }} />
                        <span className="landing-logo-text">KIET Jira</span>
                    </div>
                </div>
                <div className="landing-nav-end">
                    <button className="landing-btn-free" onClick={() => navigate("/signup", { state: { email: emailInput } })}>Sign up</button>
                    <button className="landing-btn-signin" onClick={() => navigate("/login")}>Log in</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <main className="landing-hero-content">
                    <h1 className="landing-hero-title">All great projects start with Kiet Jira</h1>
                    <p className="landing-hero-subtitle">
                        Find teammates, plus keep work and life separate by using your work email.
                    </p>

                    <div className="landing-signup-form">
                        <label className="landing-input-label">Work email</label>
                        <input
                            type="email"
                            placeholder="you@company.com"
                            className="landing-email-input"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                        <button
                            className="landing-cta-primary"
                            onClick={() => navigate("/signup", { state: { email: emailInput } })}
                        >Sign up</button>
                    </div>
                </main>

                <div className="landing-hero-visual">
                    <div className="landing-visual-heading">
                        <h2>Get - Set - Done</h2>
                    </div>

                    {/* Floating Labels */}
                    <div className="visual-float-label label-project animate-float">Project Management</div>
                    <div className="visual-float-label label-engineering animate-float delay-1">Engineering</div>
                    <div className="visual-float-label label-marketing animate-float delay-2">Marketing</div>

                    <div className="kanban-board-container">
                        <div className="kanban-header-row">
                            <div className="kanban-project-icon">
                                <span style={{ fontSize: '20px' }}>🦄</span>
                            </div>
                            <span className="kanban-project-name">Marketing campaign</span>
                        </div>
                        <div className="kanban-tabs">
                            <span
                                className={`active-tab ${activeTab === 'Timeline' ? 'highlight' : ''}`}
                                onClick={() => setActiveTab('Timeline')}
                            >Timeline</span>
                            <span
                                className={`active-tab ${activeTab === 'Board' ? 'highlight' : ''}`}
                                onClick={() => setActiveTab('Board')}
                            >Board</span>
                            <span
                                className={`active-tab ${activeTab === 'List' ? 'highlight' : ''}`}
                                onClick={() => setActiveTab('List')}
                            >List</span>
                            <span
                                className={`active-tab ${activeTab === 'Reports' ? 'highlight' : ''}`}
                                onClick={() => setActiveTab('Reports')}
                            >Reports</span>
                            <span>+</span>
                        </div>

                        <div className="kanban-content-area">
                            {activeTab === 'Timeline' && renderTimeline()}
                            {activeTab === 'Board' && renderBoard()}
                            {activeTab === 'List' && renderList()}
                            {activeTab === 'Reports' && renderReports()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <section className="landing-stats-section">
                <div className="landing-stats-container">
                    <div className="landing-stat-item">
                        <span className="landing-stat-number">{stats ? stats.total_users : "..."}</span>
                        <span className="landing-stat-label">Total Users</span>
                    </div>
                    <div className="landing-stat-item">
                        <span className="landing-stat-number">{stats ? stats.total_admins : "..."}</span>
                        <span className="landing-stat-label">Total Admins</span>
                    </div>
                    <div className="landing-stat-item">
                        <span className="landing-stat-number">{stats ? stats.total_developers : "..."}</span>
                        <span className="landing-stat-label">Developers Using</span>
                    </div>
                    <div className="landing-stat-item">
                        <span className="landing-stat-number">{stats ? stats.total_testers : "..."}</span>
                        <span className="landing-stat-label">Testers</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features-section">
                <h2 className="landing-features-header">All the features you need</h2>
                <div className="landing-cards-grid">
                    <div className="landing-feature-card">
                        <div className="landing-icon-container">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        </div>
                        <h3 className="landing-card-title">Plan</h3>
                        <p className="landing-card-text">Create user stories and issues, plan sprints, and distribute tasks across your software team.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="landing-icon-container">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                        <h3 className="landing-card-title">Track</h3>
                        <p className="landing-card-text">Prioritize and discuss your team’s work in full context with complete visibility.</p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="landing-icon-container">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </div>
                        <h3 className="landing-card-title">Report</h3>
                        <p className="landing-card-text">Improve team performance based on real-time, visual data that your team can put to use.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer-cta">
                    <h3>Ready to start your project?</h3>
                    <button className="landing-cta-primary" onClick={() => navigate("/signup", { state: { email: emailInput } })}>Get it free</button>
                </div>
                <div className="landing-footer-content">
                    <div className="landing-footer-logo">
                        <img src={kietLogo} alt="KIET" style={{ height: '24px', marginRight: '10px' }} />
                        <span className="landing-logo-text">Kiet Jira</span>
                    </div>
                    <p className="landing-footer-tagline">Move fast, stay aligned, and build better - together.</p>
                </div>

                <div className="landing-footer-bottom">
                    <div className="landing-copyright">
                        © 2026 Kiet Jira Copy. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

