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
import { Committee, Utils } from "distributed-key-generation";

const chainID = process.env.CHAIN_ID as string;

const committeeRouter = express.Router();

committeeRouter.post("/distributed-keys", async (req, res) => {
    try {
        let provider = Helper.getProvider();
        let dkg = new ethers.Contract(
            ADDRESSES[chainID]["DKG"],
            dkgABI,
            provider
        );
        let fundManager = new ethers.Contract(
            ADDRESSES[chainID]["FundManager"],
            fundManagerABI,
            provider
        );

        let distributedKeyCounter = Number(await dkg.distributedKeyCounter());

        let distributedKeysPromise = Promise.all(
            [...Array(distributedKeyCounter).keys()].map(
                (distributedKeyID: any) => dkg.distributedKeys(distributedKeyID)
            )
        );
        let distributedKeyStatesPromise = Promise.all(
            [...Array(distributedKeyCounter).keys()].map(
                (distributedKeyID: any) =>
                    dkg.getDistributedKeyState(distributedKeyID)
            )
        );

        let promiseResults: any = await Promise.all([
            distributedKeysPromise,
            distributedKeyStatesPromise,
            fundManager.getDKGParams(),
        ]);

        let distributedKeys = promiseResults[0];
        let distributedKeyStates = promiseResults[1];
        let t = Number(promiseResults[2][0]);
        let n = Number(promiseResults[2][1]);

        let round1DataSubmissionsPromise = Promise.all(
            [...Array(distributedKeyCounter).keys()].map(
                async (distributedKeyID: any) => {
                    if (distributedKeyStates[distributedKeyID] >= 1) {
                        return dkg.getRound1DataSubmissions(distributedKeyID);
                    } else {
                        return undefined;
                    }
                }
            )
        );

        let round2DataSubmissionsPromise = [
            ...Array(distributedKeyCounter).keys(),
        ].map((distributedKeyID: any) => {
            if (distributedKeyStates[distributedKeyID] >= 2) {
                return Promise.all(
                    [...Array(n).keys()].map((index: any) =>
                        dkg.getRound2DataSubmissions(
                            distributedKeyID,
                            index + 1
                        )
                    )
                );
            } else return undefined;
        });

        promiseResults = await Promise.all(
            round2DataSubmissionsPromise.concat(
                round1DataSubmissionsPromise,
                undefined
            )
        );
        let round1DataSubmissions = promiseResults[distributedKeyCounter];

        let data = [];
        for (
            let distributedKeyID = 0;
            distributedKeyID < distributedKeyCounter;
            distributedKeyID++
        ) {
            data.push({
                distributedKeyID: distributedKeyID,
                distributedKeyState: distributedKeyStates[distributedKeyID],
                distributedKeyType: distributedKeys[distributedKeyID][0],
                dimension: distributedKeys[distributedKeyID][1],
                round1Counter: distributedKeys[distributedKeyID][2],
                round2Counter: distributedKeys[distributedKeyID][3],
                verifier: distributedKeys[distributedKeyID][4],
                publicKeyX: distributedKeys[distributedKeyID][5],
                publicKeyY: distributedKeys[distributedKeyID][6],
                round1DataSubmissions: round1DataSubmissions[distributedKeyID]
                    ? round1DataSubmissions[distributedKeyID].map(
                          (round1DataSubmission: any) => {
                              return {
                                  senderAddress: round1DataSubmission[0],
                                  senderIndex: round1DataSubmission[1],
                                  x: round1DataSubmission[2],
                                  y: round1DataSubmission[3],
                              };
                          }
                      )
                    : [],
                round2DataSubmissions: promiseResults[distributedKeyID]
                    ? [...Array(n).keys()].map((index: number) => {
                          return {
                              recipientIndex: index + 1,
                              dataSubmissions: promiseResults[distributedKeyID][
                                  index
                              ].map((dataSubmission: any) => {
                                  return {
                                      senderIndex: dataSubmission[0],
                                      ciphers: dataSubmission[1],
                                  };
                              }),
                          };
                      })
                    : [],
            });
        }
        (BigInt.prototype as any).toJSON = function () {
            return this.toString();
        };
        res.send({ data: data });
    } catch (err) {
        res.status(500).send(err);
    }
});

