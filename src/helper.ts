import { ethers } from "ethers";
import { mappingChainIDToInfuraNetworkish } from "./constants";

const chainID = process.env.CHAIN_ID as string;

namespace Helper {
    export function getProvider() {
        if (chainID == "31337") {
            let provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
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
        bytes32 = "1220" + bytes32.slice(2);
        let temp = bytes32.match(/.{1,2}/g) as any;
        let preparedArray: Uint8Array = new Uint8Array(temp.length);
        for (let i = 0; i < temp.length; i++) {
            preparedArray[i] = parseInt(temp[i], 16);
        }
        let encodedBase58 = ethers.encodeBase58(preparedArray);
        return encodedBase58;
    }
}

export default Helper;
