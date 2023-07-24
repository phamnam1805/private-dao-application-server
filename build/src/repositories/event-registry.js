"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRegistryRepository = exports.EventRegistry = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const _1 = __importDefault(require("."));
const EventRegistry = _1.default.model("EventRegistry", new mongoose_1.default.Schema({
    eventRegistryID: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    eventSignature: {
        type: String,
        required: true,
    },
    eventSignatureHash: {
        type: String,
        required: true,
    },
    chainID: { type: String, required: true },
    contractName: { type: String, required: true },
    contractAddress: { type: String, required: true },
}, { timestamps: true }));
exports.EventRegistry = EventRegistry;
var EventRegistryRepository;
(function (EventRegistryRepository) {
    async function findAll() {
        return await EventRegistry.find({});
    }
    EventRegistryRepository.findAll = findAll;
    async function findByEventRegistryID(eventRegistryID) {
        return await EventRegistry.findOne({ eventRegistryID: eventRegistryID });
    }
    EventRegistryRepository.findByEventRegistryID = findByEventRegistryID;
    async function findByEventSignatureHashAndChainIDandContractName(eventSignatureHash, chainID, contractName) {
        return await EventRegistry.find({
            eventSignatureHash: eventSignatureHash,
            chainID: chainID,
            contractName: contractName,
        });
    }
    EventRegistryRepository.findByEventSignatureHashAndChainIDandContractName = findByEventSignatureHashAndChainIDandContractName;
    async function create(eventRegistryID, eventSignature, eventSignatureHash, chainID, contractName, contractAddress) {
        await EventRegistry.updateOne({ eventRegistryID: eventRegistryID }, {
            eventRegistryID: eventRegistryID,
            eventSignature: eventSignature,
            eventSignatureHash: eventSignatureHash,
            chainID: chainID,
            contractName: contractName,
            contractAddress: contractAddress,
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    EventRegistryRepository.create = create;
})(EventRegistryRepository || (exports.EventRegistryRepository = EventRegistryRepository = {}));
