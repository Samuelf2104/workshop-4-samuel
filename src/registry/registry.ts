import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string; privateKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
  privateKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const app = express();
  app.use(express.json());

  let nodeList: Node[] = [];

  // Status route
  app.get("/status", (_request: Request, _response: Response) => {
    _response.send("active");
  });

  app.post("/registerNode", (_req, _res) => {
    try {
      const newRegistryNode: Node = _req.body;
      nodeList.push(newRegistryNode);
      _res.sendStatus(201);
    } catch (error) {
      _res.sendStatus(500);
    }
  });

  app.get("/getPrivateKey", (_req, _res) => {
    const nodeIdQuery = _req.query.id;
    const foundNode = nodeList.find((eachNode) => eachNode.nodeId === nodeIdQuery);
    if (foundNode) {
      _res.send({privateKey: foundNode.privateKey});
    } else {
      _res.sendStatus(404);
    }
  });

  app.get("/getNodeRegistry", (_req, _res) => {
    _res.json({nodes: nodeList});
  });

  return app.listen(REGISTRY_PORT, () => {
    console.log(`Registry service active on port ${REGISTRY_PORT}`);
  });
}
