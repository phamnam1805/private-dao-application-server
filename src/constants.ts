export const ADDRESSES: { [key: string]: { [key: string]: string } } = {
    "31337": {
        Round2ContributionVerifier:"0x4a18b5a9f2d75fd62d871CdC44FF26c0F8Da02eF",
        FundingVerifierDim3: "0x940d1f9c4724F6412E608b30510a4Bbf57CC6b3F",
        VotingVerifierDim3: "0x0204133D60c28d539802b8fa8b0D4b30f6D0Ca4A",
        TallyContributionVerifierDim3: "0x109D82Fa17F773155668a5F34e9b40416ef5Cb45",
        ResultVerifierDim3: "0x8E73fA58138bA142b821A3f4A54c2a70d71445BB",
        PoseidonUnit2: "0x365b1ec961fd5DC748Bbb36fa5FF74294Ac23712",
        Poseidon: "0xFe712985329d5683471F0eAb21D3C0E109bBA6D5",
        FundManager: "0x8864267084CA3B080e9087EB5C8c7F8d552099a5",
        DAOManager: "0x802eC44fA784F2bac33725729AF22b07EEAddeF0",
        DKG: "0xFc4e5fa9baA08675b1C621b3A2Fe866a8dcd1B02",
        Queue: "0xb0E68c1a69AbAC218050745e900ddd6EE467a547",
    },
    "5": {
        Round2ContributionVerifier:"",
        FundingVerifierDim3: "",
        VotingVerifierDim3: "",
        TallyContributionVerifierDim3: "",
        ResultVerifierDim3: "",
        PoseidonUnit2: "",
        Poseidon: "",
        FundManager: "",
        DAOManager: "",
        DKG: "",
        Queue: ""
    },
    "11155111": {
        Round2ContributionVerifier:"",
        FundingVerifierDim3: "",
        VotingVerifierDim3: "",
        TallyContributionVerifierDim3: "",
        ResultVerifierDim3: "",
        PoseidonUnit2: "",
        Poseidon: "",
        FundManager: "",
        DAOManager: "",
        DKG: "",
        Queue: ""
    } 
};

export const daoCreatedEventSignatureHash: string =
    "0x4dad5a8bd398f3fedacffabce7d350215d09253a8df80f630e60558197aa6681";
export const proposalCreatedEventSignatureHash: string =
    "0xe89ca49b18459b17a2cfc1701e971d1fd31d17864d6784c5b45c145f7a30aade";
export const leafInsertedEventSignatureHash: string =
    "0xe6feaf86f7be78c4928296db428cc35d7bf8f31e386692bcb1476c1364093258";

export const EVENT_REGISTRIES: { [key: string]: { [key: string]: string } } = {
    MerkleLeafInserted: {
        eventSignature: "LeafInserted(uint32 indexed, uint256 indexed)",
        eventSignatureHash:
            "0xe6feaf86f7be78c4928296db428cc35d7bf8f31e386692bcb1476c1364093258",
        contractName: "FundManager",
    },
};

export const mappingChainIDToInfuraNetworkish: { [key: string]: string } = {
    "11155111": "sepolia",
};