committeeRouter.post("/distributed-key-requests", async (req, res) => {
    try {
        let provider = Helper.getProvider();

        let dkg = new ethers.Contract(
            ADDRESSES[chainID]["DKG"],
            dkgABI,
            provider
        );
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

        let fundingRounds = await Promise.all(
            [...Array(fundingRoundCounter).keys()].map((fundingRoundID: any) =>
                fundManager.fundingRounds(fundingRoundID)
            )
        );

        let requestIDs = fundingRounds.map((fundingRound: any) => {
            return fundingRound.requestID;
        });

        let results = await Promise.all(
            requestIDs.map((requestID: any) => {
                return fundManager.getResult(requestID);
            })
        );

        if (daoCounter > 0) {
            let daoAddresses = await Promise.all(
                [...Array(Number(daoCounter)).keys()].map((index: number) =>
                    daoManager.daos(index)
                )
            );
            let proposalCounters = await Promise.all(
                [...Array(Number(daoCounter)).keys()].map((index: number) => {
                    let dao = new ethers.Contract(
                        daoAddresses[index],
                        daoABI,
                        provider
                    );
                    return dao.proposalCounter();
                })
            );

            let listProposalIDs = await Promise.all(
                [...Array(daoCounter).keys()].map((index: any) => {
                    if (proposalCounters[index] > 0) {
                        return Promise.all(
                            [...Array(proposalCounters[index]).keys()].map(
                                (proposalIndex: any) => {
                                    let dao = new ethers.Contract(
                                        daoAddresses[index],
                                        daoABI,
                                        provider
                                    );
                                    return dao.proposalIDs(proposalIndex);
                                }
                            )
                        );
                    } else return undefined;
                })
            );

            let proposalsPromise = [];

            for (let daoIndex = 0; daoIndex < daoCounter; daoIndex++) {
                if (listProposalIDs[daoIndex] != undefined) {
                    let dao = new ethers.Contract(
                        daoAddresses[daoIndex],
                        daoABI,
                        provider
                    );

                    for (
                        let proposalIndex = 0;
                        proposalIndex < proposalCounters[daoIndex];
                        proposalIndex++
                    ) {
                        let proposalID = (listProposalIDs[daoIndex] as any)[
                            proposalIndex
                        ];
                        proposalsPromise.push(dao.proposals(proposalID));
                    }
                }
            }

            let proposals = await Promise.all(proposalsPromise);

            for (let i = 0; i < results.length; i++) {
                requestIDs = requestIDs.concat(proposals[i][0]);
            }
        }

        let tallyTrackersPromise = Promise.all(
            requestIDs.map((requestID: any) => {
                return dkg.tallyTrackers(requestID);
            })
        );

        let tallyTrackerStatesPromise = Promise.all(
            requestIDs.map((requestID: any) =>
                dkg.getTallyTrackerState(requestID)
            )
        );

        let rPromise = Promise.all(
            requestIDs.map((requestID: any) => dkg.getR(requestID))
        );

        let mPromise = Promise.all(
            requestIDs.map((requestID: any) => dkg.getM(requestID))
        );

        let promiseResults: any = await Promise.all([
            tallyTrackersPromise,
            tallyTrackerStatesPromise,
            rPromise,
            mPromise,
        ]);

        let tallyTrackers = promiseResults[0];
        let tallyTrackerStates = promiseResults[1];
        let r = promiseResults[2];
        let m = promiseResults[3];

        let listTallyDataSubmissions = await Promise.all(
            requestIDs.map((requestID: any) =>
                dkg.getTallyDataSubmissions(requestID)
            )
        );

        let data = [];
        for (let i = 0; i < requestIDs.length; i++) {
            let listIndex: number[] = [];
            let listDi: Array<Array<BigInt[]>> = [];
            let requestID = requestIDs[i];
            let tallyDataSubmissions = listTallyDataSubmissions[i].map(
                (tallyDataSubmission: any) => {
                    listIndex.push(Number(tallyDataSubmission[0]));
                    listDi.push(
                        tallyDataSubmission[1].map((di: any) =>
                            Utils.getBigIntArray(di)
                        )
                    );
                    return {
                        senderIndex: tallyDataSubmission[0],
                        Di: tallyDataSubmission[1],
                    };
                }
            );

            // let R = r[i].map((ri: any) => {
            //     return Utils.getBigIntArray(ri);
            // });
            let M = m[i].map((mi: any) => {
                return Utils.getBigIntArray(mi);
            });
            data.push({
                requestID: requestID,
                state: tallyTrackerStates[i],
                distributedKeyID: tallyTrackers[i][0],
                requester: tallyTrackers[i][3],
                contributionVerifier: tallyTrackers[i][4],
                resultVerifier: tallyTrackers[i][5],
                r: r[i],
                m: m[i],
                tallyCounter: tallyTrackers[i][1],
                resultSubmitted: tallyTrackers[i][2],
                tallyDataSubmissions: tallyDataSubmissions,
                resultVector:
                    tallyTrackerStates[i] >= 1
                        ? Committee.getResultVector(listIndex, listDi, M)
                        : [],
            });
        }

        (BigInt.prototype as any).toJSON = function () {
            return this.toString();
        };
        res.send({ data: data });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
});

committeeRouter.post("/brute-forces", async (req, res) => {
    try {
        let body = req.body;
        let temp = body.resultVector;
        let totalValue =
            body.totalValue == undefined ? BigInt(0) : BigInt(body.totalValue);
        if (temp == undefined) {
            throw Error("Wrong data format");
        }
        let resultVector: Array<BigInt[]> = temp.map((tmp: any) =>
            Utils.getBigIntArray(tmp)
        );

        let result = Helper.bruteForcesResultVector(resultVector, totalValue);
        (BigInt.prototype as any).toJSON = function () {
            return this.toString();
        };
        res.send({ data: { result: result } });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
export default committeeRouter;
