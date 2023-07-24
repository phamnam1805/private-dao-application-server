"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const ipfsRouter = express_1.default.Router();
ipfsRouter.post("/upload", async (req, res) => {
    try {
        let data = JSON.stringify(req.body);
        console.log(data);
        let formData = new form_data_1.default();
        formData.append("file", data);
        let requestURL = process.env.INFURA_IPFS_ENDPOINT + "/add";
        let auth = "Basic " +
            btoa(process.env.INFURA_IPFS_API_KEY +
                ":" +
                process.env.INFURA_IPFS_API_SECRET_KEY);
        let response = await axios_1.default.post(requestURL, formData, {
            headers: {
                Authorization: auth,
            },
        });
        res.send({
            hash: response.data.Hash,
        });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.default = ipfsRouter;
