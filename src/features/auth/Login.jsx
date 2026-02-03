import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import kietLogo from '../../assets/kiet-logo.png';
import { formatError } from '../../utils/renderUtils';
import './JiraAuth.css';

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            await login(form.email.toLowerCase(), form.password);
            navigate("/my-work");
        } catch (err) {
            console.error(err);
            const serverError = err.response?.data;
            if (serverError) {
                setError(formatError(serverError));
            } else {
                setError(err.message || "Invalid email or password");
            }
        } finally {
            setLoading(false);
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
                        Welcome back to <br />
                        your team workspace.
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
                        <h2 className="auth-title">Log in</h2>
                        <p className="auth-subtitle">Continue to KIET Jira</p>
                    </div>

                    {message && (
                        <div className="error-toast" style={{ borderColor: '#48bb78', color: '#22543d', background: '#c6f6d5' }}>
                            ✅ {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-toast">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">

                        {/* Floating Label: Email */}
                        <div className="floating-group">
                            <input
                                type="email"
                                className="floating-input"
                                placeholder=" "
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            <label className="floating-label">Email</label>
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

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-16px" }}>
                            <span
                                className="auth-link"
                                style={{ fontSize: "12px" }}
                                onClick={() => navigate("/forgot-password")}
                            >
                                Forgot Password?
                            </span>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account?{" "}
                        <span className="auth-link" onClick={() => navigate("/signup")}>
                            Sign up
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
