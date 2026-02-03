import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';

const DashboardRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkProjects = async () => {
            try {
                navigate('/projects');
            } catch (error) {
                console.error("Failed to redirect", error);
                navigate('/projects');
            }
        };
        checkProjects();
    }, [navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
            Loading your workspace...
        </div>
    );
};

export default DashboardRedirect;
