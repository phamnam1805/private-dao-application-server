import mongoose, { Mongoose } from "mongoose";

const mongoURL = process.env.MONGODB_URL;

const mongooseConnection = mongoose.createConnection(mongoURL as string);
export default mongooseConnection;
