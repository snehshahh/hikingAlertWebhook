const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./hikingalert-260bf-firebase-adminsdk-8rkbb-24973cba1e.json');

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
  const body = req.body;

  // Extract the sender ID, original message, and user response
  const senderId = body.sender.id;
  const originalMessage = body.message.text;
  const userResponse = body.message.text;

  try {
    // Add the response to the Firestore collection
    await db.collection('TestResponse').add({
      SenderID: senderId,
      OriginalMessage: originalMessage,
      UserResponse: userResponse,
    });

    // Log the question and the answer
    console.log(`Sender ID: ${senderId}`);
    console.log(`Original Message: ${originalMessage}`);
    console.log(`User Response: ${userResponse}`);

    // Send a response to acknowledge the receipt of the message
    res.sendStatus(200);
  } catch (error) {
    console.error('Error writing to Firestore:', error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
