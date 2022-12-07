const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat.config")

const BASE_FEE = ethers.utils.parseEther("0.25") //0.25 LINK is the premium. It costs 0.25 LINK per request for random number
const GAS_PRICE_LINK = 1e9
//LINK per gas, calculated value based on the gas price of chain

const DECIMALS = "18"
const ANSWER = ethers.utils.parseEther("1000")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    const mockArgs = [DECIMALS, ANSWER]

    if (developmentChains.includes(network.name)) {
        console.log("Deploying Mocks...")
        log("Local Network Detected !!! DEPLOYING MOCKS...")

        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })

        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: mockArgs,
            blockConfirmations: network.config.blockConfirmations || 1,
        })
        log("Mocks Deployed")
        log("-x-x-x-x-x--x-x-x-x-x-x--x-x-x-x-x-x-x-x--x-x-x-x-x-x-x--x-x-x-x-")
    }
}

module.exports.tags = ["all", "mocks"]
