// server.js

const express = require('express');
const SocketServer = require('ws');
const uuidv1 = require('uuid/v1');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer.Server({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.


wss.on('connection', (ws) => {
  console.log('Client connected');

//****************************************************//
// Broadcast number of clients connected to Chatty app//
//****************************************************//
  let clientCount = wss.clients.size;

  wss.clients.forEach(function each(client) {
    client.send(clientCount);
  })

//***********************************//
// Broadcast messages to all clients //
//***********************************//

  ws.on('message', function incoming(message) {
    const uuid = uuidv1();
    let receivedMsg = JSON.parse(message);
    const newMessagesObject = {};
    switch(receivedMsg.type) {
      case "postMessage":
        newMessagesObject.type = "incomingMessage"
        newMessagesObject.id = uuidv1()
        newMessagesObject.username = receivedMsg.username
        newMessagesObject.content = receivedMsg.content
        break;
      case "postNotification":
        newMessagesObject.type = "incomingNotification"
        newMessagesObject.id = uuidv1()
        newMessagesObject.username = receivedMsg.username
        newMessagesObject.content = receivedMsg.content
      break;
    };
    
    wss.clients.forEach(function each(client) {
      if (client.readyState === SocketServer.OPEN) {
        client.send(JSON.stringify(newMessagesObject));
      }
    });

  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    let clientCount = wss.clients.size;
    wss.clients.forEach(function each(client) {
    client.send(clientCount);
    })
  });
});