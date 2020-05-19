'use strict';

const {
  dialogflow,
  Suggestions,
  Image,
  BasicCard,
  Button,
  Carousel
} = require('actions-on-google');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = dialogflow({ debug: true });

admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ timestampsInSnapshots: true });

const auth = admin.auth();
const db = admin.firestore();

const dataRef = db.collection('data');

app.intent('next event', (conv) => {
  var t2 = {};
  var x, count = 0, tempvariable;

  return dataRef.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        count = count + 1;
        tempvariable = doc.id;
      });
      if (count == 1) {
        const fulRef = dataRef.doc(`${tempvariable}`);
        return fulRef.get()
          .then(doc => {
            const { link, image, title, description, date, address } = doc.data();
            conv.ask(`Our next event is on the topic \"${title}\". Here are the details :`);
            conv.ask(new BasicCard({
              text: `${description}  \n  \n**Organised By :** DSC KIIT  \n**Event Date :** ${date}  \n**Event Address :** ${address}  \n**Contact :** Manzar Hasnain (+91 7504417023)`,
              title: `${title}`,
              buttons: new Button({
                title: `Join Us for the Event!`,
                url: `${link}`,
              }),
              image: new Image({
                url: `${image}`,
                alt: `${title}`,
              }),
              display: 'WHITE',
            }));
            conv.ask(new Suggestions(['Previous Events', 'What is DSC?', 'Main Menu']));
          })
          .catch(err => {
            console.log('Error getting documents', err);
          });
      }
      else if (count == 0) {
        conv.ask('There are no upcoming events at the moment.');
        conv.ask(new Suggestions(['Previous Events', 'What is DSC?', 'Main Menu']));
      }
      else {
        const dataRef = db.collection('data');
        return dataRef.get()
          .then(snapshot => {
            conv.ask('Here are all the upcoming events. Click on anyone to view it in details.');
            snapshot.forEach(doc => {
              x = {
                title: `${doc.data().title}`,
                image: new Image({
                  url: doc.data().image,
                  alt: `${doc.data().title}`,
                }),
                display: 'CROPPED',
              };
              t2[`${doc.id}`] = x;
            });
            conv.ask(new Carousel({
              items: t2,
            }));
          })
          .catch(err => {
            console.log('Error getting documents', err);
          });
      }
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
});

app.intent('next event - next', (conv, params, option) => {
  var term = option;
  const termRef = dataRef.doc(`${term}`);
  return termRef.get()
    .then((snapshot) => {
      const { link, image, title, description, date, address } = snapshot.data();
            conv.ask(`This event is on the topic \"${title}\". Here are the details :`);
            conv.ask(new BasicCard({
              text: `${description}  \n  \n**Organised By :** DSC KIIT  \n**Event Date :** ${date}  \n**Event Address :** ${address}  \n**Contact :** Manzar Hasnain (+91 7504417023)`,
              title: `${title}`,
              buttons: new Button({
                title: `Join Us for the Event!`,
                url: `${link}`,
              }),
              image: new Image({
                url: `${image}`,
                alt: `${title}`,
              }),
              display: 'WHITE',
            }));
            conv.ask(new Suggestions(['Previous Events', 'What is DSC?', 'Main Menu']));      
    });
}).catch(err => {
  console.log(`error:`, err);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
