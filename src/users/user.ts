import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";
import { Node } from "../registry/registry";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function createUserInstance(userIdentifier: number) {
  const userApp = express();
  userApp.use(express.json());

  let recentReceivedMsg: any = null;
  let recentSentMsg: any = null;
  let recentNodeCircuit: Node[] = [];

  // Status route implementation
  userApp.get("/status", (request, response) => {
    response.send("alive");
  });

  // Fetch the last received message
  userApp.get("/getLastReceivedMessage", (request, response) => {
    response.json({ result: recentReceivedMsg });
  });

  // Fetch the last sent message
  userApp.get("/getLastSentMessage", (request, response) => {
    response.json({ result: recentSentMsg });
  });

  // Fetch the last circuit used
  userApp.get("/getLastCircuit", (request, response) => {
    response.status(200).json({ result: recentNodeCircuit.map(node => node.nodeId) });
  });

  // Receive a message
  userApp.post("/message", (request, response) => {
    const { message } = request.body;
    recentReceivedMsg = message;
    response.status(200).send("Message received successfully");
  });

  // Route for sending a message
  userApp.post("/sendMessage", (request, response) => {
    const { messageContent, targetUserId }: SendMessageRequest = request.body;
    // Example TODO: Implement message sending logic here
    recentSentMsg = messageContent;
    // Simulating sending message by updating the last sent message
    response.status(200).send(`Message to user ${targetUserId} was queued for sending.`);
  });

  return userApp.listen(BASE_USER_PORT + userIdentifier, () => {
    console.log(`User service for ID ${userIdentifier} active at port ${BASE_USER_PORT + userIdentifier}`);
  });
}
