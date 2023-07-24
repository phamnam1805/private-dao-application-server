import mongoose from "mongoose";
import mongooseConnection from ".";

const Event = mongooseConnection.model(
    "Event",
    new mongoose.Schema(
        {
            transactionHash: { type: String, required: true },
            eventRegistryID: {
                type: String,
                required: true,
                index: true,
            },
            blockNumber: { type: String, required: true },
            topics: { type: Array<String>, required: true },
        },
        { timestamps: true }
    )
);

namespace EventRepository {
    export async function create(
        transactionHash: string,
        eventRegistryID: string,
        blockNumber: string,
        topics: string[]
    ) {
        await Event.updateOne(
            { eventRegistryID: eventRegistryID, topics: topics },
            {
                transactionHash: transactionHash,
                eventRegistryID: eventRegistryID,
                blockNumber: blockNumber,
                topics: topics,
            },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }
}

export { Event, EventRepository };
