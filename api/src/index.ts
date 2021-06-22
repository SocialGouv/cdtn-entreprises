import Koa from "koa";
import cors from "@koa/cors";

import { router } from "./routes";
import { ELASTICSEARCH_URL } from "./elastic";

export const app = new Koa();

app.use(cors());

const port = process.env.API_PORT || 3000;

app.use(router.routes());
app.listen(port);

console.log(`API started on port ${port}`);
console.log("ES host:", ELASTICSEARCH_URL);
