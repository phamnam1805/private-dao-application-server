import mongoose from "mongoose";
import mongooseConnection from ".";
import { Tree } from "distributed-key-generation";
import { MerkleTree } from "fixed-merkle-tree";
import { ADDRESSES, EVENT_REGISTRIES } from "../constants";
import sha256 from "sha256";

const treeLevels = Number(process.env.TREE_LEVELS as string);
const chainID = process.env.CHAIN_ID as string;

const MerkleLeaf = mongooseConnection.model(
    "MerkleLeaf",
    new mongoose.Schema(
        {
            transactionHash: { type: String, required: true },
            eventRegistryID: { type: String, required: true, index: true },
            index: { type: String, required: true, index: true },
            commitment: { type: String, required: true, index: true },
        },
        { timestamps: true }
    )
);

namespace MerkleLeafRepository {
    export async function create(
        transactionHash: string,
        eventRegistryID: string,
        index: string,
        commitment: string
    ) {
        await MerkleLeaf.updateOne(
            { eventRegistryID: eventRegistryID, index: index },
            {
                transactionHash: transactionHash,
                eventRegistryID: eventRegistryID,
                index: index,
                commitment: commitment,
            },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }

    export async function buildMerkleTree() {
        let signature = EVENT_REGISTRIES.MerkleLeafInserted.eventSignature;
        let signatureHash =
            EVENT_REGISTRIES.MerkleLeafInserted.eventSignatureHash;
        let contractName = EVENT_REGISTRIES.MerkleLeafInserted.contractName;
        let contractAddress = ADDRESSES[chainID][contractName];
        let eventRegistryID = sha256(
            signatureHash +
                "_" +
                chainID +
                "_" +
                contractName +
                "_" +
                contractAddress
        );
        // console.log(eventRegistryID);
        let tree = Tree.getPoseidonHashTree(treeLevels);
        let leaves = await MerkleLeaf.find({eventRegistryID: eventRegistryID}).sort({ index: "asc" });
        for (let i = 0; i < leaves.length; i++) {
            let leaf = leaves[i];
            tree.insert(leaf.commitment);
        }
        let result: any = {};
        for (let i = 0; i < leaves.length; i++) {
            result[leaves[i].commitment] = tree.path(i);
        }
        return result;
    }
}

export { MerkleLeaf, MerkleLeafRepository };
