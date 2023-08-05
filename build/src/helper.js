"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const distributed_key_generation_1 = require("distributed-key-generation");
const big_integer_1 = __importDefault(require("big-integer"));
const chainID = process.env.CHAIN_ID;
const minimalUnit = (0, big_integer_1.default)(Number(process.env.MINIMAL_UNIT || 10000000000000000n));
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
        // console.log(bytes32);
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
    function bruteForcesResultVector(resultVector, totalValue = BigInt(0)) {
        let dim = resultVector.length;
        let results = [...Array(dim).keys()].map((index) => (0, big_integer_1.default)(0));
        if (totalValue == 0n) {
            let counters = [...Array(dim).keys()].map((index) => (0, big_integer_1.default)(0));
            for (let i = 0; i < dim; i++) {
                let found = false;
                let targetPoint = distributed_key_generation_1.Utils.getBigIntegerArray(resultVector[i]);
                while (!found) {
                    found = comparePoint(targetPoint, distributed_key_generation_1.BabyJub.mulPointBaseScalar(counters[i].multiply(minimalUnit)));
                    if (found) {
                        results[i] = counters[i];
                    }
                    counters[i] = counters[i].plus(1);
                }
            }
        }
        else {
            let counters = [...Array(dim).keys()].map((index) => (0, big_integer_1.default)(0));
            let remain = distributed_key_generation_1.Utils.getBigInteger(totalValue);
            for (let i = 0; i < dim - 1; i++) {
                let found = false;
                let targetPoint = distributed_key_generation_1.Utils.getBigIntegerArray(resultVector[i]);
                while (!found) {
                    found = comparePoint(targetPoint, distributed_key_generation_1.BabyJub.mulPointBaseScalar(counters[i].multiply(minimalUnit)));
                    if (found) {
                        results[i] = counters[i];
                        remain = remain.subtract(results[i]);
                    }
                    counters[i] = counters[i].plus(1);
                }
            }
            results[dim - 1] = remain;
        }
        return distributed_key_generation_1.Utils.getBigIntArray(results);
    }
    Helper.bruteForcesResultVector = bruteForcesResultVector;
    function comparePoint(a, b) {
        if (a.length != b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!a[i].eq(b[i])) {
                return false;
            }
        }
        return true;
    }
    function compareVector(a, b) {
        if (a.length != b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!a[i][0].eq(b[i][0]) || !a[i][1].eq(b[i][1])) {
                return false;
            }
        }
        return true;
    }
})(Helper || (Helper = {}));
exports.default = Helper;
