import { simpleOnionRouter } from "./simpleOnionRouter";
import { REGISTRY_PORT } from "../config";

export async function launchOnionRouters(n: number)
{

  const promises = [];

  // launch an n onion routers
  for (let index = 0; index < n; index++)
  {
    const newRouter = simpleOnionRouter(index);
    promises.push(newRouter);
  }

  return await Promise.all(promises);
}
