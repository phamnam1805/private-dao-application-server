"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const sha256_1 = __importDefault(require("sha256"));
const event_registry_1 = require("./repositories/event-registry");
const event_1 = require("./repositories/event");
const dao_1 = require("./repositories/dao");
const constants_1 = require("./constants");
const proposal_1 = require("./repositories/proposal");
const merkle_leaf_1 = require("./repositories/merkle-leaf");
var EventListener;
(function (EventListener) {
    async function registerEvent(chainID) {
        for (let i = 0; i < constants_1.EVENT_REGISTRIES.length; i++) {
            let signature = constants_1.EVENT_REGISTRIES[i].eventSignature;
            let signatureHash = constants_1.EVENT_REGISTRIES[i].eventSignatureHash;
            let contractName = constants_1.EVENT_REGISTRIES[i].contractName;
            if (constants_1.ADDRESSES[chainID]) {
                let contractAddress = constants_1.ADDRESSES[chainID][contractName];
                let eventRegistryID = (0, sha256_1.default)(signatureHash +
                    "_" +
                    chainID +
                    "_" +
                    contractName +
                    "_" +
                    contractAddress);
                await event_registry_1.EventRegistryRepository.create(eventRegistryID, signature, signatureHash, chainID.toString(), contractName, contractAddress);
            }
        }
    }
    EventListener.registerEvent = registerEvent;
    async function startListen(chainID) {
        let provider = new ethers_1.ethers.InfuraProvider(constants_1.mappingChainIDToInfuraNetworkish[chainID], process.env.INFURA_WEB3_API_KEY, process.env.INFURA_WEB3_API_SECRET_KEY);
        // DAOCreated
        {
            let signature = constants_1.EVENT_REGISTRIES[0].eventSignature;
            let signatureHash = constants_1.EVENT_REGISTRIES[0].eventSignatureHash;
            let contractName = constants_1.EVENT_REGISTRIES[0].contractName;
            let contractAddress = constants_1.ADDRESSES[chainID][contractName];
            let eventRegistryID = (0, sha256_1.default)(signatureHash +
                "_" +
                chainID +
                "_" +
                contractName +
                "_" +
                contractAddress);
            let eventRegistry = await event_registry_1.EventRegistryRepository.findByEventRegistryID(eventRegistryID);
            if (eventRegistry) {
                let eventFilter = {
                    address: contractAddress,
                    topics: [signatureHash],
                };
                provider.on(eventFilter, async (log, event) => {
                    let transactionHash = log.transactionHash;
                    let blockNumber = log.blocknumber;
                    let topics = log.topics;
                    await event_1.EventRepository.create(transactionHash, eventRegistryID, blockNumber, topics);
                    await dao_1.DAORepository.create(transactionHash, eventRegistryID, topics[2], topics[3]);
                });
            }
        }
        // ProposalCreated
        {
            let signature = constants_1.EVENT_REGISTRIES[0].eventSignature;
            let signatureHash = constants_1.EVENT_REGISTRIES[0].eventSignatureHash;
            let contractName = constants_1.EVENT_REGISTRIES[0].contractName;
            let contractAddress = constants_1.ADDRESSES[chainID][contractName];
            let eventRegistryID = (0, sha256_1.default)(signatureHash +
                "_" +
                chainID +
                "_" +
                contractName +
                "_" +
                contractAddress);
            let eventRegistry = await event_registry_1.EventRegistryRepository.findByEventRegistryID(eventRegistryID);
            if (eventRegistry) {
                let eventFilter = {
                    address: contractAddress,
                    topics: [signatureHash],
                };
                provider.on(eventFilter, async (log, event) => {
                    let transactionHash = log.transactionHash;
                    let blockNumber = log.blocknumber;
                    let topics = log.topics;
                    await event_1.EventRepository.create(transactionHash, eventRegistryID, blockNumber, topics);
                    await proposal_1.ProposalRepository.create(transactionHash, eventRegistryID, contractAddress, topics[1], topics[2]);
                });
            }
        }
        // LeafInserted
        {
            let signature = constants_1.EVENT_REGISTRIES[0].eventSignature;
            let signatureHash = constants_1.EVENT_REGISTRIES[0].eventSignatureHash;
            let contractName = constants_1.EVENT_REGISTRIES[0].contractName;
            let contractAddress = constants_1.ADDRESSES[chainID][contractName];
            let eventRegistryID = (0, sha256_1.default)(signatureHash +
                "_" +
                chainID +
                "_" +
                contractName +
                "_" +
                contractAddress);
            let eventRegistry = await event_registry_1.EventRegistryRepository.findByEventRegistryID(eventRegistryID);
            if (eventRegistry) {
                let eventFilter = {
                    address: contractAddress,
                    topics: [signatureHash],
                };
                provider.on(eventFilter, async (log, event) => {
                    let transactionHash = log.transactionHash;
                    let blockNumber = log.blocknumber;
                    let topics = log.topics;
                    await event_1.EventRepository.create(transactionHash, eventRegistryID, blockNumber, topics);
                    await merkle_leaf_1.MerkleLeafRepository.create(transactionHash, eventRegistryID, topics[1], topics[2]);
                });
            }
        }
    }
    EventListener.startListen = startListen;
})(EventListener || (EventListener = {}));
exports.default = EventListener;
