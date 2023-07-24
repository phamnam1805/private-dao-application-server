"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepository = exports.Event = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const _1 = __importDefault(require("."));
const Event = _1.default.model("Event", new mongoose_1.default.Schema({
    transactionHash: { type: String, required: true, unique: true },
    eventRegistryID: {
        type: String,
        required: true,
        index: true,
    },
    blockNumber: { type: String, required: true },
    topics: { type: (Array), required: true },
}, { timestamps: true }));
exports.Event = Event;
var EventRepository;
(function (EventRepository) {
    async function create(transactionHash, eventRegistryID, blockNumber, topics) {
        await Event.updateOne({ transactionHash: transactionHash }, {
            transactionHash: transactionHash,
            eventRegistryID: eventRegistryID,
            blockNumber: blockNumber,
            topics: topics,
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    EventRepository.create = create;
})(EventRepository || (exports.EventRepository = EventRepository = {}));
