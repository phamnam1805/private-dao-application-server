"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleLeafRepository = exports.MerkleLeaf = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const _1 = __importDefault(require("."));
const MerkleLeaf = _1.default.model("MerkleLeaf", new mongoose_1.default.Schema({
    transactionHash: { type: String, required: true, unique: true },
    eventRegistryID: { type: String, required: true, index: true },
    index: { type: String, required: true, index: true },
    commitment: { type: String, required: true, index: true },
}, { timestamps: true }));
exports.MerkleLeaf = MerkleLeaf;
var MerkleLeafRepository;
(function (MerkleLeafRepository) {
    async function create(transactionHash, eventRegistryID, index, commitment) {
        await MerkleLeaf.updateOne({ transactionHash: transactionHash }, {
            transactionHash: transactionHash,
            eventRegistryID: eventRegistryID,
            index: index,
            commitment: commitment,
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    MerkleLeafRepository.create = create;
})(MerkleLeafRepository || (exports.MerkleLeafRepository = MerkleLeafRepository = {}));
