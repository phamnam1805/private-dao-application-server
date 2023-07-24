import mongoose from "mongoose";
import mongooseConnection from ".";
import { Tree } from "distributed-key-generation";
import { MerkleTree } from "fixed-merkle-tree";

const treeLevels = Number(process.env.TREE_LEVELS as string);

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
        let tree = Tree.getPoseidonHashTree(treeLevels);
        let leaves = await MerkleLeaf.find({}).sort({ index: "asc" });
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
