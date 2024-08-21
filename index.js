const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const admin = require('firebase-admin');
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure the key is formatted correctly
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

const mytoken = "32D721YWSetkhiID5j5yqxICLo8MmDgm"; // Replace with your unique verify token

app.listen(process.env.PORT, () => {
    console.log("Webhook is listening");
});

// Handle both GET and POST requests at the /webhook endpoint
app.all("/webhook", async (req, res) => {
  if (req.method === "GET") {
      // Handle the GET request (for verification)
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
  } else if (req.method === "POST") {
      // Handle the POST request (for webhook processing)
      let body_param = req.body;

      console.log(JSON.stringify(body_param, null, 2));

      if (body_param.object) {
          console.log("Inside body param");
          if (
              body_param.entry &&
              body_param.entry[0].changes &&
              body_param.entry[0].changes[0].value.messages &&
              body_param.entry[0].changes[0].value.messages[0]
          ) {
              let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
              let from = body_param.entry[0].changes[0].value.messages[0].from;

              // Store the entire object in Firestore
              await storeButtonResponse(phon_no_id, from, body_param);

              res.sendStatus(200);
          } else {
              res.sendStatus(404);
          }
      } else {
          res.sendStatus(404);
      }
  } else {
      res.status(405).send("Method Not Allowed");
  }
});

async function storeButtonResponse(phoneNumberId, senderNumber, body_param) {
  try {
      await db.collection("whatsapp-button-responses").add({
          phoneNumberId,
          from: senderNumber,
          body_param,  // Store the entire object
          timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("Webhook data stored in Firestore.");
  } catch (error) {
      console.error("Error storing webhook data in Firestore:", error);
  }
}


// Root route
app.get("/", (req, res) => {
    res.status(200).send("Hello, this is webhook setup");
});
