"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helper_1 = __importDefault(require("../helper"));
const ethers_1 = require("ethers");
const FundManager_json_1 = require("../resources/FundManager.json");
const Queue_json_1 = require("../resources/Queue.json");
const merkle_leaf_1 = require("../repositories/merkle-leaf");
const constants_1 = require("../constants");
const chainID = process.env.CHAIN_ID;
const investmentRouter = express_1.default.Router();
investmentRouter.post("/paths", async (req, res) => {
    try {
        let data = await merkle_leaf_1.MerkleLeafRepository.buildMerkleTree();
        BigInt.prototype.toJSON = function () {
            return this.toString();
        };
        res.send({ data: data });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
investmentRouter.post("/funding-rounds", async (req, res) => {
    try {
        let provider = helper_1.default.getProvider();
        let fundManager = new ethers_1.ethers.Contract(constants_1.ADDRESSES[chainID]["FundManager"], FundManager_json_1.abi, provider);
        let fundingRoundQueueContract = new ethers_1.ethers.Contract(constants_1.ADDRESSES[chainID]["Queue"], Queue_json_1.abi, provider);
        let fundingRoundCounter = Number(await fundManager.fundingRoundCounter());
        let data = {
            currentFundingRound: {},
            oldFundingRounds: [],
            fundingRoundConfig: {},
            fundingRoundQueue: {},
        };
        if (fundingRoundCounter > 0) {
            let lastFundingRoundID = fundingRoundCounter - 1;
            let fundingRoundsPromise = Promise.all([...Array(fundingRoundCounter).keys()].map((fundingRoundID) => fundManager.fundingRounds(fundingRoundID)));
            let fundingRoundStatesPromise = Promise.all([...Array(fundingRoundCounter).keys()].map((fundingRoundID) => fundManager.getFundingRoundState(fundingRoundID)));
            let fundingRoundListDAOsPromise = Promise.all([...Array(fundingRoundCounter).keys()].map((fundingRoundID) => fundManager.getListDAO(fundingRoundID)));
            let fundingRoundConfigPromise = fundManager.config();
            let fundingRoundQueuePromise = fundingRoundQueueContract.getQueue();
            let promiseResults = await Promise.all([
                fundingRoundsPromise,
                fundingRoundStatesPromise,
                fundingRoundListDAOsPromise,
                fundingRoundConfigPromise,
                fundingRoundQueuePromise,
            ]);
            let fundingRounds = promiseResults[0];
            let fundingRoundStates = promiseResults[1];
            let fundingRoundListDAOs = promiseResults[2];
            let fundingRoundConfig = promiseResults[3];
            let fundingRoundQueue = promiseResults[4];
            data.fundingRoundConfig = {
                pendingPeriod: fundingRoundConfig.pendingPeriod,
                activePeriod: fundingRoundConfig.activePeriod,
                tallyPeriod: fundingRoundConfig.tallyPeriod,
            };
            data.fundingRoundQueue = fundingRoundQueue;
            let fundingRoundKeys = await Promise.all(fundingRounds.map((fundingRound) => fundManager.getDistributedKeyID(fundingRound.requestID)));
            let fundingRoundResults = await Promise.all(fundingRounds.map((fundingRound) => fundManager.getResult(fundingRound.requestID)));
            for (let i = 0; i < fundingRoundCounter - 1; i++) {
                data.oldFundingRounds.push({
                    fundingRoundID: i,
                    state: fundingRoundStates[i],
                    listDAO: fundingRoundListDAOs[i],
                    result: fundingRoundResults[i],
                    totalFunded: fundingRounds[i].balance,
                    launchedAt: fundingRounds[i].launchedAt,
                    finalizedAt: fundingRounds[i].finalizedAt,
                    failedAt: fundingRounds[i].failedAt,
                    keyID: fundingRoundKeys[i],
                });
            }
            if (fundingRoundStates[lastFundingRoundID] < 4n) {
                data.currentFundingRound = {
                    fundingRoundID: lastFundingRoundID,
                    state: fundingRoundStates[lastFundingRoundID],
                    listDAO: fundingRoundListDAOs[lastFundingRoundID],
                    result: fundingRoundResults[lastFundingRoundID],
                    totalFunded: fundingRounds[lastFundingRoundID].balance,
                    launchedAt: fundingRounds[lastFundingRoundID].launchedAt,
                    finalizedAt: fundingRounds[lastFundingRoundID].finalizedAt,
                    failedAt: fundingRounds[lastFundingRoundID].failedAt,
                    keyID: fundingRoundKeys[lastFundingRoundID],
                };
            }
            else {
                data.oldFundingRounds.push({
                    fundingRoundID: lastFundingRoundID,
                    state: fundingRoundStates[lastFundingRoundID],
                    listDAO: fundingRoundListDAOs[lastFundingRoundID],
                    result: fundingRoundResults[lastFundingRoundID],
                    totalFunded: fundingRounds[lastFundingRoundID].balance,
                    launchedAt: fundingRounds[lastFundingRoundID].launchedAt,
                    finalizedAt: fundingRounds[lastFundingRoundID].finalizedAt,
                    failedAt: fundingRounds[lastFundingRoundID].failedAt,
                    keyID: fundingRoundKeys[lastFundingRoundID],
                });
            }
        }
        else {
            let fundingRoundConfigPromise = fundManager.config();
            let fundingRoundQueuePromise = fundingRoundQueueContract.getQueue();
            let promiseResults = await Promise.all([
                fundingRoundConfigPromise,
                fundingRoundQueuePromise,
            ]);
            let fundingRoundConfig = promiseResults[0];
            let fundingRoundQueue = promiseResults[1];
            data.fundingRoundConfig = {
                pendingPeriod: fundingRoundConfig.pendingPeriod,
                activePeriod: fundingRoundConfig.activePeriod,
                tallyPeriod: fundingRoundConfig.tallyPeriod,
            };
            data.fundingRoundQueue = fundingRoundQueue;
        }
        BigInt.prototype.toJSON = function () {
            return this.toString();
        };
        res.send({ data: data });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.default = investmentRouter;
