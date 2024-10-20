import React, { useState } from 'react';
import '../styles/Navbar.css';

function Navbar({ isEnterprise, ensName, logout, setCurrentView, credibilityScore }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="navbar">
            <h1 onClick={() => setCurrentView('home')} style={{cursor: 'pointer'}}>
                {isEnterprise ? "DeForms Enterprise" : "DeForms"}
            </h1>
            <div className="nav-right">
                {isEnterprise ? (
                    <button className="nav-button" onClick={() => setCurrentView('creator')}>Create New Survey</button>
                ) : (
                    <>
                        <button className="nav-button" onClick={() => setCurrentView('home')}>Available Surveys</button>
                        <button className="nav-button" onClick={() => setCurrentView('answered')}>Answered Surveys</button>
                    </>
                )}
                <div className="credibility-score">
                    Credibility: {credibilityScore}
                </div>
                <div className="profile-menu">
                    <div className="profile-icon" onClick={toggleMenu}>
                        <span>{ensName ? ensName[0].toUpperCase() : '👤'}</span>
                    </div>
                    {isMenuOpen && (
                        <div className="menu">
                            <p>{ensName || 'No ENS Name'}</p>
                            <button className="menu-item" onClick={() => { setCurrentView('profile'); toggleMenu(); }}>Profile</button>
                            <button className="menu-item logout-button" onClick={logout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
