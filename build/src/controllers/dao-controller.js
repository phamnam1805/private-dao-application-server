"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const daoRouter = express_1.default.Router();
daoRouter.get("/all", async (req, res) => {
    let provider = new ethers_1.ethers.InfuraProvider(process.env.INFURA_NETWORKISH, process.env.INFURA_WEB3_API_KEY, process.env.INFURA_WEB3_API_SECRET_KEY);
    console.log(provider);
    res.send("OK");
});
exports.default = daoRouter;
