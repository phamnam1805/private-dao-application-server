import * as dotenv from "dotenv";
dotenv.config();
import { app } from "./src/app";
import EventListener from "./src/event-listener";
import mongooseConnection from "./src/repositories";

const port = process.env.PORT || 3000;
const chainID = process.env.CHAIN_ID as string;

app.listen(port, async () => {
    EventListener.registerEvent(chainID).then(() => {
        EventListener.listenMerkleLeafInserted(chainID, true);
    });
    console.log(
        `Private-DAO application server listening at http://localhost:${port}`
    );
});
