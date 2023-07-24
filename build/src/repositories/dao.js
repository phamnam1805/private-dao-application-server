"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAORepository = exports.DAO = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const _1 = __importDefault(require("."));
const DAO = _1.default.model("DAO", new mongoose_1.default.Schema({
    transactionHash: { type: String, required: true, unique: true },
    eventRegistryID: { type: String, required: true, index: true },
    contractAddress: { type: String, required: true, index: true },
    ipfsHash: { type: String, required: true },
}, { timestamps: true }));
exports.DAO = DAO;
var DAORepository;
(function (DAORepository) {
    async function create(transactionHash, eventRegistryID, contractAddress, ipfsHash) {
        await DAO.updateOne({ transactionHash: transactionHash }, {
            transactionHash: transactionHash,
            eventRegistryID: eventRegistryID,
            contractAddress: contractAddress,
            ipfsHash: ipfsHash,
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    DAORepository.create = create;
})(DAORepository || (exports.DAORepository = DAORepository = {}));
