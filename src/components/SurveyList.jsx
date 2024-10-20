import React from 'react';
import SurveyCard from './SurveyCard';
import '../styles/SurveyList.css';

function SurveyList({ surveys, isEnterprise, onEditSurvey, onViewResults, onAnswerSurvey, currentView, canAnswerSurveys, credibilityScore, initialSurveyCompleted }) {
    console.log('SurveyList received surveys:', surveys);
    console.log('Current view:', currentView);
    console.log('Can answer surveys:', canAnswerSurveys);
    console.log('Initial survey completed:', initialSurveyCompleted);

    return (
        <div className="survey-list-container">
            <h2 className="survey-list-title">
                {isEnterprise ? 'Your Surveys' : (currentView === 'home' ? 'Available Surveys' : 'Answered Surveys')}
            </h2>
            {!isEnterprise && currentView === 'home' && (
                <div className="survey-info">
                    {!initialSurveyCompleted ? (
                        <p>Complete this survey to unlock more surveys.</p>
                    ) : !canAnswerSurveys ? (
                        <p>You can see all surveys, but you need to increase your credibility score to 15 to answer them. Current score: {credibilityScore}</p>
                    ) : null}
                </div>
            )}
            <div className="survey-grid">
                {surveys.map(survey => (
                    <SurveyCard
                        key={survey.id}
                        survey={survey}
                        isEnterprise={isEnterprise}
                        onEdit={isEnterprise ? () => onEditSurvey(survey) : undefined}
                        onViewResults={() => onViewResults(survey.id)}
                        onAnswer={!isEnterprise && currentView === 'home' && (canAnswerSurveys || !initialSurveyCompleted) ? () => onAnswerSurvey(survey) : undefined}
                        isAnswered={currentView === 'answered'}
                        canAnswer={canAnswerSurveys || !initialSurveyCompleted}
                    />
                ))}
            </div>
        </div>
    );
}

export default SurveyList;
