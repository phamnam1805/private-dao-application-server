import { EventLog, ethers } from "ethers";
import sha256 from "sha256";
import { EventRegistryRepository } from "./repositories/event-registry";
import { EventRepository } from "./repositories/event";
import {
    ADDRESSES,
    EVENT_REGISTRIES,
    daoCreatedEventSignatureHash,
    leafInsertedEventSignatureHash,
    mappingChainIDToInfuraNetworkish,
    proposalCreatedEventSignatureHash,
} from "./constants";
import { MerkleLeafRepository } from "./repositories/merkle-leaf";
import Helper from "./helper";
import { Utils } from "distributed-key-generation";
import bigInt from "big-integer";
import { abi as fundManagerABI } from "./resources/FundManager.json";

namespace EventListener {
    export async function registerEvent(chainID: string) {
        let keys = Object.keys(EVENT_REGISTRIES);
        for (let i = 0; i < keys.length; i++) {
            let signature = EVENT_REGISTRIES[keys[i]].eventSignature;
            let signatureHash = EVENT_REGISTRIES[keys[i]].eventSignatureHash;
            let contractName = EVENT_REGISTRIES[keys[i]].contractName;

            if (ADDRESSES[chainID]) {
                let contractAddress = ADDRESSES[chainID][contractName];
                let eventRegistryID = sha256(
                    signatureHash +
                        "_" +
                        chainID +
                        "_" +
                        contractName +
                        "_" +
                        contractAddress
                );

                await EventRegistryRepository.create(
                    eventRegistryID,
                    signature,
                    signatureHash,
                    chainID.toString(),
                    contractName,
                    contractAddress
                );
            }
        }
    }

    export async function listenMerkleLeafInserted(
        chainID: string,
        rebuildMerkleLeafCollection: boolean = false
    ) {
        let provider = Helper.getProvider();
        let fundManager = new ethers.Contract(
            ADDRESSES[chainID]["FundManager"],
            fundManagerABI,
            provider
        );

        let signature = EVENT_REGISTRIES.MerkleLeafInserted.eventSignature;
        let signatureHash =
            EVENT_REGISTRIES.MerkleLeafInserted.eventSignatureHash;
        let contractName = EVENT_REGISTRIES.MerkleLeafInserted.contractName;
        let contractAddress = ADDRESSES[chainID][contractName];
        let eventRegistryID = sha256(
            signatureHash +
                "_" +
                chainID +
                "_" +
                contractName +
                "_" +
                contractAddress
        );

        let eventRegistry = await EventRegistryRepository.findByEventRegistryID(
            eventRegistryID
        );

        if (eventRegistry) {
            let eventFilter = {
                address: contractAddress,
                topics: [signatureHash],
            };

            if (rebuildMerkleLeafCollection) {
                let eventLogs = await fundManager.queryFilter([signatureHash]);
                await Promise.all(
                    eventLogs.map(async (eventLog: EventLog | ethers.Log) => {
                        let transactionHash = eventLog.transactionHash;
                        let blockNumber = eventLog.blockNumber.toString();
                        let topics = eventLog.topics;
                        await Promise.all([
                            EventRepository.create(
                                transactionHash,
                                eventRegistryID,
                                blockNumber,
                                topics as string[]
                            ),
                            MerkleLeafRepository.create(
                                transactionHash,
                                eventRegistryID,
                                bigInt(topics[1].slice(2), 16).toString(10),
                                bigInt(topics[2].slice(2), 16).toString(10)
                            ),
                        ]);
                    })
                );
            }

            provider.on(eventFilter, (log, event) => {
                // console.log(log);
                let transactionHash = log.transactionHash;
                let blockNumber = log.blockNumber;
                let topics = log.topics;

                EventRepository.create(
                    transactionHash,
                    eventRegistryID,
                    blockNumber,
                    topics
                );
                MerkleLeafRepository.create(
                    transactionHash,
                    eventRegistryID,
                    bigInt(topics[1].slice(2), 16).toString(10),
                    bigInt(topics[2].slice(2), 16).toString(10)
                );
            });
        }
    }
}

export default EventListener;
