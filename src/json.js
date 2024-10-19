export const json = {
  "completedBeforeHtml":"<div style='margin-top: 10px;'><h3 style='margin-top: 30px;'>You have already completed this survey.</h3><h4 style='margin-top: 15px;'>Open example settings to delete cookies and reload the page.</h4></div>",
  "cookieName": "car-survey-id",
  "elements": [
    {
      "type": "text",
      "name": "name",
      "title": "Name"
    },
    {
      "type": "text",
      "name": "email",
      "title": "Email address"
    },
    {
      "type": "checkbox",
      "name": "car",
      "title": "Which car do you drive?",
      "isRequired": true,
      "colCount": 4,
      "showNoneItem": true,
      "choices": [
        "Ford",
        "Vauxhall",
        "Volkswagen",
        "Nissan",
        "Audi",
        "Mercedes-Benz",
        "BMW",
        "Peugeot",
        "Toyota",
        "Citroen"
      ]
    }
  ],
  "showQuestionNumbers": "off"
};