import { ethers } from "ethers";
import { mappingChainIDToInfuraNetworkish } from "./constants";
import { BabyJub, Utils } from "distributed-key-generation";
import bigInt, { BigInteger } from "big-integer";

const chainID = process.env.CHAIN_ID as string;
const minimalUnit = bigInt(
    Number(process.env.MINIMAL_UNIT || 10000000000000000n)
);
namespace Helper {
    export function getProvider() {
        if (chainID == "31337") {
            // let provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
            // let provider = new ethers.WebSocketProvider("ws://127.0.0.1:8545/");
            let provider = new ethers.JsonRpcProvider("https://thepao-node.auxo.fund");
            return provider;
        } else {
            let provider = new ethers.InfuraProvider(
                mappingChainIDToInfuraNetworkish[chainID],
                process.env.INFURA_WEB3_API_KEY,
                process.env.INFURA_WEB3_API_SECRET_KEY
            );
            return provider;
        }
    }

    export function ipfsHashToBytes32(ipfsHash: string) {
        let decodedBase58 = ethers.decodeBase58(ipfsHash).toString(16).slice(4);
        return "0x" + decodedBase58;
    }

    export function bytes32ToIpfsHash(bytes32: string) {
        // console.log(bytes32);
        bytes32 = "1220" + bytes32.slice(2);
        let temp = bytes32.match(/.{1,2}/g) as any;
        let preparedArray: Uint8Array = new Uint8Array(temp.length);
        for (let i = 0; i < temp.length; i++) {
            preparedArray[i] = parseInt(temp[i], 16);
        }
        let encodedBase58 = ethers.encodeBase58(preparedArray);
        return encodedBase58;
    }

    export function bruteForcesResultVector(
        resultVector: Array<BigInt[]>,
        totalValue: BigInt = BigInt(0)
    ) {
        let dim = resultVector.length;
        let results = [...Array(dim).keys()].map((index: any) => bigInt(0));
        if (totalValue == 0n) {
            let counters = [...Array(dim).keys()].map((index: any) =>
                bigInt(0)
            );

            for (let i = 0; i < dim; i++) {
                let found = false;
                let targetPoint = Utils.getBigIntegerArray(resultVector[i]);
                while (!found) {
                    found = comparePoint(
                        targetPoint,
                        BabyJub.mulPointBaseScalar(
                            counters[i].multiply(minimalUnit)
                        )
                    );
                    if (found) {
                        results[i] = counters[i];
                    }
                    counters[i] = counters[i].plus(1);
                }
            }
        } else {
            let counters = [...Array(dim).keys()].map((index: any) =>
                bigInt(0)
            );
            let remain: BigInteger = Utils.getBigInteger(totalValue);
            for (let i = 0; i < dim - 1; i++) {
                let found = false;
                let targetPoint = Utils.getBigIntegerArray(resultVector[i]);
                while (!found) {
                    found = comparePoint(
                        targetPoint,
                        BabyJub.mulPointBaseScalar(
                            counters[i].multiply(minimalUnit)
                        )
                    );
                    if (found) {
                        results[i] = counters[i];
                        remain = remain.subtract(results[i]);
                    }
                    counters[i] = counters[i].plus(1);
                }
            }
            results[dim - 1] = remain;
        }
        return Utils.getBigIntArray(results);
    }

    function comparePoint(a: Array<BigInteger>, b: Array<BigInteger>) {
        if (a.length != b.length) {
            return false;
        }

        for (let i = 0; i < a.length; i++) {
            if (!a[i].eq(b[i])) {
                return false;
            }
        }
        return true;
    }

    function compareVector(a: Array<BigInteger[]>, b: Array<BigInteger[]>) {
        if (a.length != b.length) {
            return false;
        }

        for (let i = 0; i < a.length; i++) {
            if (!a[i][0].eq(b[i][0]) || !a[i][1].eq(b[i][1])) {
                return false;
            }
        }

        return true;
    }
}

export default Helper;
