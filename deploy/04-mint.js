const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat.config")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts

    //1.Mint the Basic NFT
    const basicNFT = await ethers.getContract("BasicNFT", deployer)
    const basicMintTx = await basicNFT.mintNFT()
    await basicMintTx.wait(1)
    console.log(
        `Basic NFT minted with index 0 has token URI: ${await basicNFT.tokenURI(
            0
        )}`
    )

    // 2.Mint the Random IPFS NFT
    const randomIPFSNFT = await ethers.getContract("RandomIPFSNFT", deployer)
    const mintFee = await randomIPFSNFT.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000)
        randomIPFSNFT.once("NFTminted", async () => {
            resolve()
        })
        const randomIPFSMintTx = await randomIPFSNFT.requestNFT({
            value: mintFee,
        })
        const randomIPFSMintTxReceipt = await randomIPFSMintTx.wait(1)

        if (developmentChains.includes(network.name)) {
            const requestId = randomIPFSMintTxReceipt.events[1].args.requestId

            const VRFCoordinatorV2Mock = await ethers.getContract(
                "VRFCoordinatorV2Mock",
                deployer
            )

            try {
                await VRFCoordinatorV2Mock.fulfillRandomWords(
                    requestId,
                    randomIPFSNFT.address
                )
            } catch (e) {
                console.log(e)
                reject(e)
            }
        }
    })
    console.log(
        `Random IPFS NFT minted with index 0 has token URI: ${await basicNFT.tokenURI(
            0
        )}`
    )

    // 3.Mint the Dynamic SVG NFT
    const highValue = ethers.utils.parseEther("4000")
    const DynamicSVGNft = await ethers.getContract("DynamicSVGNft", deployer)
    const dynamicSVGNftTx = await DynamicSVGNft.mintNFT(highValue.toString())
    await dynamicSVGNftTx.wait(1)
    console.log(
        `Dynamic SVG NFT minted with index 0 has token URI: ${await DynamicSVGNft.tokenURI(
            1
        )}`
    )
}

module.exports.tags = ["all", "mint"]
