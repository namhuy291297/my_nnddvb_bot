'use strict';

const { WebhookClient, Card, Suggestion } = require('dialogflow-fulfillment');
const {BasicCard, Button, BrowseCarousel, BrowseCarouselItem, List, Suggestions} = require('actions-on-google');
process.env.DEBUG = 'dialogflow:debug';
const moment = require('moment');
const db_user = require('./db.json').users;
const db_book = require('./db.json').books;

var all_kind_of_book = '';
var profileName = '';
var meeting;

class Webhook {
    static async handleRequest(req, res) {
        try {
            let agent = new WebhookClient({ request: req, response: res });
            agent.requestSource = agent.ACTIONS_ON_GOOGLE; // request action to google when have new intent

            let intentMap = new Map();
            intentMap.set('greeting', Webhook.greeting);
            intentMap.set('error', Webhook.error);
            intentMap.set('meeting', Webhook.meeting);
            intentMap.set('meeting-confirm', Webhook.meetingConfirm);
            intentMap.set('meeting-cancel', Webhook.meetingCancel);
            intentMap.set('book', Webhook.book);
            intentMap.set('book-price', Webhook.bookPrice);
            intentMap.set('profile', Webhook.profile);
            intentMap.set('profile-more', Webhook.profileMore);
            intentMap.set('thank', Webhook.thank);
            agent.handleRequest(intentMap);

            //   const agent = new WebhookClient({ request, response });
            //   console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            //   console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
        } 
        catch (error) {

        }
    }

    static async greeting(agent) {
        // agent.add(`Hello to my agent !`);
    }

    static async error(agent) {
        // agent.add(`I didn't understand. Can you try again ?`);
    }

    static async meeting(agent) {
        // console.log(agent.parameters);
        if (agent.parameters['date'] !== '' && agent.parameters['time'] !== '' && agent.parameters['duration'] !== '') {
            meeting = agent.parameters;
            agent.add(`Do you confirm the booking on ${moment(agent.parameters['date']).format('YYYY-MM-DD')} at ${moment(agent.parameters['time']).format('HH:mm')} for ${agent.parameters['duration']} ?`);
        }
    }

    static async meetingConfirm(agent) {
        if (meeting !== '') {
            agent.add(`The meeting room was created successfully`);
            meeting = '';
        }
        else{
            agent.add(`Sorry, i don't understand. Try something else`);
        }
    }

    static async meetingCancel(agent) {
        if (meeting !== '') {
            agent.add(`Your booking was cancelled`);
            meeting = '';
        }
        else{
            agent.add(`Sorry, i don't understand. Try something else`);
        }
    }

    static async book(agent) {
        all_kind_of_book = agent.parameters['book'];
    }

    static async bookPrice(agent) {
        var book;
        var kind_of_book = agent.parameters['book'];

        if (kind_of_book.length > 0 && kind_of_book.length < 2) {
            db_book.map((b, index) => {
                if (b.type == agent.parameters['book']) book = b;
            });
            agent.add(`${book.price} $`);
        }
        else if (kind_of_book.length > 1) {
            var books = [];
            var message = [];
            db_book.map((b, index) => {
                kind_of_book.map(kob => {
                    if (b.type == kob) books.push(b);
                })
            });
            books.map(bs => {
                message += `, ${bs.type} book is ${bs.price}$`
            });
            agent.add(message.substring(2));
        }
        else {
            if (all_kind_of_book.length > 0 && all_kind_of_book.length < 2) {
                db_book.map((b, index) => {
                    if (b.type == all_kind_of_book) book = b;
                });
                agent.add(`${book.price} $`);
            }
            if (all_kind_of_book.length > 1) {
                var books = [];
                var message = [];
                db_book.map((b, index) => {
                    all_kind_of_book.map(kob => {
                        if (b.type == kob) books.push(b); 
                    })
                });
                books.map(bs => {
                    message += `, ${bs.type} book is ${bs.price}$`
                });
                agent.add(message.substring(2));
            }
        }
    }

    static async profile(agent) {
        // if (agent.originalRequest.source === 'google') {
        //     agent.requestSource = agent.ACTIONS_ON_GOOGLE;
        // } else {
        //     agent.requestSource = agent.originalRequest.source.toUpperCase() || agent.ACTIONS_ON_GOOGLE;
        // }

        var user;
        var param = agent.parameters['name'];
        profileName = param;
        if (param == "you") {
            agent.add(`I am a bot of CLV, my owner is Huy Nguyen. I was created to answer everyone's questions.`);
        }
        else {
            db_user.map((u, index) => {
                if (u.user_id == param) user = u;
            });
            agent.add(`${user.name} ${user.profile}`);
        }

        // agent.add(new Card({
        //     title: `Title: this is a card title`,
        //     imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        //     text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
        //     buttonText: 'This is a button',
        //     buttonUrl: 'https://assistant.google.com/'
        // }));
    }

    static async profileMore(agent){
        var user;
        var param = agent.parameters['name'];
        if(param !== ''){
            db_user.map((u, index) => {
                if (u.user_id == param) user = u;
            });
        }
        else{
            db_user.map((u, index) => {
                if (u.user_id == profileName) user = u;
            });
        }
        // source: https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array
        agent.add(`${user.name} ${user.profileMore[Math.floor(Math.random() * user.profileMore.length)]}`);
    }

    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    //   agent.add(new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: 'This is a button',
    //       buttonUrl: 'https://assistant.google.com/'
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    // }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample
};

module.exports.Webhook = Webhook;