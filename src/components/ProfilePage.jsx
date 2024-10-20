import React from 'react';
import '../styles/ProfilePage.css';

function ProfilePage({ user, ensName, isEnterprise, onClose }) {
    return (
        <div className="profile-page">
            <h2>User Profile</h2>
            <p><strong>ENS Name:</strong> {ensName}</p>
            <p><strong>Wallet Address:</strong> {user.wallet?.address}</p>
            <p><strong>User Type:</strong> {isEnterprise ? 'Enterprise' : 'Regular'}</p>
            <button className="back-button" onClick={onClose}>Back</button>
        </div>
    );
}

export default ProfilePage;
