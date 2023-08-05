import express, { json, urlencoded, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import ipfsRouter from "./controllers/ipfs-controller";
import daoRouter from "./controllers/dao-controller";
import investmentRouter from "./controllers/investment-controller";
import bigInt from "big-integer";
import committeeRouter from "./controllers/committee-controller";
import { ADDRESSES } from "./constants";

const chainID = process.env.CHAIN_ID as string;
const ipfsGateway = process.env.IPFS_GATEWAY as string;

export const app = express();

app.use(morgan("combined"));
app.use(cors());
app.use(
    urlencoded({
        extended: true,
    })
);
app.use(json());

app.use("/ipfs", ipfsRouter);
app.use("/dao", daoRouter);
app.use("/investment", investmentRouter);
app.use("/committee", committeeRouter);
app.use("/", (req, res) => {
    res.send({
        message: "Hello world!",
        data: {
            chainID: chainID,
            ipfsGateway: ipfsGateway,
            contractAddresses: ADDRESSES[chainID],
        },
    });
});
