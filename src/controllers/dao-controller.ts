import express from "express";
import { ethers, sha256 } from "ethers";
import { abi as daoABI } from "../resources/DAO.json";
import { abi as daoManagerABI } from "../resources/DAOManager.json";
import { abi as fundManagerABI } from "../resources/FundManager.json";
import { abi as dkgABI } from "../resources/DKG.json";
import {
    ADDRESSES,
    EVENT_REGISTRIES,
    mappingChainIDToInfuraNetworkish,
} from "../constants";
import Helper from "../helper";

const chainID = process.env.CHAIN_ID as string;

const daoRouter = express.Router();

daoRouter.post("/all", async (req, res) => {
    try {
        let provider = Helper.getProvider();

        let fundManager = new ethers.Contract(
            ADDRESSES[chainID]["FundManager"],
            fundManagerABI,
            provider
        );
        let daoManager = new ethers.Contract(
            ADDRESSES[chainID]["DAOManager"],
            daoManagerABI,
            provider
        );

        let counters = await Promise.all([
            daoManager.daoCounter(),
            fundManager.fundingRoundCounter(),
        ]);
        let daoCounter = Number(counters[0]);
        let fundingRoundCounter = Number(counters[1]);
        if (daoCounter > 0) {
            let daoAddressesPromise = Promise.all(
                [...Array(Number(daoCounter)).keys()].map((index: number) =>
                    daoManager.daos(index)
                )
            );

            let fundingRoundsPromise = Promise.all(
                [...Array(Number(fundingRoundCounter)).keys()].map(
                    async (fundingRoundID: number) => {
                        let fundingRoundState = Number(
                            await fundManager.getFundingRoundState(
                                fundingRoundID
                            )
                        );
                        if (fundingRoundState == 4) {
                            let rs = await Promise.all([
                                fundManager.fundingRounds(fundingRoundID),
                                fundManager.getListDAO(fundingRoundID),
                            ]);
                            return { requestID: rs[0][0], listDAO: rs[1] };
                        } else return undefined;
                    }
                )
            );

            let promiseResults: any = await Promise.all([
                daoAddressesPromise,
                fundingRoundsPromise,
            ]);
            let daoAddresses = promiseResults[0];
            let fundingRounds = promiseResults[1];

            let descriptionHashesPromise = Promise.all(
                [...Array(Number(daoCounter)).keys()].map((index: number) => {
                    let dao = new ethers.Contract(
                        daoAddresses[index],
                        daoABI,
                        provider
                    );
                    return dao.descriptionHash();
                })
            );

            let fundingRoundResultsPromise = Promise.all(
                fundingRounds.map((fundingRound: any) => {
                    if (fundingRound != undefined) {
                        return fundManager.getResult(fundingRound.requestID);
                    } else {
                        return undefined;
                    }
                })
            );

            promiseResults = await Promise.all([
                descriptionHashesPromise,
                fundingRoundResultsPromise,
            ]);
            let descriptionHashes = promiseResults[0];
            let fundingRoundResults = promiseResults[1];

            let data = [];
            let totalFunded: any = {};
            for (let i = 0; i < daoCounter; i++) {
                totalFunded[daoAddresses[i]] = 0n;
                data.push({
                    daoAddress: daoAddresses[i],
                    descriptionHash: descriptionHashes[i],
                    ipfsHash: Helper.bytes32ToIpfsHash(descriptionHashes[i]),
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

            (BigInt.prototype as any).toJSON = function () {
                return this.toString();
            };
            res.send({ data: data });
        } else {
            res.send({ data: [] });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

daoRouter.post("/:daoID/proposals", async (req, res) => {
    try {
        let daoID = req.params.daoID;
        // console.log(daoID);
        let provider = Helper.getProvider();
        let dao = new ethers.Contract(daoID, daoABI, provider);
        let proposalCounter = Number(await dao.proposalCounter());
        let proposalIDs = await Promise.all(
            [...Array(proposalCounter).keys()].map((proposalIndex: any) =>
                dao.proposalIDs(proposalIndex)
            )
        );
        // console.log(proposalIDs);
        if (proposalIDs.length > 0) {
            let descriptionHashesPromise = Promise.all(
                proposalIDs.map((proposalID: any) =>
                    dao.descriptions(proposalID)
                )
            );

            let statesPromise = Promise.all(
                proposalIDs.map((proposalID: any) => dao.state(proposalID))
            );

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
                    ipfsHash: Helper.bytes32ToIpfsHash(promiseResults[0][i]),
                    state: promiseResults[1][i],
                });
            }
            (BigInt.prototype as any).toJSON = function () {
                return this.toString();
            };
            res.send({ data: data });
        } else {
            res.send({ data: [] });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

daoRouter.post("/:daoID/proposals/:proposalID", async (req, res) => {
    try {
        let daoID = req.params.daoID;
        let proposalID = req.params.proposalID;

        let provider = Helper.getProvider();
        let dao = new ethers.Contract(daoID, daoABI, provider);
        let dkg = new ethers.Contract(
            ADDRESSES[chainID]["DKG"],
            dkgABI,
            provider
        );

        let daoConfigPromise = dao.config();
        let proposalPromise = dao.proposals(proposalID);
        let statePromise = dao.state(proposalID);

        let promiseResults: any = await Promise.all([
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
        (BigInt.prototype as any).toJSON = function () {
            return this.toString();
        };
        res.send({ data: data });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
});

export default daoRouter;
