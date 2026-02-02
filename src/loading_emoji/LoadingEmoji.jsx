import React from 'react';
import './LoadingEmoji.css';

const LoadingEmoji = () => {
    return (
        <div className="loading-emoji-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            zIndex: 99999
        }}>
            <div className="loader"></div>
        </div>
    );
};

export default LoadingEmoji;
