import React from 'react';
import SurveyCard from './SurveyCard';
import '../styles/SurveyList.css';

function SurveyList({ surveys, isEnterprise, onEditSurvey, onViewResults, onAnswerSurvey, currentView }) {
    console.log('SurveyList received surveys:', surveys);
    console.log('Current view:', currentView);

    return (
        <div className="survey-list-container">
            <h2 className="survey-list-title">
                {currentView === 'home' ? 'Available Surveys' : 'Answered Surveys'}
            </h2>
            <div className="survey-grid">
                {surveys.map(survey => (
                    <SurveyCard
                        key={survey.id}
                        survey={survey}
                        isEnterprise={isEnterprise}
                        onEdit={isEnterprise ? () => onEditSurvey(survey) : undefined}
                        onViewResults={() => onViewResults(survey.id)}
                        onAnswer={currentView === 'home' ? () => onAnswerSurvey(survey) : undefined}
                        isAnswered={currentView === 'answered'}
                    />
                ))}
            </div>
        </div>
    );
}

export default SurveyList;
