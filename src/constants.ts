export const ADDRESSES: { [key: string]: { [key: string]: string } } = {
    "31337": {
        Round2ContributionVerifier:
            "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        FundingVerifierDim3: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        VotingVerifierDim3: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        TallyContributionVerifierDim3:
            "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        ResultVerifierDim3: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        PoseidonUnit2: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
        Poseidon: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
        FundManager: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
        DAOManager: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
        DKG: "0x06B1D212B8da92b83AF328De5eef4E211Da02097",
        Queue: "0x94099942864EA81cCF197E9D71ac53310b1468D8",
    },
    "5": {
        Round2ContributionVerifier:
            "0x4D5a5d6704992A29FD0483B5267FD1c73132612b",
        FundingVerifierDim3: "0x916B8204dd038d3F6706272CE9e8f6D87c23Cbb6",
        VotingVerifierDim3: "0x1e5191dC71729AB5907B7971EAF062E2d9acdA92",
        TallyContributionVerifierDim3:
            "0x315FB9191fce81dd81E6602EC9496FCF124E5dBD",
        ResultVerifierDim3: "0xDF9D337B386cD511Ab9729a69b9E3AB23ab4Db54",
        PoseidonUnit2: "0x23364476F949d80210735331A956461211dB5629",
        Poseidon: "0x0911E33D589057fb088CEe21E20866F940f057f7",
        // FundManager: "0x68Deab74A4f047C893E3b1A538386fE486604984",
        // DAOManager: "0x189a23A0C0B8b4b4211F8e99cd7B54C20ffA4048",
        // DKG: "0x10C2642F2eB0be316E5364C2deFCC22dDa96Ba3C"
        // FundManager: "0x75861AB1b6bE866E6Dda0ced5F1B0a8DE0B969F6",
        // DAOManager: "0x972Da9deCE723E9E0e716Aad7121c6A59C0FaBba",
        // DKG: "0x93Ddcf2C8538827B15045c9e0261f4c040bCb34e",
        FundManager: "0x4F552c423b7Fa28A889E07096B1131FBAd350d51",
        DAOManager: "0xd95B22DAeb060E2Ab68b319aacb94DE1899C210E",
        DKG: "0xe22f737AB1bc03Ce6CB701C3a2Ec1D324cc4DA58",
        Queue: "0xCC8c42d6E4da920Ab053d1beE91064b4c80e1797",
    },
    "11155111": {
        Round2ContributionVerifier:
            "0x7295fbD3Ab027Dc289eA130E03Cd8E1C5440891c",
        FundingVerifierDim3: "0x65094F42cf0e739EaDa3d47868B7162dEBc6B2CF",
        VotingVerifierDim3: "0xD99e920665366A24A062413461f1E52a51dB61da",
        TallyContributionVerifierDim3:
            "0x6933A2Bf57d447CD017870b56201107ef67f2cB3",
        ResultVerifierDim3: "0xc5F2e90358C384187Ac9aCFD3256937B6D69Daee",
        PoseidonUnit2: "0xEEaa5c32Bf5bf5c552cE670BE1D58A4E61EC5b9B",
        Poseidon: "0xf02A06A12E7c7D1f06ee676634D6CbEE91F82A4e",
        FundManager: "0x841DAaC5b3612D84F2b7514C8A2835f578CC8671",
        DAOManager: "0x1cbdf9B3f9B26B5e54C215B7eD0Ca05858EacabB",
        DKG: "0xa505BcaBb99a8CA75AEBDff22C4877B89e3a0B11",
        Queue: "0x321B02463b6fb9ac49d908ED41fa86E71AA8cEF0",
    },
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
