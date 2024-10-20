import React, { useState, useCallback, useEffect } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { usePrivy } from '@privy-io/react-auth';
import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import { supabase } from './supabaseClient';
import { getENSName, registerENS, isENSNameAvailable } from './ensService';
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import "./index.css";

function SurveyComponent() {
    const { login, authenticated, user, logout } = usePrivy();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showCreator, setShowCreator] = useState(false);
    const [currentSurvey, setCurrentSurvey] = useState(null);
    const [currentView, setCurrentView] = useState('home');
    const [surveys, setSurveys] = useState([]);
    const [answeredSurveys, setAnsweredSurveys] = useState([]);
    const [isEnterprise, setIsEnterprise] = useState(false);
    const [surveyResults, setSurveyResults] = useState(null);
    const [ensName, setEnsName] = useState(null);

    useEffect(() => {
        if (authenticated && user) {
            handleUserAuthentication();
        }
    }, [authenticated, user]);

    const handleUserAuthentication = async () => {
        if (user && user.wallet?.address) {
            try {
                const userDetails = await fetchOrCreateUser(user.wallet.address);
                if (userDetails) {
                    setEnsName(userDetails.ens_name);
                    setIsEnterprise(userDetails.type === 'enterprise');
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

    const fetchSurveys = async () => {
        let query;
        if (isEnterprise) {
            query = supabase
                .from('surveys')
                .select('*')
                .eq('ens_name', ensName);
        } else {
            query = supabase
                .from('surveys')
                .select('*');
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching surveys:', error);
        } else {
            setSurveys(data);
        }
    };

    const fetchAnsweredSurveys = async () => {
        if (ensName) {
            const { data, error } = await supabase
                .from('user_survey_responses')
                .select('survey_id')
                .eq('user_ens_name', ensName);
            
            if (error) {
                console.error('Error fetching answered surveys:', error);
            } else {
                setAnsweredSurveys(data.map(item => item.survey_id));
            }
        }
    };

    const submitSurveyAnswer = async (surveyId, answers) => {
        const { data, error } = await supabase
            .from('survey_results')
            .insert([
                { survey_id: surveyId, ens_name: ensName, answers: answers }
            ]);
        
        if (error) {
            console.error('Error saving survey result:', error);
        } else {
            console.log('Survey result saved successfully');
            
            const { error: responseError } = await supabase
                .from('user_survey_responses')
                .insert([
                    { user_ens_name: ensName, survey_id: surveyId }
                ]);
            
            if (responseError) {
                console.error('Error recording survey response:', responseError);
            } else {
                await fetchAnsweredSurveys();
                setCurrentView('home');
            }
        }
    };

    // ... (rest of the component code remains the same)

    // In the enterprise view
    return (
        <div className="app-container">
            {renderNavbar()}
            <div className="main-content">
                {currentView === 'profile' && renderProfilePage()}
                {currentView === 'home' && (
                    <div className="home-container">
                        <h2>Available Surveys</h2>
                        <div className="survey-list">
                            {surveys.filter(survey => !answeredSurveys.includes(survey.id)).map((survey) => (
                                <div key={survey.id} className="survey-card">
                                    <h4>{survey.title}</h4>
                                    <div className="survey-card-buttons">
                                        <button onClick={() => editSurvey(survey)}>Edit</button>
                                        <button onClick={() => viewSurveyResults(survey.id)}>View Results</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {currentView === 'answered' && (
                    <div className="home-container">
                        <h2>Answered Surveys</h2>
                        <div className="survey-list">
                            {surveys.filter(survey => answeredSurveys.includes(survey.id)).map((survey) => (
                                <div key={survey.id} className="survey-card">
                                    <h4>{survey.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {currentView === 'answer' && currentSurvey && (
                    <div className="survey-container">
                        <Survey 
                            model={new Model(JSON.parse(currentSurvey.json))}
                            onComplete={(sender) => submitSurveyAnswer(currentSurvey.id, sender.data)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default SurveyComponent;
