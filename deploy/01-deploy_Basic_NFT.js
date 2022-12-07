const { developmentChains, networkConfig } = require("../helper-hardhat.config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    console.log("-----------------DEPLOYING-----------------")
    const args = []
    const BasicNFT = await deploy("BasicNFT", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log("-------------DEPLOYED-SUCCESSFULLY-----------------")
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        console.log("Verifying on EtherScan...")
        await verify(BasicNFT.address, args)
    }
}

module.exports.tags = ["all", "basic", "main"]
