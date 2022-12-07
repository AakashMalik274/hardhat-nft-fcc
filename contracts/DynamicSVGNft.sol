// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

error DynamicSVGNft_NonExistent_TokenID();

contract DynamicSVGNft is ERC721 {
    AggregatorV3Interface internal immutable i_priceFeed;

    event NFTminted(uint256 indexed tokenId, int256 indexed value);

    uint256 public s_tokenId;
    string private i_LowImageURI;
    string private i_HighImageURI;

    mapping(uint256 => int256) s_tokenIdToValue;

    string private constant BASE_64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Bear Or Bull", "BxB") {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);

        s_tokenId = 0;
        i_LowImageURI = svgToImageURI(lowSvg);
        i_HighImageURI = svgToImageURI(highSvg);
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );

        return
            string(
                abi.encodePacked(BASE_64_ENCODED_SVG_PREFIX, svgBase64Encoded)
            );
    }

    function mintNFT(int256 value) public {
        s_tokenIdToValue[s_tokenId] = value;
        s_tokenId = s_tokenId + 1;

        _safeMint(msg.sender, s_tokenId);
        emit NFTminted(s_tokenId, value);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenID
    ) public view virtual override returns (string memory) {
        if (!_exists(tokenID)) {
            revert DynamicSVGNft_NonExistent_TokenID();
        }

        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageUri = i_HighImageURI;

        if (price < s_tokenIdToValue[tokenID]) {
            imageUri = i_LowImageURI;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '","description":"An NFT that changes based on ChainLink feeds","image":"',
                                imageUri,
                                '",',
                                '"attributes":[{"trait_type":"coolness","value":100}]}'
                            )
                        )
                    )
                )
            );
    }

    /* view/pure functions */
    function getTokenId() public view returns (uint256) {
        return s_tokenId;
    }

    function getLowImageURI() public view returns (string memory) {
        return i_LowImageURI;
    }

    function getHighImageURI() public view returns (string memory) {
        return i_HighImageURI;
    }
}
