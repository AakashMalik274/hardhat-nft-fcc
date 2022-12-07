const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert } = require("chai")
const { getNamedAccounts, network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat.config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFTTest", () => {
          let deployer
          let BasicNFT
          const TOKEN_URI =
              "ipfs://bafybeiadze5tx2mq7acbsesdman73q2arzncc6kfdsq7chm3jdgtng777y/"
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture("all")

              BasicNFT = await ethers.getContract("BasicNFT", deployer)
          })

          it("constructor initialises correct tokenCounter", async () => {
              const tokenCounter = await BasicNFT.getTokenCounter()
              assert.equal(
                  tokenCounter.toString(),
                  "0",
                  "Incorrect Token Counter Initailized"
              )
          })

          it("constructor initialises correct tokenURI", async () => {
              const tokenURI = await BasicNFT.tokenURI("0")
              assert.equal(
                  tokenURI.toString(),
                  TOKEN_URI,
                  "Incorrect Token URI Initailized"
              )
          })

          it("mints multiple NFTs correctly", async () => {
              await BasicNFT.mintNFT()
              const tokenCounterV2 = await BasicNFT.getTokenCounter()
              assert.equal(
                  tokenCounterV2.toString(),
                  "1",
                  "Incorrect Token Counter Initailized second time"
              )
          })
      })
