/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

const _ = require('lodash');
const Alexa = require('alexa-sdk');
const laksaKlaxon = require('laksa-klaxon-core');

const APP_ID = 'amzn1.ask.skill.2ddf04da-8dc9-4951-92b2-8f49309b79ae';

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Laksa Klaxon',
            WELCOME_MESSAGE: "Welcome to the %s. You can ask a question like, is there any Laksa today in Manchester? ... Now, what can I help you with?",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: 'Checking for Laksa in %s.',
            HELP_MESSAGE: "You can ask questions such as, is there any Laksa in Manchester?, or, you can say exit...Now, what can I help you with?",
            HELP_REPROMPT: "You can say things like, any Laksa today, or you can say exit...Now, what can I help you with?",
            STOP_MESSAGE: 'Enjoy your Laksa today!',
            ERROR_MESSAGE: 'Something went south... %s',
            LAKSA_FOUND_MESSAGE: "I found laksa at %s",
            LAKSA_NOT_FOUND_MESSAGE: "no laksa found at %s",
            NO_LAKSA_TODAY_MESSAGE: "looks like there is no Laksa today in %s",
            LAKSA_NOT_FOUND_REPROMPT: 'Shall I search somewhere else for Laksa?',
        },
    },
    'en-GB': {
        translation: {
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'getLaksaIntent': function () {
        const alexa = this;
        const itemSlot = this.event.request.intent.slots.city;
        let city = 'manchester';
        if (itemSlot && itemSlot.value) {
            city = itemSlot.value.toLowerCase();
        }

        laksaKlaxon.checkCity(city)
            .then(results => {
                let anyLaksaToday = _.some(results, {hasLaksa: true});
                if (!anyLaksaToday) {
                    alexa.emit(':tell', alexa.t('NO_LAKSA_TODAY_MESSAGE', city));
                    return;
                }
                let speechOutput = [];
                let foundAt = _.filter(results, {hasLaksa: true});
                _.forEach(foundAt, (location) => {
                    speechOutput.push(alexa.t('LAKSA_FOUND_MESSAGE', location.place));
                });
                const repromptSpeech = alexa.t('LAKSA_NOT_FOUND_MESSAGE');
                alexa.emit(':tell', speechOutput.join(' and '), repromptSpeech);
            }).catch((e) => {
                console.log(e);
                alexa.emit(':tell', alexa.t('ERROR_MESSAGE', e.message));
            });
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
