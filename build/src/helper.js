"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const chainID = process.env.CHAIN_ID;
var Helper;
(function (Helper) {
    function getProvider() {
        if (chainID == "31337") {
            let provider = new ethers_1.ethers.JsonRpcProvider("http://127.0.0.1:8545/");
            return provider;
        }
        else {
            let provider = new ethers_1.ethers.InfuraProvider(constants_1.mappingChainIDToInfuraNetworkish[chainID], process.env.INFURA_WEB3_API_KEY, process.env.INFURA_WEB3_API_SECRET_KEY);
            return provider;
        }
    }
    Helper.getProvider = getProvider;
    function ipfsHashToBytes32(ipfsHash) {
        let decodedBase58 = ethers_1.ethers.decodeBase58(ipfsHash).toString(16).slice(4);
        return "0x" + decodedBase58;
    }
    Helper.ipfsHashToBytes32 = ipfsHashToBytes32;
    function bytes32ToIpfsHash(bytes32) {
        console.log(bytes32);
        bytes32 = "1220" + bytes32.slice(2);
        let temp = bytes32.match(/.{1,2}/g);
        let preparedArray = new Uint8Array(temp.length);
        for (let i = 0; i < temp.length; i++) {
            preparedArray[i] = parseInt(temp[i], 16);
        }
        let encodedBase58 = ethers_1.ethers.encodeBase58(preparedArray);
        return encodedBase58;
    }
    Helper.bytes32ToIpfsHash = bytes32ToIpfsHash;
})(Helper || (Helper = {}));
exports.default = Helper;
