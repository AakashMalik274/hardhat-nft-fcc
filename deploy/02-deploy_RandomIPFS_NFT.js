const { developmentChains, networkConfig } = require("../helper-hardhat.config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const {
    storeImages,
    storeTokenUriMetadata,
} = require("../utils/uploadToPinata")

const AMOUNT_FUNDED = ethers.utils.parseEther("2")
const IMAGES_PATH = "./images/randomNFT"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Strength",
            value: 100,
        },
    ],
}

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    const chainId = network.config.chainId

    let tokenUris = [
        "ipfs://QmNeyLyT1gdJUMt2D8ZcfSjGaqwXxYtHoTow2tMow9cQC1",
        "ipfs://QmURuv4K61FAx6ujfPsR5xpim9mNeEXnyib6z471sYGmRi",
        "ipfs://QmPkwvtkY45y2mqgAoGVHasgmJAnbaJZ3Vj7bUyEqYfYfh",
        "ipfs://QmccEJcpwysGmf1Jykw6trbKH9FZrdL4iGtNCu3sFbyoE7",
    ]

    //get the IPFS hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    // 1. with our own IPFS Node - pinning your data yourself
    // 2. Uploading on Pinata - having a centralised body pin your data
    // 3. Uploading on nft.storage - having a decentralised network pin your data

    let VRFCoordinatorV2Address
    let subscriptionId
    let VRFCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        VRFCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock",
            deployer
        )
        VRFCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId

        await VRFCoordinatorV2Mock.fundSubscription(
            subscriptionId,
            AMOUNT_FUNDED
        )
    } else {
        VRFCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    console.log("-----------------DEPLOYING-----------------")

    const keyHash = networkConfig[chainId].gasLane
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit
    const mintFee = networkConfig[chainId].mintFee

    const Args = [
        VRFCoordinatorV2Address,
        keyHash,
        subscriptionId,
        callbackGasLimit,
        tokenUris,
        mintFee,
    ]

    const RandomIPFSNFT = await deploy("RandomIPFSNFT", {
        from: deployer,
        log: true,
        args: Args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (developmentChains.includes(network.name)) {
        await VRFCoordinatorV2Mock.addConsumer(
            subscriptionId,
            RandomIPFSNFT.address
        )
    }

    console.log("-------------DEPLOYED-SUCCESSFULLY-----------------")
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        console.log("Verifying on EtherScan...")
        await verify(RandomIPFSNFT.address, Args)
    }
}

async function handleTokenUris() {
    tokenUris = []
    //store the image in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(
        IMAGES_PATH
    )

    for (imageUploadResponseIndex in imageUploadResponses) {
        //create MetaData
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(
            ".png",
            ""
        )
        tokenUriMetadata.description =
            `A dangerous hunter named ${tokenUriMetadata.name}`.split("With")[0]
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`

        //Upload Metadata
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        const metadataUploadResponse = await storeTokenUriMetadata(
            tokenUriMetadata
        )
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs uploaded. They are:")
    console.log(tokenUris)
    //store the metadata in IPFS
    return tokenUris
}

module.exports.tags = ["all", "randomIPFS", "main"]
