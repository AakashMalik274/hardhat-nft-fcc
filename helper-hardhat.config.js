const { ethers } = require("hardhat")

const developmentChains = ["hardhat", "localhost"]

const networkConfig = {
    31337: {
        name: "localhost",
        gasLane:
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // doesn't need a gasLane because We are using Mocks for localhost,
        callbackGasLimit: "500000",
        mintFee: ethers.utils.parseEther("0.1"),
    },
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        subscriptionId: "2590",
        callbackGasLimit: "500000",
        gasLane:
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        mintFee: ethers.utils.parseEther("0.1"),
        ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
}

module.exports = { developmentChains, networkConfig }
