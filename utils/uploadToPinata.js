const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinata = new pinataSDK({
    pinataApiKey: process.env.Pinata_API_Key,
    pinataSecretApiKey: process.env.Pinata_API_Secret,
})

async function storeImages(imagesFilePath) {
    //it gives the full output of the path
    const fullImagesPath = path.resolve(imagesFilePath)

    //reading from the whole directory
    const files = fs.readdirSync(fullImagesPath)

    let responses = []
    console.log("Uploading to IPFS...")

    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        )

        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        }

        await pinata
            .pinFileToIPFS(readableStreamForFile, options)
            .then((response) => {
                console.log(response)
                responses.push(response)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    const options = {
        pinataMetadata: {
            name: metadata.name,
        },
    }

    try {
        const response = await pinata.pinJSONToIPFS(metadata, options)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }
