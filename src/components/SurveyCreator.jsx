import React from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.css";
import '../styles/SurveyCreator.css';

function SurveyCreatorWrapper({ survey, onSave, isAnswering, onSubmit }) {
    if (isAnswering) {
        const model = new Model(JSON.parse(survey.json));
        return (
            <div className="survey-creator">
                <Survey 
                    model={model}
                    onComplete={(sender) => onSubmit(sender.data)}
                />
            </div>
        );
    }

    const creator = new SurveyCreator();
    creator.JSON = survey ? JSON.parse(survey.json) : { pages: [{ name: "page1", elements: [] }] };
    
    creator.saveSurveyFunc = (saveNo, callback) => {
        onSave({ ...survey, json: JSON.stringify(creator.JSON) });
        callback(saveNo, true);
    };

    return (
        <div className="survey-creator">
            <SurveyCreatorComponent creator={creator} />
        </div>
    );
}

export default SurveyCreatorWrapper;
