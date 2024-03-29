import * as dotenv from "dotenv";
dotenv.config();
import { app } from "./src/app";
import EventListener from "./src/event-listener";
import mongooseConnection from "./src/repositories";

const host: string = process.env.APPLICATION_SERVER_HOST || "127.0.0.1";
const port: number = Number(process.env.PORT || 3000);
const chainID = process.env.CHAIN_ID as string;

app.listen(port, host, async () => {
    EventListener.registerEvent(chainID).then(() => {
        EventListener.listenMerkleLeafInserted(chainID, false);
    });
    console.log(
        `Private-DAO application server listening at ${host}:${port}`
    );
});
