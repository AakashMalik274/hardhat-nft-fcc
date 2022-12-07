require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: { compilers: [{ version: "0.8.8" }, { version: "0.6.6" }] },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        localhost: {
            chainId: 31337,
            url: "http://127.0.0.1:8545/",
            blockConfirmations: 1,
        },
        goerli: {
            chainId: 5,
            url: GOERLI_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            blockConfirmations: 1,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
            5: 0,
            31337: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gasReport.txt",
        noColors: true,
        //coinmarketcap: COINMARKETCAP_API_KEYs,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}
