const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express().use(body_parser.json());

const mytoken = process.env.MYTOKEN; // Replace with your unique verify token

app.listen(process.env.PORT, () => {
    console.log("webhook is listening");
});

// to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(403).send("Forbidden");
        }
    } else {
        res.status(400).send("Bad Request");
    }
});

app.post("/webhook", async (req, res) => {
    let body_param = req.body;

    console.log(JSON.stringify(body_param, null, 2));

    if (body_param.object) {
        console.log("inside body param");
        if (
            body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]
        ) {
            let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;

            // Check if the message is a button response
            if (body_param.entry[0].changes[0].value.messages[0].interactive) {
                let buttonResponse = body_param.entry[0].changes[0].value.messages[0].interactive.button_reply.title;

                console.log("phone number " + phon_no_id);
                console.log("from " + from);
                console.log("button response " + buttonResponse);

                // Store the button response in Firestore
                await storeButtonResponse(phon_no_id, from, buttonResponse);

                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        } else {
            res.sendStatus(404);
        }
    }
});

async function storeButtonResponse(phoneNumberId, senderNumber, buttonResponse) {
    try {
        await db.collection("whatsapp-button-responses").add({
            phoneNumberId,
            from: senderNumber,
            buttonResponse,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("Button response stored in Firestore.");
    } catch (error) {
        console.error("Error storing button response in Firestore:", error);
    }
}

app.get("/", (req, res) => {
    res.status(200).send("hello this is webhook setup");
});