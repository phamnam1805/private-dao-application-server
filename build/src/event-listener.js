"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const sha256_1 = __importDefault(require("sha256"));
const event_registry_1 = require("./repositories/event-registry");
const event_1 = require("./repositories/event");
const constants_1 = require("./constants");
const merkle_leaf_1 = require("./repositories/merkle-leaf");
const helper_1 = __importDefault(require("./helper"));
const big_integer_1 = __importDefault(require("big-integer"));
const FundManager_json_1 = require("./resources/FundManager.json");
var EventListener;
(function (EventListener) {
    async function registerEvent(chainID) {
        let keys = Object.keys(constants_1.EVENT_REGISTRIES);
        for (let i = 0; i < keys.length; i++) {
            let signature = constants_1.EVENT_REGISTRIES[keys[i]].eventSignature;
            let signatureHash = constants_1.EVENT_REGISTRIES[keys[i]].eventSignatureHash;
            let contractName = constants_1.EVENT_REGISTRIES[keys[i]].contractName;
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
    async function listenMerkleLeafInserted(chainID, rebuildMerkleLeafCollection = false) {
        let provider = helper_1.default.getProvider();
        let fundManager = new ethers_1.ethers.Contract(constants_1.ADDRESSES[chainID]["FundManager"], FundManager_json_1.abi, provider);
        let signature = constants_1.EVENT_REGISTRIES.MerkleLeafInserted.eventSignature;
        let signatureHash = constants_1.EVENT_REGISTRIES.MerkleLeafInserted.eventSignatureHash;
        let contractName = constants_1.EVENT_REGISTRIES.MerkleLeafInserted.contractName;
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
            if (rebuildMerkleLeafCollection) {
                let eventLogs = await fundManager.queryFilter([signatureHash]);
                await Promise.all(eventLogs.map(async (eventLog) => {
                    let transactionHash = eventLog.transactionHash;
                    let blockNumber = eventLog.blockNumber.toString();
                    let topics = eventLog.topics;
                    await Promise.all([
                        event_1.EventRepository.create(transactionHash, eventRegistryID, blockNumber, topics),
                        merkle_leaf_1.MerkleLeafRepository.create(transactionHash, eventRegistryID, (0, big_integer_1.default)(topics[1].slice(2), 16).toString(10), (0, big_integer_1.default)(topics[2].slice(2), 16).toString(10)),
                    ]);
                }));
            }
            provider.on(eventFilter, (log, event) => {
                // console.log(log);
                let transactionHash = log.transactionHash;
                let blockNumber = log.blockNumber;
                let topics = log.topics;
                event_1.EventRepository.create(transactionHash, eventRegistryID, blockNumber, topics);
                merkle_leaf_1.MerkleLeafRepository.create(transactionHash, eventRegistryID, (0, big_integer_1.default)(topics[1].slice(2), 16).toString(10), (0, big_integer_1.default)(topics[2].slice(2), 16).toString(10));
            });
        }
    }
    EventListener.listenMerkleLeafInserted = listenMerkleLeafInserted;
})(EventListener || (EventListener = {}));
exports.default = EventListener;
