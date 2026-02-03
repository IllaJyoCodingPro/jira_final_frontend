import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import kietLogo from '../../assets/kiet-logo.png';
import { formatError } from '../../utils/renderUtils';
import './JiraAuth.css';

export default function Signup() {
    const [form, setForm] = useState({
        email: "",
        full_name: "",
        password: "",
        role: "DEVELOPER"
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { signup, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setForm(prev => ({ ...prev, email: location.state.email }));
        }
    }, [location.state]);

    const rules = [
        { label: "At least 8 characters", valid: form.password.length >= 8 },
        { label: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
        { label: "One lowercase letter", valid: /[a-z]/.test(form.password) },
        { label: "One number", valid: /\d/.test(form.password) },
        { label: "One special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) },
    ];

    const allRulesMet = rules.every(rule => rule.valid);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError("");

        if (!allRulesMet) {
            setPasswordError("Password does not meet complexity requirements");
            return;
        }

        if (form.password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await signup(form.full_name, form.email.toLowerCase(), form.password, form.role);
            // Auto login after signup
            await login(form.email.toLowerCase(), form.password);
            navigate("/about");
        } catch (err) {
            const serverError = err.response?.data;
            const errorMessage = serverError ? formatError(serverError) : (err.message || "Unknown error");
            setPasswordError("Signup failed: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmChange = (e) => {
        const val = e.target.value;
        setConfirmPassword(val);
        if (form.password && val && form.password !== val) {
            setPasswordError("Passwords do not match");
        } else {
            setPasswordError("");
        }
    };

    return (
        <div className="auth-container">
            {/* Left Panel - Brand & Marketing */}
            <div className="auth-left">
                <div className="auth-brand">
                    <img src={kietLogo} alt="KIET" />
                    <span>KIET</span>
                </div>

                <div className="auth-marketing-content">
                    <h1 className="marketing-hero-text">
                        Project management <br />
                        built for high-velocity teams.
                    </h1>
                </div>

                <div className="auth-illustration">
                    <div className="illustration-bar" style={{ height: '120px' }}></div>
                    <div className="illustration-bar" style={{ height: '180px', background: 'rgba(255,255,255,0.5)' }}></div>
                    <div className="illustration-bar" style={{ height: '140px' }}></div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2 className="auth-title">Create your account</h2>
                        <p className="auth-subtitle">Get started with KIET Project Suite today.</p>
                    </div>

                    {passwordError && (
                        <div className="error-toast">
                            ⚠️ {passwordError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">

                        {/* Floating Label: Full Name */}
                        <div className="floating-group">
                            <input
                                type="text"
                                className="floating-input"
                                placeholder=" "
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                                required
                            />
                            <label className="floating-label">Full Name</label>
                        </div>

                        {/* Floating Label: Work Email */}
                        <div className="floating-group">
                            <input
                                type="email"
                                className="floating-input"
                                placeholder=" "
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            <label className="floating-label">Work Email</label>
                        </div>

                        {/* Floating Label: Role (Select) */}
                        <div className="floating-group">
                            <select
                                className="floating-input"
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="DEVELOPER">Developer</option>
                                <option value="TESTER">Tester</option>
                            </select>
                            <label className="floating-label" style={{ top: '14px', fontSize: '11px', color: '#0052cc', fontWeight: 700 }}>Role</label>
                        </div>

                        {/* Floating Label: Password */}
                        <div className="floating-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="floating-input"
                                placeholder=" "
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <label className="floating-label">Password</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>

                        {form.password && (
                            <div className="password-requirements">
                                {rules.map((rule, index) => (
                                    <div key={index} className="req-item">
                                        <span
                                            className="req-icon"
                                            style={{ color: rule.valid ? '#36b37e' : '#ff5630' }}
                                        >
                                            {rule.valid ? '✓' : '•'}
                                        </span>
                                        <span style={{ color: rule.valid ? '#172b4d' : '#5e6c84' }}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Floating Label: Confirm Password */}
                        <div className="floating-group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="floating-input"
                                placeholder=" "
                                value={confirmPassword}
                                onChange={handleConfirmChange}
                                required
                            />
                            <label className="floating-label">Confirm Password</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading || !allRulesMet}>
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?{" "}
                        <span className="auth-link" onClick={() => navigate("/login")}>
                            Log in
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
