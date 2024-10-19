import React, { useState, useCallback, useEffect } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { usePrivy } from '@privy-io/react-auth';
import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import { supabase } from './supabaseClient';
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import "./index.css";
import { registerENS, getENSName, isENSNameAvailable } from './ensService';
import ProfilePage from './ProfilePage';
import { ethers } from 'ethers';
import BiometricVerification from './BiometricVerification';

function SurveyComponent() {
    const { login, authenticated, user, logout } = usePrivy();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showCreator, setShowCreator] = useState(false);
    const [currentSurvey, setCurrentSurvey] = useState(null);
    const [currentView, setCurrentView] = useState('home');
    const [surveys, setSurveys] = useState([]);
    const [ensName, setEnsName] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [biometricHash, setBiometricHash] = useState(null);
    const [showBiometricVerification, setShowBiometricVerification] = useState(false);

    useEffect(() => {
        fetchSurveys();
    }, []);

    useEffect(() => {
        if (authenticated && user.wallet?.address) {
            checkOrRegisterENS();
        }
    }, [authenticated, user]);

    const shortenAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleCreator = () => {
        setShowCreator(!showCreator);
        setCurrentView('creator');
    };

    const createNewSurvey = () => {
        const newSurvey = { 
            title: `Untitled Survey ${surveys.length + 1}`,
            json: JSON.stringify({ pages: [{ name: "page1", elements: [] }] })
        };
        setCurrentSurvey(newSurvey);
        setShowCreator(true);
        setCurrentView('creator');
    };

    const goToHome = () => {
        setCurrentView('home');
        setShowCreator(false);
        setCurrentSurvey(null);
    };

    const saveSurvey = async (survey) => {
        console.log('Saving survey:', survey);
        if (survey.id) {
            const { data, error } = await supabase
                .from('surveys')
                .update({ title: survey.title, json: JSON.stringify(survey.json) })
                .eq('id', survey.id)
                .select();
            if (error) {
                console.error('Error updating survey:', error);
            } else {
                console.log('Survey updated:', data);
                fetchSurveys();
                setCurrentSurvey(data && data.length > 0 ? data[0] : survey);
                goToHome(); // Add this line to return to home after saving
            }
        } else {
            const { data, error } = await supabase
                .from('surveys')
                .insert([{ title: survey.title, json: JSON.stringify(survey.json) }])
                .select();
            if (error) {
                console.error('Error inserting survey:', error);
            } else {
                console.log('Survey inserted:', data);
                fetchSurveys();
                setCurrentSurvey(data && data.length > 0 ? data[0] : survey);
                goToHome(); // Add this line to return to home after saving
            }
        }
    };

    const editSurvey = (survey) => {
        setCurrentSurvey(survey);
        setShowCreator(true);
        setCurrentView('creator');
    };

    const creator = new SurveyCreator();
    creator.JSON = currentSurvey ? JSON.parse(currentSurvey.json) : { pages: [{ name: "page1", elements: [] }] };
    creator.saveSurveyFunc = useCallback((saveNo, callback) => {
        console.log('saveSurveyFunc called');
        const updatedSurvey = { 
            ...currentSurvey,
            title: creator.JSON.title || `Untitled Survey ${surveys.length + 1}`,
            json: creator.JSON
        };
        saveSurvey(updatedSurvey);
        callback(saveNo, true);
    }, [currentSurvey, saveSurvey, surveys.length]);

    const fetchSurveys = async () => {
        const { data, error } = await supabase
            .from('surveys')
            .select('*');
        if (error) {
            console.error('Error fetching surveys:', error);
        } else {
            console.log('Fetched surveys:', data);
            setSurveys(data);
        }
    };

    const checkOrRegisterENS = async () => {
        if (!user.wallet?.address) {
            console.log("No wallet address available");
            return;
        }

        try {
            const existingName = await getENSName(user.wallet.address);
            if (existingName) {
                setEnsName(existingName);
                console.log(`Existing ENS name found: ${existingName}`);
            } else {
                const userInput = prompt("Enter your desired ENS name (without .eth):");
                if (userInput) {
                    const isAvailable = await isENSNameAvailable(userInput);
                    if (isAvailable) {
                        const success = await registerENS(user.wallet.address, userInput);
                        if (success) {
                            setEnsName(userInput + '.eth');
                            console.log(`ENS name registered: ${userInput}.eth`);
                        } else {
                            alert("Failed to register ENS name. Please try again.");
                        }
                    } else {
                        alert("This ENS name is already taken. Please choose another.");
                        checkOrRegisterENS(); // Retry
                    }
                } else {
                    // If user cancels, generate a random name
                    let suggestedName = `user-${ethers.utils.id(user.wallet.address).slice(2, 8)}`;
                    const success = await registerENS(user.wallet.address, suggestedName);
                    if (success) {
                        setEnsName(suggestedName + '.eth');
                        console.log(`Random ENS name registered: ${suggestedName}.eth`);
                    }
                }
            }
        } catch (error) {
            console.error('Error in ENS operations:', error);
            alert('There was an error with ENS operations. Please try again later.');
        }
    };

    const toggleProfile = () => {
        setShowProfile(!showProfile);
        setIsMenuOpen(false);
    };

    const handleBiometricVerification = (hash) => {
        setBiometricHash(hash);
        setShowBiometricVerification(false);
        // You might want to store this hash in your database or use it for further verification
        console.log('Biometric hash:', hash);
    };

    if (!authenticated) {
        return (
            <div className="login-container">
                <h1>Welcome to our survey!</h1>
                <p>Please log in to continue.</p>
                <button onClick={login}>Log In</button>
            </div>
        );
    }

    return (
        <div className="app-container">
            <nav className="navbar">
                <h1 onClick={goToHome} style={{cursor: 'pointer'}}>DeForms App</h1>
                <div className="nav-right">
                    {currentView === 'home' && (
                        <button className="nav-button" onClick={createNewSurvey}>
                            Create New Survey
                        </button>
                    )}
                    <div className="profile-menu">
                        <div className="profile-icon">
                            <span>{user.email ? user.email[0].toUpperCase() : '👤'}</span>
                        </div>
                        <div className={`hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        {isMenuOpen && (
                            <div className="menu">
                                <p>{ensName || shortenAddress(user.wallet?.address)}</p>
                                <button className="menu-item" onClick={toggleProfile}>Profile</button>
                                <button className="menu-item logout-button" onClick={logout}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            <div className="main-content">
                {showProfile ? (
                    <ProfilePage 
                        ensName={ensName} 
                        walletAddress={user.wallet?.address}
                        biometricHash={biometricHash}
                        onClose={toggleProfile}
                        onStartBiometricVerification={() => setShowBiometricVerification(true)}
                    />
                ) : showBiometricVerification ? (
                    <BiometricVerification onVerificationComplete={handleBiometricVerification} />
                ) : (
                    <>
                        {currentView === 'home' && (
                            <div className="home-container">
                                <h2>Welcome to DeForms</h2>
                                <p>Create and manage your surveys here.</p>
                                <h3>Your Surveys:</h3>
                                <div className="survey-list">
                                    {surveys.map((survey) => (
                                        <div key={survey.id} className="survey-card">
                                            <h4>{survey.title || `Survey ${survey.id}`}</h4>
                                            <button onClick={() => editSurvey(survey)} className="edit-button">Edit</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {currentView === 'creator' && showCreator && (
                            <div className="creator-container">
                                <div className="creator-header">
                                    <h2>{currentSurvey?.title || "New Survey"}</h2>
                                    <button className="close-button" onClick={goToHome}>Close</button>
                                </div>
                                <SurveyCreatorComponent creator={creator} />
                            </div>
                        )}
                        {currentView !== 'home' && !showCreator && currentSurvey && (
                            <div className="survey-container">
                                <Survey model={new Model(currentSurvey)} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default SurveyComponent;
