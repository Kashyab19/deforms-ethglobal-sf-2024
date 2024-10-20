import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/SurveyResults.css';

function SurveyResults({ surveyId, onBack, isEnterprise, onMintResult, dataTokenContract }) {
    const [results, setResults] = useState([]);

    useEffect(() => {
        fetchResults();
    }, [surveyId]);

    const fetchResults = async () => {
        const { data, error } = await supabase
            .from('survey_results')
            .select('*')
            .eq('survey_id', surveyId);
        
        if (error) {
            console.error('Error fetching survey results:', error);
        } else {
            setResults(data);
        }
    };

    const renderAnswer = (answer) => {
        if (Array.isArray(answer)) {
            return answer.join(', ');
        } else if (typeof answer === 'object' && answer !== null) {
            return JSON.stringify(answer, null, 2);
        }
        return answer.toString();
    };

    const handleMint = async (result) => {
        if (onMintResult) {
            await onMintResult(result);
        }
    };

    return (
        <div className="results-container">
            <h2>Survey Results</h2>
            {results.length === 0 ? (
                <p>No results available for this survey.</p>
            ) : (
                results.map((result, index) => (
                    <div key={index} className="result-card">
                        <h3>Respondent: {result.user_wallet_address}</h3>
                        {Object.entries(result.answers).map(([question, answer], i) => (
                            <div key={i} className="answer-item">
                                <p><strong>Question:</strong> {question}</p>
                                <p><strong>Answer:</strong> {renderAnswer(answer)}</p>
                            </div>
                        ))}
                        {isEnterprise && (
                            <button onClick={() => handleMint(result)} className="mint-button">
                                Mint Result
                            </button>
                        )}
                    </div>
                ))
            )}
            <button onClick={onBack}>Back to Surveys</button>
        </div>
    );
}

export default SurveyResults;
