const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const admin = require('firebase-admin');
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express().use(body_parser.json());

const mytoken = "32D721YWSetkhiID5j5yqxICLo8MmDgm";

// Specify the path to the log file committed in your repo
const logFilePath = path.join(__dirname, './webhook_logs.txt');

function logToFile(message) {
    fs.appendFile(logFilePath, message + '\n', (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}


// app.all("/webhook", async (req, res) => {
//     if (req.method === "GET") {
//         let mode = req.query["hub.mode"];
//         let challenge = req.query["hub.challenge"];
//         let token = req.query["hub.verify_token"];

//         logToFile(`Received GET request: ${JSON.stringify(req.query)}`);

//         if (mode && token) {
//             if (mode === "subscribe" && token === mytoken) {
//                 res.status(200).send(challenge);
//                 logToFile("Challenge accepted");
//             } else {
//                 res.status(403).send("Forbidden");
//                 logToFile("Forbidden: invalid token");
//             }
//         } else {
//             res.status(400).send("Bad Request");
//             logToFile("Bad Request: missing mode or token");
//         }
//     } else if (req.method === "POST") {
//         let body_param = req.body;
//         logToFile(`Received POST request: ${JSON.stringify(body_param)}`);

//         if (body_param.object) {
//             logToFile("Inside body param");
//             if (
//                 body_param.entry &&
//                 body_param.entry[0].changes &&
//                 body_param.entry[0].changes[0].value.messages &&
//                 body_param.entry[0].changes[0].value.messages[0]
//             ) {
//                 let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
//                 let from = body_param.entry[0].changes[0].value.messages[0].from;

//                 await storeButtonResponse(phon_no_id, from, body_param);

//                 res.sendStatus(200);
//             } else {
//                 res.sendStatus(404);
//                 logToFile("No messages found in the body param");
//             }
//         } else {
//             res.sendStatus(404);
//             logToFile("Object not found in the body param");
//         }
//     } else {
//         res.status(405).send("Method Not Allowed");
//         logToFile("Method Not Allowed");
//     }
// });

// // async function storeButtonResponse(phoneNumberId, senderNumber, body_param) {
// //     try {
// //         await db.collection("whatsapp-button-responses").add({
// //             phoneNumberId,
// //             from: senderNumber,
// //             body_param,
// //             timestamp: admin.firestore.FieldValue.serverTimestamp()
// //         });
// //         logToFile("Webhook data stored in Firestore.");
// //         console.log("Webhook data stored in Firestore.");
// //     } catch (error) {
// //         logToFile(`Error storing webhook data in Firestore: ${error}`);
// //         console.error("Error storing webhook data in Firestore:", error);
// //     }
// // }

// async function storeButtonResponse(phoneNumberId, senderNumber, body_param) {
//     try {
//         // Check if this is a button response
//         if (body_param.entry && 
//             body_param.entry[0].changes && 
//             body_param.entry[0].changes[0].value.messages && 
//             body_param.entry[0].changes[0].value.messages[0].interactive) {
            
//             const buttonResponse = body_param.entry[0].changes[0].value.messages[0].interactive.button_reply.title;
            
//             if (buttonResponse === "Yes, I'm Back & Safe") {
//                 // Store the response data in Firestore
//                 const docRef = await db.collection("whatsapp-button-responses").add({
//                     phoneNumberId,
//                     from: senderNumber,
//                     response: buttonResponse,
//                     fullMessage: body_param,
//                     timestamp: admin.firestore.FieldValue.serverTimestamp()
//                 });
//                 logToFile(`User response "Yes, I'm Back & Safe" stored in Firestore with ID: ${docRef.id}`);
//                 console.log(`User response "Yes, I'm Back & Safe" stored in Firestore with ID: ${docRef.id}`);
//             }
//         }
//     } catch (error) {
//         logToFile(`Error storing user response in Firestore: ${error.message}`);
//         console.error("Error storing user response in Firestore:", error);
//     }
// }

// app.all("/webhook", async (req, res) => {
//     if (req.method === "GET") {
//         let mode = req.query["hub.mode"];
//         let challenge = req.query["hub.challenge"];
//         let token = req.query["hub.verify_token"];

//         logToConsole(`Received GET request: ${JSON.stringify(req.query)}`);

//         if (mode && token) {
//             if (mode === "subscribe" && token === mytoken) {
//                 res.status(200).send(challenge);
//                 logToConsole("Challenge accepted");
//             } else {
//                 res.status(403).send("Forbidden");
//                 logToConsole("Forbidden: invalid token");
//             }
//         } else {
//             res.status(400).send("Bad Request");
//             logToConsole("Bad Request: missing mode or token");
//         }
//     } else if (req.method === "POST") {
//         let body_param = req.body;
//         logToConsole(`Received POST request: ${JSON.stringify(body_param)}`);

//         if (body_param.object) {
//             logToConsole("Inside body param");
//             if (
//                 body_param.entry &&
//                 body_param.entry[0].changes &&
//                 body_param.entry[0].changes[0].value.messages &&
//                 body_param.entry[0].changes[0].value.messages[0]
//             ) {
//                 let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
//                 let from = body_param.entry[0].changes[0].value.messages[0].from;

//                 await storeButtonResponse(phon_no_id, from, body_param);

//                 res.sendStatus(200);
//             } else {
//                 res.sendStatus(404);
//                 logToConsole("No messages found in the body param");
//             }
//         } else {
//             res.sendStatus(404);
//             logToConsole("Object not found in the body param");
//         }
//     } else {
//         res.status(405).send("Method Not Allowed");
//         logToConsole("Method Not Allowed");
//     }
// });

async function logToFirestore(logData) {
    try {
        // Ensure all required fields are defined
        if (!logData.phone_number_id || !logData.wa_id || !logData.message_id || !logData.timestamp || !logData.text_body) {
            console.error("Log data is missing required fields:", logData);
            return; // Exit if any required field is missing
        }

        await db.collection("webhook-logs").add({
            phone_number_id: logData.phone_number_id,
            wa_id: logData.wa_id,
            message_id: logData.message_id,
            timestamp: logData.timestamp,
            text_body: logData.text_body,
            timestampStored: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("Relevant log stored in Firestore:", logData);
    } catch (error) {
        console.error("Error storing log in Firestore:", error);
    }
}

const port = process.env.PORT || 3000;  // Use 3000 as a default if PORT is not set
app.listen(port, () => {
    console.log(`Webhook is listening on port ${port}`);
});

app.all("/webhook", async (req, res) => {
    if (req.method === "POST") {
        let body_param = req.body;

        if (
            body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0].text &&
            body_param.entry[0].changes[0].value.messages[0].text.body === "Yes, I'm Back & Safe"
        ) {
            const messageData = body_param.entry[0].changes[0].value.messages[0];

            const logData = {
                phone_number_id: body_param.entry[0].changes[0].value.metadata.phone_number_id,
                wa_id: messageData.from,
                message_id: messageData.id,
                timestamp: messageData.timestamp,
                text_body: messageData.text.body
            };

        
            await logToFirestore(logData);
        }

        res.sendStatus(200);
    } else {
        res.sendStatus(405).send("Method Not Allowed");
    }
});

app.get("/", (req, res) => {
    res.status(200).send("Hello, this is webhook setup");
    logToFile("Root route accessed");
});