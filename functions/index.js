"use strict";

const { google } = require("googleapis");
const functions = require('firebase-functions');
const admin = require('firebase-admin')
const { JWT } = require('google-auth-library');
var key = require('./PATH JSON');
const request = require("request");
const uid2 = `YOUR USER ID`

admin.initializeApp(functions.config().firebase)

exports.onUpdateCiudad = functions.database.ref('/Paradas/{id}/')
    .onUpdate((snapshot) => {
        // Grab the current value of what was written to the Realtime Database.
        const after = snapshot.after.val().publicidad
        const before = snapshot.before.val().publicidad
        console.log('Valor', after);
        console.log("Listo!");
        if (after === before) {
            console.log("No se cambio porque es igual al anterior");
            return null
        }
        const aux = `El valor ingresado es ${after}`
        console.log(aux);
        if (after) {
            console.log("Lleno");
            // const msj= `Hay ${after} clientes conectados`
            const msj = `Publicidad ${after}`
            sendNotification(msj)
        }
        else
            console.log("Vacio");

        return null
    });


exports.onCreatePublicidad = functions.database.ref('/Paradas/{id}/publicidad')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();
        if (original) {
            console.log('True');
        } else {
            console.log('False');
        }
        return null
    });

function sendNotification(msj) {

    let jwtClient = new JWT(
        key.client_email, null, key.private_key,
        ['https://www.googleapis.com/auth/actions.fulfillment.conversation'],
        null
    );

    jwtClient.authorize((authErr, tokens) => {
        let notification = {
            userNotification: {
                title: msj,
            },
            target: {
                userId: uid2,
                intent: 'Latest News',
                // Expects a IETF BCP-47 language code (i.e. en-US)
                locale: 'es-ES'
            },
        };

        request.post('https://actions.googleapis.com/v2/conversations:send', {
            'auth': {
                'bearer': tokens.access_token,
            },
            'json': true,
            'body': {
                'customPushMessage': notification
            },
        }, (reqErr, httpResponse, body) => {
            console.log(httpResponse.statusCode + ': ' + httpResponse.statusMessage);
        });
    });

}