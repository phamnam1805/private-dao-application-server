"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const DAO_json_1 = require("../resources/DAO.json");
const DAOManager_json_1 = require("../resources/DAOManager.json");
const FundManager_json_1 = require("../resources/FundManager.json");
const DKG_json_1 = require("../resources/DKG.json");
const constants_1 = require("../constants");
const helper_1 = __importDefault(require("../helper"));
const chainID = process.env.CHAIN_ID;
const daoRouter = express_1.default.Router();
daoRouter.post("/all", async (req, res) => {
    try {
        let provider = helper_1.default.getProvider();
        let fundManager = new ethers_1.ethers.Contract(constants_1.ADDRESSES[chainID]["FundManager"], FundManager_json_1.abi, provider);
        let daoManager = new ethers_1.ethers.Contract(constants_1.ADDRESSES[chainID]["DAOManager"], DAOManager_json_1.abi, provider);
        let counters = await Promise.all([
            daoManager.daoCounter(),
            fundManager.fundingRoundCounter(),
        ]);
        let daoCounter = Number(counters[0]);
        let fundingRoundCounter = Number(counters[1]);
        if (daoCounter > 0) {
            let daoAddressesPromise = await Promise.all([...Array(Number(daoCounter)).keys()].map((index) => daoManager.daos(index)));
            let fundingRoundsPromise = Promise.all([...Array(Number(fundingRoundCounter)).keys()].map(async (fundingRoundID) => {
                let fundingRoundState = Number(await fundManager.getFundingRoundState(fundingRoundID));
                if (fundingRoundState == 4) {
                    let rs = await Promise.all([
                        fundManager.fundingRounds(fundingRoundID),
                        fundManager.getListDAO(fundingRoundID),
                    ]);
                    return { requestID: rs[0][0], listDAO: rs[1] };
                }
                else
                    return undefined;
            }));
            let promiseResults = await Promise.all([
                daoAddressesPromise,
                fundingRoundsPromise,
            ]);
            let daoAddresses = promiseResults[0];
            let fundingRounds = promiseResults[1];
            let descriptionHashesPromise = Promise.all([...Array(Number(daoCounter)).keys()].map((index) => {
                let dao = new ethers_1.ethers.Contract(daoAddresses[index], DAO_json_1.abi, provider);
                return dao.descriptionHash();
            }));
            let fundingRoundResultsPromise = Promise.all(fundingRounds.map((fundingRound) => {
                if (fundingRound != undefined) {
                    return fundManager.getResult(fundingRound.requestID);
                }
                else {
                    return undefined;
                }
            }));
            promiseResults = await Promise.all([
                descriptionHashesPromise,
                fundingRoundResultsPromise,
            ]);
            let descriptionHashes = promiseResults[0];
            let fundingRoundResults = promiseResults[1];
            let data = [];
            let totalFunded = {};
            for (let i = 0; i < daoCounter; i++) {
                totalFunded[daoAddresses[i]] = 0n;
                data.push({
                    daoAddress: daoAddresses[i],
                    descriptionHash: descriptionHashes[i],
                    ipfsHash: helper_1.default.bytes32ToIpfsHash(descriptionHashes[i]),
                    totalFunded: 0n,
                });
            }
            for (let i = 0; i < fundingRounds.length; i++) {
                if (fundingRounds[i] != undefined) {
                    for (let j = 0; j < fundingRounds[i]?.listDAO.length; j++) {
                        totalFunded[fundingRounds[i]?.listDAO[j]] +=
                            fundingRoundResults[i][j];
                    }
                }
            }
            for (let i = 0; i < data.length; i++) {
                data[i].totalFunded = totalFunded[data[i].daoAddress];
            }
            BigInt.prototype.toJSON = function () {
                return this.toString();
            };
            res.send({ data: data });
        }
        else {
            res.send({ data: [] });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
daoRouter.post("/:daoID/proposals", async (req, res) => {
    try {
        let daoID = req.params.daoID;
        // console.log(daoID);
        let provider = helper_1.default.getProvider();
        let dao = new ethers_1.ethers.Contract(daoID, DAO_json_1.abi, provider);
        let proposalCounter = Number(await dao.proposalCounter());
        let proposalIDs = await Promise.all([...Array(proposalCounter).keys()].map((proposalIndex) => dao.proposalIDs(proposalIndex)));
        // console.log(proposalIDs);
        if (proposalIDs.length > 0) {
            let descriptionHashesPromise = Promise.all(proposalIDs.map((proposalID) => dao.descriptions(proposalID)));
            let statesPromise = Promise.all(proposalIDs.map((proposalID) => dao.state(proposalID)));
            let promiseResults = await Promise.all([
                descriptionHashesPromise,
                statesPromise,
            ]);
            // console.log(promiseResults);
            let data = [];
            for (let i = 0; i < proposalIDs.length; i++) {
                data.push({
                    proposalID: proposalIDs[i],
                    descriptionHash: promiseResults[0][i],
                    ipfsHash: helper_1.default.bytes32ToIpfsHash(promiseResults[0][i]),
                    state: promiseResults[1][i],
                });
            }
            BigInt.prototype.toJSON = function () {
                return this.toString();
            };
            res.send({ data: data });
        }
        else {
            res.send({ data: [] });
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
});
daoRouter.post("/:daoID/proposals/:proposalID", async (req, res) => {
    try {
        let daoID = req.params.daoID;
        let proposalID = req.params.proposalID;
        let provider = helper_1.default.getProvider();
        let dao = new ethers_1.ethers.Contract(daoID, DAO_json_1.abi, provider);
        let dkg = new ethers_1.ethers.Contract(constants_1.ADDRESSES[chainID]["DKG"], DKG_json_1.abi, provider);
        let daoConfigPromise = dao.config();
        let proposalPromise = dao.proposals(proposalID);
        let statePromise = dao.state(proposalID);
        let promiseResults = await Promise.all([
            daoConfigPromise,
            proposalPromise,
            statePromise,
        ]);
        let daoConfig = promiseResults[0];
        let proposal = promiseResults[1];
        let state = promiseResults[2];
        let requestID = proposal[0];
        let distributedKeyID = (await dao.requests(requestID)).distributedKeyID;
        let publicKey = await dkg.getPublicKey(distributedKeyID);
        let data = {
            daoConfig: {
                pendingPeriod: daoConfig[0],
                votingPeriod: daoConfig[1],
                tallyingPeriod: daoConfig[2],
                timelockPeriod: daoConfig[3],
                queuingPeriod: daoConfig[4],
            },
            requestID: requestID,
            proposalID: proposalID,
            forVotes: proposal.forVotes,
            againstVotes: proposal.againstVotes,
            abstainVotes: proposal.abstainVotes,
            startBlock: proposal.startBlock,
            canceled: proposal.canceled,
            executed: proposal.executed,
            eta: proposal.eta,
            distributedKey: {
                distributedKeyID: distributedKeyID,
                publicKey: {
                    x: publicKey[0],
                    y: publicKey[1],
                },
            },
            state: state,
        };
        BigInt.prototype.toJSON = function () {
            return this.toString();
        };
        res.send({ data: data });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
exports.default = daoRouter;
