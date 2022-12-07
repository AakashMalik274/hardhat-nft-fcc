const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat.config")
const fs = require("fs")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const deployer = (await getNamedAccounts()).deployer
    const { deploy, log } = deployments
    const chainId = network.config.chainId

    let priceFeedAddress

    if (developmentChains.includes(network.name)) {
        // const MockAggregatorV3 = await deployments.fixture("MockAggregatorV3")
        const MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )

        priceFeedAddress = MockV3Aggregator.address
    } else {
        priceFeedAddress = networkConfig[chainId].ethUsdPriceFeedAddress
    }
    log("---------------------------------------------------------")
    const lowSvg = fs.readFileSync("./images/dynamicNFT/lowSVG.svg", {
        encoding: "utf8",
    })
    const highSvg = fs.readFileSync("./images/dynamicNFT/highSVG.svg", {
        encoding: "utf8",
    })
    // address priceFeedAddress,
    // string memory lowSvg,
    // string memory highSvg

    const Args = [priceFeedAddress, lowSvg, highSvg]
    log("-------------------DEPLOYING-------------------")
    const DynamicSVGNft = await deploy("DynamicSVGNft", {
        from: deployer,
        log: true,
        args: Args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-------------DEPLOYED SUCCESSFULLY-------------")
    if (!developmentChains.includes(network.name)) {
        await verify(DynamicSVGNft.address, Args)
    }

    log("<--------------------------X------------------------>")
}

module.exports.tags = ["all", "dynamicSvg", "main"]
