// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeiadze5tx2mq7acbsesdman73q2arzncc6kfdsq7chm3jdgtng777y/";
    uint256 private s_tokenCounter;

    constructor() ERC721("Hunter", "HUNT") {
        s_tokenCounter = 0;
    }

    function mintNFT() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    function tokenURI(
        uint256 /*tokenId*/
    ) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
