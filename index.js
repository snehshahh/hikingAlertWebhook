const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const axios = require('axios'); // Import fs module to write logs to a file
require('dotenv').config();

// Initialize Firebase Admin SDK

// Initialize Firebase Admin SDK with environment variables
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
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(bodyParser.json());

// Root route to display a sample message
app.get('/', (req, res) => {
  res.send('Sample Testing Of User Whatsapp message');
});

app.post('/webhook', async (req, res) => {
  const payload = req.body;

  const userResponse = payload.entry[0].changes[0].value.messages[0].text.body;
  const johnMessage = payload.entry[0].changes[0].value.messages[1].text.body; 

  if (userResponse === 'Yes, I\'m Back & Safe') {
    await db.collection('TestResponse').add({
      userResponse: userResponse,
      johnMessage: johnMessage
    });

    fs.appendFileSync('webhook_logs.txt', `User Response: ${userResponse}, John Message: ${johnMessage}\n`);
  
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
