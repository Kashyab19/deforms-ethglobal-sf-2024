import React from 'react';
import SurveyCard from './SurveyCard';
import '../styles/SurveyList.css';

function SurveyList({ 
    surveys, 
    answeredSurveys = [],  // Provide a default empty array
    isEnterprise, 
    onEditSurvey, 
    onViewResults, 
    onAnswerSurvey, 
    canAnswerSurveys, 
    credibilityScore, 
    initialSurveyCompleted 
}) {
    const displaySurveys = isEnterprise 
        ? surveys 
        : surveys.filter(survey => !answeredSurveys.includes(survey.id));

    return (
        <div className="survey-list-container">
            <h2 className="survey-list-title">
                {isEnterprise ? 'Your Surveys' : 'Available Surveys'}
            </h2>
            {!isEnterprise && initialSurveyCompleted && credibilityScore < 15 && (
                <p className="survey-info">
                    You can see all surveys, but you need to increase your credibility score to 15 to answer them. Current score: {credibilityScore}
                </p>
            )}
            <div className="survey-grid">
                {displaySurveys.map(survey => (
                    <SurveyCard
                        key={survey.id}
                        survey={survey}
                        isEnterprise={isEnterprise}
                        onEdit={isEnterprise ? () => onEditSurvey(survey) : undefined}
                        onViewResults={isEnterprise ? () => onViewResults(survey.id) : undefined}
                        onAnswer={canAnswerSurveys ? () => onAnswerSurvey(survey) : undefined}
                        canAnswer={canAnswerSurveys}
                    />
                ))}
            </div>
        </div>
    );
}

export default SurveyList;
