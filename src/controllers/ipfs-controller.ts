import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import Helper from "../helper";

const ipfsRouter = express.Router();

ipfsRouter.post("/upload", async (req, res) => {
    try {
        let data: string = JSON.stringify(req.body);
        // console.log(data);
        let formData = new FormData();
        formData.append("file", data);
        let requestURL = process.env.INFURA_IPFS_ENDPOINT + "/add";
        let auth =
            "Basic " +
            btoa(
                process.env.INFURA_IPFS_API_KEY +
                    ":" +
                    process.env.INFURA_IPFS_API_SECRET_KEY
            );
        let response = await axios.post(requestURL, formData, {
            headers: {
                Authorization: auth,
            },
        });
        res.send({
            ipfsHash: response.data.Hash,
            descriptionHash: Helper.ipfsHashToBytes32(response.data.Hash),
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

export default ipfsRouter;
