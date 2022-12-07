const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat.config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("dynamicSvg Unit Test", () => {
          let deployer
          let dynamicSvg

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture("all")

              dynamicSvg = await ethers.getContract("DynamicSVGNft", deployer)
          })
          describe("constructor", () => {
              it("should initialise tokenId to 0 after deployment", async () => {
                  let tokenId = await dynamicSvg.getTokenId()
                  assert.equal(
                      tokenId.toString(),
                      "0",
                      "tokenId not initialised properly"
                  )
              })
              it("should initialise lowTokenUri correctly after deployment", async () => {
                  let lowTokenUri = await dynamicSvg.getLowImageURI()
                  assert.equal(
                      lowTokenUri.toString().includes("data:image/"),
                      true,
                      "tokenId not initialised properly"
                  )
              })
              it("should initialise highTokenUri correctly after deployment", async () => {
                  let highTokenUri = await dynamicSvg.getHighImageURI()
                  assert.equal(
                      highTokenUri.toString().includes("data:image/"),
                      true,
                      "tokenId not initialised properly"
                  )
              })
          })

          describe("mints the NFT correctly", () => {
              let txReceipt
              beforeEach(async () => {
                  let tx = await dynamicSvg.mintNFT(200)
                  txReceipt = await tx.wait(1)
              })
              it("increases the tokenId by 1 after minting", async () => {
                  let tokenId = await dynamicSvg.getTokenId()
                  assert.equal(
                      tokenId.toString(),
                      "1",
                      "tokenId not initialised properly"
                  )
              })
              it("emits an event after the minting with the value", async () => {
                  const value = txReceipt.events[1].args.value

                  assert.equal(value.toString(), "200", "wrong value in mint")
              })
          })

          describe("tokenURI", () => {
              let tokenId
              beforeEach(async () => {
                  let tx = await dynamicSvg.mintNFT(200)
                  let txReceipt = await tx.wait(1)
                  tokenId = txReceipt.events[1].args.tokenId
              })
              it("should get reverted with error if wrong tokenID is entered", async () => {
                  await expect(dynamicSvg.tokenURI(0)).to.be.reverted
              })
              it("should return correct MetaData", async () => {
                  let metaDataUri = await dynamicSvg.tokenURI(
                      tokenId.toNumber()
                  )
                  assert.equal(
                      metaDataUri.toString().includes("data:application"),
                      true,
                      "Not correct MetaData"
                  )
              })
          })
      })
