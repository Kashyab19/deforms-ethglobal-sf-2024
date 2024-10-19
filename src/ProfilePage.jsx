import React from 'react';

function ProfilePage({ ensName, walletAddress, biometricHash, onClose, onStartBiometricVerification }) {
    return (
        <div className="profile-page">
            <h2>Profile</h2>
            <div className="profile-info">
                <p><strong>ENS Name:</strong> {ensName || 'Not set'}</p>
                <p><strong>Wallet Address:</strong> {walletAddress}</p>
                <p><strong>Biometric Verification:</strong> {biometricHash ? 'Completed' : 'Not verified'}</p>
            </div>
            {!biometricHash && (
                <button onClick={onStartBiometricVerification}>Start Biometric Verification</button>
            )}
            <button onClick={onClose}>Close</button>
        </div>
    );
}

export default ProfilePage;
