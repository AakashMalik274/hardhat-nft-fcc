// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIPFSNFT__RangeOutOfBounds();
error RandomIPFSNFT__NeedMoreEth();
error RandomIPFSNFT__WithdrawlFailed();

contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    /*We will get a random number from Chainlink VRF 
    Using that number we will get random NFT
    Gon, Killua, Gon with Fishing Rod, Killua with SkateBoard

    Gon with Fishing Rod - Most Rare
    Killua with SkateBoard - Less Rare
    Gon - Rare
    Killua - Common*/

    //Users have to pay to mint an NFT
    //Owner of the contract can withdraw the ETH

    //Type Declaration
    enum HunterType {
        Gon,
        Gon_with_Fishing_Rod,
        Killua,
        Killua_with_SkateBoard
    }

    //Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_VRFCoordinatorV2;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;

    //VRF_Helpers
    mapping(uint256 => address) private s_requestIdToSender;

    //NFT Variables
    uint256 private s_tokenCounter;
    uint256 private constant MAX_CHANCE_VALUE = 100;
    string[] internal s_HunterUris;
    uint256 immutable i_mintFee;

    //Events
    event NFTrequested(uint256 indexed requestId, address indexed requester);
    event NFTminted(HunterType hunter, address minter);

    constructor(
        address VRFCoordinatorV2,
        bytes32 keyHash,
        uint64 subscriptionID,
        uint32 callbackGasLimit,
        string[4] memory HunterUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(VRFCoordinatorV2) ERC721("Hunter", "HUNT") {
        i_VRFCoordinatorV2 = VRFCoordinatorV2Interface(VRFCoordinatorV2);
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionID;
        i_callbackGasLimit = callbackGasLimit;
        s_HunterUris = HunterUris;
        i_mintFee = mintFee;
    }

    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIPFSNFT__NeedMoreEth();
        }
        requestId = i_VRFCoordinatorV2.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NFTrequested(requestId, msg.sender);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        address hunterOwner = s_requestIdToSender[_requestId];
        uint256 newTokenId = s_tokenCounter;

        uint256 moddedRandomNumber = _randomWords[0] % MAX_CHANCE_VALUE;
        //0-99 will be the value of moddedRandomWord

        //get NFT Based On Modded Random Number
        HunterType Hunter = getBreedFromModdedRng(moddedRandomNumber);
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(hunterOwner, newTokenId);
        _setTokenURI(newTokenId, s_HunterUris[uint256(Hunter)]);
        emit NFTminted(Hunter, hunterOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIPFSNFT__WithdrawlFailed();
        }
    }

    function getBreedFromModdedRng(uint256 moddedRng)
        public
        pure
        returns (HunterType)
    {
        uint256 cummulativeSum = 0;
        uint256[4] memory chance_Array = getChanceArray();

        for (uint256 i = 0; i < chance_Array.length; i++) {
            if (moddedRng >= cummulativeSum && moddedRng < chance_Array[i]) {
                return HunterType(i);
            }
            cummulativeSum = chance_Array[i];
        }
        revert RandomIPFSNFT__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[4] memory) {
        return [5, 15, 35, MAX_CHANCE_VALUE];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getHunterUris(uint256 index) public view returns (string memory) {
        return s_HunterUris[index];
    }

    function getRequestIdToSender(uint256 requestId)
        public
        view
        returns (address)
    {
        return s_requestIdToSender[requestId];
    }
}
