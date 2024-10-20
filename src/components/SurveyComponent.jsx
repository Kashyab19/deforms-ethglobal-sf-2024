import React, { useState, useEffect } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '../supabaseClient';
import { getENSName, registerENS } from '../ensService';
import LoginScreen from './LoginScreen';
import Navbar from './Navbar';
import ProfilePage from './ProfilePage';
import SurveyList from './SurveyList';
import SurveyCreator from './SurveyCreator';
import SurveyResults from './SurveyResults';
import "../styles/SurveyComponent.css";

function SurveyComponent() {
    const { authenticated, user, logout } = usePrivy();
    const [currentView, setCurrentView] = useState('home');
    const [previousView, setPreviousView] = useState('home');
    const [surveys, setSurveys] = useState([]);
    const [answeredSurveys, setAnsweredSurveys] = useState([]);
    const [isEnterprise, setIsEnterprise] = useState(false);
    const [ensName, setEnsName] = useState(null);
    const [currentSurvey, setCurrentSurvey] = useState(null);
    const [showENSPrompt, setShowENSPrompt] = useState(false);
    const [credibilityScore, setCredibilityScore] = useState(0);

    useEffect(() => {
        if (authenticated && user) {
            handleUserAuthentication();
        }
    }, [authenticated, user]);

    const handleUserAuthentication = async () => {
        if (user && user.wallet?.address) {
            try {
                let userDetails = await fetchUser(user.wallet.address);
                
                if (!userDetails) {
                    userDetails = await createUser(user.wallet.address);
                }

                if (userDetails) {
                    setIsEnterprise(userDetails.type === 'enterprise');
                    setCredibilityScore(userDetails.credibility_score);

                    const ensName = await getENSName(user.wallet.address);
                    if (ensName) {
                        setEnsName(ensName);
                    } else {
                        setShowENSPrompt(true);
                    }

                    await fetchSurveys();
                    if (userDetails.type !== 'enterprise') {
                        await fetchAnsweredSurveys();
                    }
                } else {
                    console.error('Failed to fetch or create user');
                }
            } catch (error) {
                console.error('Error in handleUserAuthentication:', error);
            }
        }
    };

    const handleENSVerification = async (createENS) => {
        if (createENS) {
            const newENSName = await registerENS(user.wallet.address);
            await updateUserENS(user.wallet.address, newENSName);
            setEnsName(newENSName);
            await updateUserCredibility(user.wallet.address, 25);
        } else {
            // Implement staking logic here
            console.log("User needs to stake 0.005 ETH");
        }
        setShowENSPrompt(false);
    };

    const updateUserENS = async (walletAddress, ensName) => {
        const { data, error } = await supabase
            .from('users')
            .update({ ens_name: ensName })
            .eq('wallet_address', walletAddress);

        if (error) {
            console.error('Error updating user ENS:', error);
        }
    };

    const updateUserCredibility = async (walletAddress, points) => {
        // First, get the current credibility score
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('credibility_score')
            .eq('wallet_address', walletAddress)
            .single();

        if (fetchError) {
            console.error('Error fetching user credibility:', fetchError);
            return;
        }

        const newScore = (userData.credibility_score || 0) + points;

        // Then, update with the new score
        const { data, error } = await supabase
            .from('users')
            .update({ credibility_score: newScore })
            .eq('wallet_address', walletAddress);

        if (error) {
            console.error('Error updating user credibility:', error);
        } else {
            setCredibilityScore(newScore);
        }
    };

    const fetchUser = async (walletAddress) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user:', error);
            return null;
        }

        return data;
    };

    const createUser = async (walletAddress) => {
        let ensName = await getENSName(walletAddress);
        if (!ensName) {
            ensName = await createMockENSName(walletAddress);
        }

        const isEnterprise = localStorage.getItem('isEnterprise') === 'true';

        const newUser = {
            wallet_address: walletAddress,
            ens_name: ensName,
            type: isEnterprise ? 'enterprise' : 'regular'
        };

        const { data, error } = await supabase
            .from('users')
            .insert([newUser])
            .select();

        if (error) {
            console.error('Error creating user:', error);
            return null;
        }

        return data[0];
    };

    const createMockENSName = async (address) => {
        const baseEnsName = address.slice(2, 8);
        let ensName = baseEnsName;
        let counter = 1;
        while (!(await isENSNameAvailable(ensName))) {
            ensName = `${baseEnsName}${counter}`;
            counter++;
        }
        await registerENS(address, ensName);
        return `${ensName}.eth`;
    };

    const fetchSurveys = async () => {
        const { data, error } = await supabase
            .from('surveys')
            .select('*');

        if (error) {
            console.error('Error fetching surveys:', error);
        } else {
            setSurveys(data);
        }
    };

    const fetchAnsweredSurveys = async () => {
        const { data, error } = await supabase
            .from('user_survey_responses')
            .select('survey_id')
            .eq('user_ens_name', ensName);
        
        if (error) {
            console.error('Error fetching answered surveys:', error);
        } else {
            const answeredSurveyIds = data.map(item => item.survey_id);
            setAnsweredSurveys(answeredSurveyIds);
        }
    };

    const answerSurvey = (survey) => {
        setCurrentSurvey(survey);
        setCurrentView('answer');
    };

    const handleCreateSurvey = async (surveyData) => {
        try {
            const { data, error } = await supabase
                .from('surveys')
                .insert([surveyData])
                .select();

            if (error) {
                console.error('Error creating survey:', error);
            } else {
                console.log('Survey created successfully:', data);
                await fetchSurveys();
                setCurrentView('home');
            }
        } catch (error) {
            console.error('Error in survey creation process:', error);
        }
    };

    const handleAnswerSurvey = async (surveyId, answers) => {
        try {
            const { data, error } = await supabase
                .from('survey_results')
                .insert([
                    { survey_id: surveyId, user_ens_name: ensName, answers: answers }
                ]);

            if (error) {
                console.error('Error submitting survey answers:', error);
            } else {
                console.log('Survey answers submitted successfully:', data);
                await fetchAnsweredSurveys();
                setCurrentView('home');
            }
        } catch (error) {
            console.error('Error answering survey:', error);
        }
    };

    const changeView = (newView) => {
        setPreviousView(currentView);
        setCurrentView(newView);
    };

    if (!authenticated) {
        return <LoginScreen />;
    }

    return (
        <div className="app-container">
            <Navbar 
                isEnterprise={isEnterprise} 
                ensName={ensName} 
                logout={logout}
                setCurrentView={changeView}
                credibilityScore={credibilityScore}
            />
            <div className="main-content">
                {showENSPrompt && (
                    <div className="ens-prompt">
                        <h2>ENS Verification</h2>
                        <p>You don't have an ENS name. Would you like to create one and increase your credibility by 25 points?</p>
                        <button onClick={() => handleENSVerification(true)}>Yes, create ENS name</button>
                        <button onClick={() => handleENSVerification(false)}>No, I'll stake 0.005 ETH instead</button>
                    </div>
                )}
                {currentView === 'profile' && (
                    <ProfilePage 
                        user={user} 
                        ensName={ensName} 
                        isEnterprise={isEnterprise} 
                        onClose={() => setCurrentView(previousView)}
                    />
                )}
                {(currentView === 'home' || currentView === 'answered') && (
                    <SurveyList 
                        surveys={surveys}
                        answeredSurveys={answeredSurveys}
                        isEnterprise={isEnterprise}
                        onEditSurvey={(survey) => {
                            setCurrentSurvey(survey);
                            changeView('creator');
                        }}
                        onViewResults={(surveyId) => {
                            setCurrentSurvey(surveys.find(s => s.id === surveyId));
                            changeView('results');
                        }}
                        onAnswerSurvey={answerSurvey}
                        currentView={currentView}
                    />
                )}
                {currentView === 'creator' && (
                    <SurveyCreator 
                        onSave={handleCreateSurvey}
                    />
                )}
                {currentView === 'answer' && currentSurvey && (
                    <SurveyCreator 
                        survey={currentSurvey}
                        isAnswering={true}
                        onSubmit={(answers) => handleAnswerSurvey(currentSurvey.id, answers)}
                    />
                )}
                {currentView === 'results' && (
                    <SurveyResults 
                        surveyId={currentSurvey?.id}
                        onBack={() => changeView('home')}
                    />
                )}
            </div>
        </div>
    );
}

export default SurveyComponent;
