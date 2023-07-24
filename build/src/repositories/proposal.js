"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalRepository = exports.Proposal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const _1 = __importDefault(require("."));
const Proposal = _1.default.model("Proposal", new mongoose_1.default.Schema({
    transactionHash: { type: String, required: true, unique: true },
    eventRegistryID: { type: String, required: true, index: true },
    contractAddress: { type: String, required: true, index: true },
    proposalID: { type: String, required: true, index: true },
    ipfsHash: { type: String, required: true },
}, { timestamps: true }));
exports.Proposal = Proposal;
var ProposalRepository;
(function (ProposalRepository) {
    async function create(transactionHash, eventRegistryID, contractAddress, proposalID, ipfsHash) {
        await Proposal.updateOne({ transactionHash: transactionHash }, {
            transactionHash: transactionHash,
            eventRegistryID: eventRegistryID,
            contractAddress: contractAddress,
            proposalID: proposalID,
            ipfsHash: ipfsHash,
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    ProposalRepository.create = create;
})(ProposalRepository || (exports.ProposalRepository = ProposalRepository = {}));
