import React from 'react';
import SurveyCard from './SurveyCard';
import '../styles/SurveyList.css';

function SurveyList({ surveys, answeredSurveys, isEnterprise, onEditSurvey, onViewResults, onAnswerSurvey, currentView }) {
    const unansweredSurveys = surveys.filter(survey => !answeredSurveys.includes(survey.id));
    const answeredSurveysList = surveys.filter(survey => answeredSurveys.includes(survey.id));

    return (
        <div className="survey-list-container">
            {isEnterprise ? (
                <>
                    <h2 className="survey-list-title">Your Surveys</h2>
                    <div className="survey-grid">
                        {surveys.map(survey => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                isEnterprise={isEnterprise}
                                onEdit={() => onEditSurvey(survey)}
                                onViewResults={() => onViewResults(survey.id)}
                            />
                        ))}
                    </div>
                </>
            ) : currentView === 'home' ? (
                <>
                    <h2 className="survey-list-title">Available Surveys</h2>
                    <div className="survey-grid">
                        {unansweredSurveys.map(survey => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                isEnterprise={isEnterprise}
                                onAnswer={() => onAnswerSurvey(survey)}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <h2 className="survey-list-title">Answered Surveys</h2>
                    <div className="survey-grid">
                        {answeredSurveysList.map(survey => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                isEnterprise={isEnterprise}
                                isAnswered={true}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default SurveyList;
