import bodyParser from "body-parser";
import express from "express";
import {exportPrvKey, exportPubKey, generateRsaKeyPair, importPrvKey, rsaDecrypt, symDecrypt} from "../crypto";
import {BASE_ONION_ROUTER_PORT, REGISTRY_PORT} from "../config";

export async function simpleOnionRouter(routerId) {
  const routerApp = express();

  const keys = await generateRsaKeyPair();
  const pubKey = await exportPubKey(keys.publicKey);
  const secKey = await exportPrvKey(keys.privateKey);

  routerApp.use(express.json());
  routerApp.use(bodyParser.json());

  let encryptedMsgCache = null;
  let decryptedMsgCache = null;
  let msgDestinationCache = null;

  // Status check endpoint
  routerApp.get("/status", (request, response) => {
    response.status(200).send("live");
  });

  routerApp.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({encryptedMessage: encryptedMsgCache});
  });

  routerApp.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({decryptedMessage: decryptedMsgCache});
  });

  routerApp.get("/getLastMessageDestination", (req, res) => {
    res.json({destination: msgDestinationCache});
  });

  routerApp.get("/getPrivateKey", (req, res) => {
    res.json({ secretKey: secKey });
  });

  // Node registration
  await fetch(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    method: "POST",
    body: JSON.stringify({ routerId, publicKey: pubKey, privateKey: secKey }),
    headers: { "Content-Type": "application/json" },
  });

  return routerApp.listen(BASE_ONION_ROUTER_PORT + routerId, () => {
    console.log(`Router ${routerId} active on port ${BASE_ONION_ROUTER_PORT + routerId}`);
  });
}
