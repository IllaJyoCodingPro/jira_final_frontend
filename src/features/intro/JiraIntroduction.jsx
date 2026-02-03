import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Shield,
    Layout,
    Code,
    CheckCircle,
    Users,
    BarChart,
    Zap,
    Rocket,
    Lock,
    GitBranch,
    Layers,
    Clock,
    ArrowRight,
    ArrowLeft,
    BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/kiet-logo.png';
import './JiraIntroduction.css';

const JiraIntroduction = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState('login');
    const [activeSection, setActiveSection] = useState('intro');

    // Navigation Items
    const navItems = [
        { id: 'intro', label: 'Introduction' },
        { id: 'about', label: 'About Us' },
        { id: 'roles', label: 'Team Roles' },
        { id: 'workflows', label: 'Workflows' },
        { id: 'benefits', label: 'Key Benefits' }
    ];

    const workflowData = {
        login: {
            title: "Secure Authentication",
            purpose: "Enterprise-grade access control for your entire organization.",
            roles: ["All Team Members"],
            actions: ["Single Sign-On (SSO)", "Multi-Factor Auth", "Role Identification"],
            icon: <Lock size={48} className="text-indigo-600" />
        },
        dashboard: {
            title: "Command Center",
            purpose: "A personalized view of your work, team status, and urgent blockers.",
            roles: ["Admin", "Developer", "Team Lead"],
            actions: ["View Assigned Tasks", "Monitor Velocity", "Check Notifications"],
            icon: <Layout size={48} className="text-indigo-600" />
        },
        project: {
            title: "Project Workspace",
            purpose: "The home base for your product initiatives and team configuration.",
            roles: ["Admin", "Team Lead"],
            actions: ["Create Initiatives", "Manage Team Access", "Configure Workflows"],
            icon: <Briefcase size={48} className="text-indigo-600" />
        },
        epics: {
            title: "Epic Planning",
            purpose: "High-level feature roadmapping to keep teams aligned on goals.",
            roles: ["Admin", "Product Owner"],
            actions: ["Define Scope", "Set Timeframes", "Track Progress"],
            icon: <Layers size={48} className="text-indigo-600" />
        },
        tasks: {
            title: "Task Execution",
            purpose: "Where work gets done. Code, collaborate, and move to done.",
            roles: ["Developer", "Tester"],
            actions: ["Update Status", "Link Commits", "Log Time"],
            icon: <CheckCircle size={48} className="text-indigo-600" />
        }
    };

    const workflowSteps = ['login', 'dashboard', 'project', 'epics', 'tasks'];

    // Auto-rotation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((currentStep) => {
                const currentIndex = workflowSteps.indexOf(currentStep);
                const nextIndex = (currentIndex + 1) % workflowSteps.length;
                return workflowSteps[nextIndex];
            });
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, []);

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="product-page-container">
            <div className="intro-layout-wrapper">
                {/* Sidebar Navigation */}
                <nav className="intro-sidebar">
                    <div className="sidebar-header">
                        <div className="sidebar-brand">
                            <img src={logo} alt="Kiet Jira" style={{ height: '24px', marginRight: '8px' }} />
                            <span>Kiet Jira</span>
                        </div>
                    </div>
                    <div className="sidebar-nav">
                        <ul>
                            {navItems.map((item) => (
                                <li key={item.id}>
                                    <a
                                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                        onClick={() => scrollToSection(item.id)}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="intro-content">

                    {/* 1. Introduction Section */}
                    <section id="intro" className="doc-section">
                        <h1>Welcome to Kiet Jira</h1>
                        <p>
                            The comprehensive project management solution designed to streamline software development lifecycles.
                            From planning to deployment, Kiet Jira integrates every step of your workflow into a cohesive,
                            collaborative environment.
                        </p>
                        <p>
                            Whether you're an Admin configuring the system or a Developer shipping code,
                            our platform adapts to your role to ensure maximum efficiency.
                        </p>
                    </section>

                    {/* 2. About Us Section */}
                    <section id="about" className="doc-section">
                        <h2>About Us</h2>
                        <p>
                            At Kiet Jira, we believe that great software is built by great teams.
                            Our mission is to empower developers, managers, and stakeholders with the tools they need to collaborate seamlessly.
                        </p>
                        <p>
                            Kiet Jira is a powerful, all-in-one digital platform designed to help teams organize, track, and manage their work.
                            Imagine a high-tech version of a whiteboard covered in sticky notes, combined with a specialized calendar
                            and a project manager's brain—that's Kiet Jira.
                        </p>
                        <p>
                            We are dedicated to setting the industry standard for agile project management by following the same
                            principles used by top tech companies worldwide, ensuring lightning performance, bank-level security,
                            and a scalable architecture.
                        </p>
                    </section>

                    {/* 3. Team Roles Section */}
                    <section id="roles" className="doc-section">
                        <h2>Team Hierarchy & Roles</h2>
                        <p>Our platform is built around a clear organizational structure to ensure accountability and smooth operations.</p>

                        <div className="role-org-chart">
                            {/* Level 1: Admin */}
                            <div className="role-level-1">
                                <div className="role-card-modern">
                                    <div className="role-icon"><Shield size={24} /></div>
                                    <h3>Admin</h3>
                                    <p>System configuration, global access control, and project governance.</p>
                                </div>
                            </div>

                            {/* Level 2: Team Lead, Developer, Tester */}
                            <div className="role-level-2">
                                <div className="role-card-modern">
                                    <div className="role-icon"><Briefcase size={24} /></div>
                                    <h3>Team Lead</h3>
                                    <p>Sprint planning, resource allocation, and team guidance.</p>
                                </div>
                                <div className="role-card-modern">
                                    <div className="role-icon"><Code size={24} /></div>
                                    <h3>Developer</h3>
                                    <p>Feature implementation, code review, and technical execution.</p>
                                </div>
                                <div className="role-card-modern">
                                    <div className="role-icon"><CheckCircle size={24} /></div>
                                    <h3>Tester</h3>
                                    <p>Quality assurance, bug tracking, and release validation.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. Workflows Section */}
                    <section id="workflows" className="doc-section">
                        <h2>Workflow Engine</h2>
                        <p>Explore the end-to-end process flow.</p>

                        <div className="workflow-carousel">
                            <div className="workflow-track">
                                {/* Duplicate the workflow steps twice for seamless infinite loop */}
                                {[...workflowSteps, ...workflowSteps].map((step, index) => (
                                    <div key={`${step}-${index}`} className="workflow-card">
                                        <div className="workflow-card-icon">
                                            {step === 'login' && <Lock size={32} />}
                                            {step === 'dashboard' && <Layout size={32} />}
                                            {step === 'project' && <Briefcase size={32} />}
                                            {step === 'epics' && <Layers size={32} />}
                                            {step === 'tasks' && <CheckCircle size={32} />}
                                        </div>
                                        <h4>{workflowData[step].title}</h4>
                                        <p className="workflow-card-purpose">{workflowData[step].purpose}</p>
                                        <div className="workflow-card-meta">
                                            <span className="meta-label">Roles:</span>
                                            <span>{workflowData[step].roles.join(', ')}</span>
                                        </div>
                                        <div className="workflow-card-meta">
                                            <span className="meta-label">Actions:</span>
                                            <span>{workflowData[step].actions.join(', ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 5. Benefits Section */}
                    <section id="benefits" className="doc-section">
                        <h2>Why Choose Kiet Jira?</h2>
                        <div className="benefits-grid">
                            <div className="benefit-card-simple">
                                <div className="benefit-icon"><Layout size={24} /></div>
                                <div className="benefit-content">
                                    <h4>Visual Boards</h4>
                                    <p>Move work from "To-Do" to "Done" in real-time with our intuitive Kanban and Scrum boards.</p>
                                </div>
                            </div>
                            <div className="benefit-card-simple">
                                <div className="benefit-icon"><Clock size={24} /></div>
                                <div className="benefit-content">
                                    <h4>Timeline View</h4>
                                    <p>Zoom out to see the "Big Picture," plan months in advance, and never miss a deadline.</p>
                                </div>
                            </div>
                            <div className="benefit-card-simple">
                                <div className="benefit-icon"><BarChart size={24} /></div>
                                <div className="benefit-content">
                                    <h4>Reports and Summary</h4>
                                    <p>Get comprehensive insights with detailed analytics, progress reports, and project summaries at a glance.</p>
                                </div>
                            </div>
                            <div className="benefit-card-simple">
                                <div className="benefit-icon"><BarChart size={24} /></div>
                                <div className="benefit-content">
                                    <h4>Sprint Planning</h4>
                                    <p>Break down massive projects into focused work cycles to keep your team motivated and on track.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="simple-footer">
                        <div className="footer-copy">
                            © 2026 Kiet Jira Platform. All rights reserved.
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-back-action"
                        >
                            <ArrowLeft size={16} />
                            Go Back
                        </button>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default JiraIntroduction;
