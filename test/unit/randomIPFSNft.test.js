const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat.config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("randomIPFSNft Unit Test", () => {
          let randomIPFSNft
          let deployer
          let VRFCoordinatorV2Mock
          let mintFee
          let chainId = network.config.chainId
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer

              await deployments.fixture("all")

              randomIPFSNft = await ethers.getContract(
                  "RandomIPFSNFT",
                  deployer
              )

              VRFCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock",
                  deployer
              )

              mintFee = await randomIPFSNft.getMintFee()
          })

          describe("constructor", () => {
              it("initialises correctly", async () => {
                  assert.equal(
                      mintFee.toString(),
                      networkConfig[chainId]["mintFee"],
                      "mint Fee not initialised correctly"
                  )
                  assert.equal(
                      (await randomIPFSNft.getTokenCounter()).toString(),
                      "0",
                      "TokenCounter not initialised correctly"
                  )
              })
          })

          describe("requestNFT", () => {
              it("reverts if not enough mintFee", async () => {
                  await expect(randomIPFSNft.requestNFT()).to.be.revertedWith(
                      "RandomIPFSNFT__NeedMoreEth"
                  )
              })
              it("emits an event successfully", async () => {
                  await expect(
                      randomIPFSNft.requestNFT({ value: mintFee })
                  ).to.emit(randomIPFSNft, "NFTrequested")
              })
              it("stores the address with the correct requestId", async () => {
                  const txResponse = await randomIPFSNft.requestNFT({
                      value: mintFee,
                  })
                  const txReceipt = await txResponse.wait(1)

                  const requester = txReceipt.events[1].args.requester

                  assert.equal(requester, deployer, "Wrong address stored")
              })
          })

          describe("fulfillRandomWords", () => {
              let tx
              let txReceipt
              let requestId
              beforeEach(async () => {
                  tx = await randomIPFSNft.requestNFT({
                      value: mintFee,
                  })
                  txReceipt = await tx.wait(1)

                  requestId = txReceipt.events[1].args.requestId
              })
              it("increases the tokenCounter after minting NFT", async () => {
                  await VRFCoordinatorV2Mock.fulfillRandomWords(
                      requestId,
                      randomIPFSNft.address
                  )

                  assert.equal(
                      (await randomIPFSNft.getTokenCounter()).toString(),
                      1,
                      "Token Counter not Increased correctly"
                  )
              })
              it("mints the NFT correctly", async () => {
                  await new Promise(async (resolve, reject) => {
                      randomIPFSNft.once("NFTminted", async () => {
                          try {
                              const tokenUri = await randomIPFSNft.tokenURI("0")
                              const tokenCounter =
                                  await randomIPFSNft.getTokenCounter()
                              assert.equal(
                                  tokenUri.toString().includes("ipfs://"),
                                  true
                              )
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          await VRFCoordinatorV2Mock.fulfillRandomWords(
                              requestId,
                              randomIPFSNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })

          describe("getBreedFromModdedRng", () => {
              it("should return Gon if modded random number < 5", async () => {
                  const actualValue = await randomIPFSNft.getBreedFromModdedRng(
                      4
                  )
                  assert.equal(actualValue, "0", "Not Gon")
              })

              it("should return Gon_with_Fishing_Rod if modded random number < 15", async () => {
                  const actualValue = await randomIPFSNft.getBreedFromModdedRng(
                      13
                  )
                  assert.equal(actualValue, "1", "Not Gon_with_Fishing_Rod")
              })

              it("should return Killua if modded random number < 35", async () => {
                  const actualValue = await randomIPFSNft.getBreedFromModdedRng(
                      27
                  )
                  assert.equal(actualValue, "2", "Not Killua")
              })

              it("should return Killua_with_SkateBoard if modded random number < 100", async () => {
                  const actualValue = await randomIPFSNft.getBreedFromModdedRng(
                      54
                  )
                  assert.equal(actualValue, "3", "Not Killua_with_SkateBoard")
              })
          })
      })
