// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TipJarNFT is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 private _nextTokenId = 1;
    uint256 public totalTips = 0;
    
    struct TipData {
        uint256 amount;
        uint256 timestamp;
        address tipper;
    }
    
    mapping(uint256 => TipData) public tipData;
    
    event TipReceived(address indexed tipper, uint256 indexed tokenId, uint256 amount);
    
    constructor() ERC721("Tip Jar Receipt", "TIP") Ownable(msg.sender) {}
    
    // Payable function to receive tips and mint NFT
    function tip() external payable {
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        
        tipData[tokenId] = TipData({
            amount: msg.value,
            timestamp: block.timestamp,
            tipper: msg.sender
        });
        
        totalTips += msg.value;
        
        emit TipReceived(msg.sender, tokenId, msg.value);
    }
    
    // Withdraw accumulated tips (only owner)
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    // Generate simplified on-chain metadata
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        TipData memory data = tipData[tokenId];
        
        // Simplified JSON metadata without complex SVG
        string memory json = string(abi.encodePacked(
            '{"name": "Tip Jar Receipt #',
            tokenId.toString(),
            '", "description": "A receipt NFT for supporting the tip jar with ',
            _formatEther(data.amount),
            ' ETH", "image": "https://via.placeholder.com/400x400/0052FF/FFFFFF?text=Tip+Receipt+',
            tokenId.toString(),
            '", "attributes": [{"trait_type": "Amount", "value": "',
            _formatEther(data.amount),
            ' ETH"}, {"trait_type": "Timestamp", "value": ',
            data.timestamp.toString(),
            '}, {"trait_type": "Supporter", "value": "',
            tokenId.toString(),
            '"}]}'
        ));
        
        return string(abi.encodePacked(
            'data:application/json;base64,',
            _encode(json)
        ));
    }
    
    // Helper function to format ether amounts
    function _formatEther(uint256 weiAmount) internal pure returns (string memory) {
        uint256 eth = weiAmount / 1e18;
        uint256 gweiAmount = (weiAmount % 1e18) / 1e9;
        
        if (gweiAmount == 0) {
            return string(abi.encodePacked(eth.toString(), ".0"));
        } else {
            return string(abi.encodePacked(eth.toString(), ".", _padGwei(gweiAmount)));
        }
    }
    
    // Helper function to pad gwei to 9 digits
    function _padGwei(uint256 gweiAmount) internal pure returns (string memory) {
        string memory gweiStr = gweiAmount.toString();
        uint256 padding = 9 - bytes(gweiStr).length;
        
        string memory result = gweiStr;
        for (uint256 i = 0; i < padding; i++) {
            result = string(abi.encodePacked("0", result));
        }
        return result;
    }
    
    
    // Helper function to base64 encode
    function _encode(string memory data) internal pure returns (string memory) {
        if (bytes(data).length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        uint256 encodedLen = 4 * ((bytes(data).length + 2) / 3);
        string memory result = new string(encodedLen + 32);
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, add(32, i))), 0xffffff)
                let out := mload(add(tablePtr, and(shr(250, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(244, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(238, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(232, input), 0x3F))), 0xFF))
                mstore(resultPtr, out)
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }
        
        return result;
    }
}
