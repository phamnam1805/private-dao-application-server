import mongoose from "mongoose";
import mongooseConnection from ".";

const EventRegistry = mongooseConnection.model(
    "EventRegistry",
    new mongoose.Schema(
        {
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
        },
        { timestamps: true }
    )
);

namespace EventRegistryRepository {
    export async function findAll() {
        return await EventRegistry.find({});
    }

    export async function findByEventRegistryID(eventRegistryID: string) {
        return await EventRegistry.findOne({
            eventRegistryID: eventRegistryID,
        });
    }

    export async function findByEventSignatureHashAndChainIDandContractName(
        eventSignatureHash: string,
        chainID: string,
        contractName: string
    ) {
        return await EventRegistry.find({
            eventSignatureHash: eventSignatureHash,
            chainID: chainID,
            contractName: contractName,
        });
    }
    export async function create(
        eventRegistryID: string,
        eventSignature: string,
        eventSignatureHash: string,
        chainID: string,
        contractName: string,
        contractAddress: string
    ) {
        try {
            await EventRegistry.updateOne(
                { eventRegistryID: eventRegistryID },
                {
                    eventRegistryID: eventRegistryID,
                    eventSignature: eventSignature,
                    eventSignatureHash: eventSignatureHash,
                    chainID: chainID,
                    contractName: contractName,
                    contractAddress: contractAddress,
                },
                { upsert: true, setDefaultsOnInsert: true }
            );
        } catch (err) {
            console.log(err);
        }
    }
}

export { EventRegistry, EventRegistryRepository };
