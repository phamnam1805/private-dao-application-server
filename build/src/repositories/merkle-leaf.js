"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleLeafRepository = exports.MerkleLeaf = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const _1 = __importDefault(require("."));
const distributed_key_generation_1 = require("distributed-key-generation");
const treeLevels = Number(process.env.TREE_LEVELS);
const MerkleLeaf = _1.default.model("MerkleLeaf", new mongoose_1.default.Schema({
    transactionHash: { type: String, required: true },
    eventRegistryID: { type: String, required: true, index: true },
    index: { type: String, required: true, index: true },
    commitment: { type: String, required: true, index: true },
}, { timestamps: true }));
exports.MerkleLeaf = MerkleLeaf;
var MerkleLeafRepository;
(function (MerkleLeafRepository) {
    async function create(transactionHash, eventRegistryID, index, commitment) {
        await MerkleLeaf.updateOne({ eventRegistryID: eventRegistryID, index: index }, {
            transactionHash: transactionHash,
            eventRegistryID: eventRegistryID,
            index: index,
            commitment: commitment,
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    MerkleLeafRepository.create = create;
    async function buildMerkleTree() {
        let tree = distributed_key_generation_1.Tree.getPoseidonHashTree(treeLevels);
        let leaves = await MerkleLeaf.find({}).sort({ index: "asc" });
        for (let i = 0; i < leaves.length; i++) {
            let leaf = leaves[i];
            tree.insert(leaf.commitment);
        }
        let result = {};
        for (let i = 0; i < leaves.length; i++) {
            result[leaves[i].commitment] = tree.path(i);
        }
        return result;
    }
    MerkleLeafRepository.buildMerkleTree = buildMerkleTree;
})(MerkleLeafRepository || (exports.MerkleLeafRepository = MerkleLeafRepository = {}));
