import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import Helper from "../helper";
import { ethers, sha256 } from "ethers";
import { abi as fundManagerABI } from "../resources/FundManager.json";
import { abi as fundingRoundQueueABI } from "../resources/Queue.json";
import { MerkleLeafRepository } from "../repositories/merkle-leaf";
import { ADDRESSES } from "../constants";

const chainID = process.env.CHAIN_ID as string;

const investmentRouter = express.Router();

investmentRouter.post("/paths", async (req, res) => {
    try {
        let data = await MerkleLeafRepository.buildMerkleTree();
        (BigInt.prototype as any).toJSON = function () {
            return this.toString();
        };
        res.send({ data: data });
    } catch (err) {
        res.status(500).send(err);
    }
});

investmentRouter.post("/funding-rounds", async (req, res) => {
    try {
        let provider = Helper.getProvider();
        let fundManager = new ethers.Contract(
            ADDRESSES[chainID]["FundManager"],
            fundManagerABI,
            provider
        );
        let fundingRoundQueueContract = new ethers.Contract(
            ADDRESSES[chainID]["Queue"],
            fundingRoundQueueABI,
            provider
        );
        let fundingRoundCounter = Number(
            await fundManager.fundingRoundCounter()
        );
        let data: {
            currentFundingRound: {};
            oldFundingRounds: any[];
            fundingRoundConfig: {};
            fundingRoundQueue: {};
        } = {
            currentFundingRound: {},
            oldFundingRounds: [],
            fundingRoundConfig: {},
            fundingRoundQueue: {},
        };
        if (fundingRoundCounter > 0) {
            let lastFundingRoundID = fundingRoundCounter - 1;
            let fundingRoundsPromise = Promise.all(
                [...Array(fundingRoundCounter).keys()].map(
                    (fundingRoundID: any) =>
                        fundManager.fundingRounds(fundingRoundID)
                )
            );

            let fundingRoundStatesPromise = Promise.all(
                [...Array(fundingRoundCounter).keys()].map(
                    (fundingRoundID: any) =>
                        fundManager.getFundingRoundState(fundingRoundID)
                )
            );

            let fundingRoundListDAOsPromise = Promise.all(
                [...Array(fundingRoundCounter).keys()].map(
                    (fundingRoundID: any) =>
                        fundManager.getListDAO(fundingRoundID)
                )
            );

            let fundingRoundConfigPromise = fundManager.config();

            let fundingRoundQueuePromise = fundingRoundQueueContract.getQueue();

            let promiseResults: any = await Promise.all([
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

            let fundingRoundResults = await Promise.all(
                fundingRounds.map((fundingRound: any) =>
                    fundManager.getResult(fundingRound.requestID)
                )
            );
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
                };
            } else {
                data.oldFundingRounds.push({
                    fundingRoundID: lastFundingRoundID,
                    state: fundingRoundStates[lastFundingRoundID],
                    listDAO: fundingRoundListDAOs[lastFundingRoundID],
                    result: fundingRoundResults[lastFundingRoundID],
                    totalFunded: fundingRounds[lastFundingRoundID].balance,
                    launchedAt: fundingRounds[lastFundingRoundID].launchedAt,
                    finalizedAt: fundingRounds[lastFundingRoundID].finalizedAt,
                    failedAt: fundingRounds[lastFundingRoundID].failedAt,
                });
            }
        } else {
            let fundingRoundConfigPromise = fundManager.config();
            let fundingRoundQueuePromise = fundingRoundQueueContract.getQueue();
            let promiseResults: any = await Promise.all([
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
        (BigInt.prototype as any).toJSON = function () {
            return this.toString();
        };
        res.send({ data: data });
    } catch (err) {
        res.status(500).send(err);
    }
});

export default investmentRouter;
