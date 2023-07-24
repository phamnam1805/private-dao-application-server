"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoURL = process.env.MONGODB_URL;
const mongooseConnection = mongoose_1.default.createConnection(mongoURL);
exports.default = mongooseConnection;
