// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// Simplified ERC721 implementation without external dependencies
contract TipJarNFT {
    using Strings for uint256;
    
    // ERC721 state variables
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // Contract state
    uint256 private _nextTokenId = 1;
    uint256 public totalTips = 0;
    address public owner;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event TipReceived(address indexed tipper, uint256 indexed tokenId, uint256 amount);
    
    struct TipData {
        uint256 amount;
        uint256 timestamp;
        address tipper;
    }
    
    mapping(uint256 => TipData) public tipData;
    
    // Basic ERC721 functions
    function name() public pure returns (string memory) {
        return "Tip Jar Receipt";
    }
    
    function symbol() public pure returns (string memory) {
        return "TIP";
    }
    
    function balanceOf(address account) public view returns (uint256) {
        require(account != address(0), "ERC721: address zero is not a valid owner");
        return _balances[account];
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        return _ownerOf(tokenId);
    }
    
    function _ownerOf(uint256 tokenId) internal view returns (address) {
        return _owners[tokenId];
    }
    
    function approve(address to, uint256 tokenId) public {
        address tokenOwner = _ownerOf(tokenId);
        require(to != tokenOwner, "ERC721: approval to current owner");
        require(msg.sender == tokenOwner || isApprovedForAll(tokenOwner, msg.sender), "ERC721: approve caller is not token owner or approved for all");
        
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        _requireMinted(tokenId);
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        _setApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address account, address operator) public view returns (bool) {
        return _operatorApprovals[account][operator];
    }
    
    function _setApprovalForAll(address account, address operator, bool approved) internal {
        require(account != operator, "ERC721: approve to caller");
        _operatorApprovals[account][operator] = approved;
        emit ApprovalForAll(account, operator, approved);
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: caller is not token owner or approved");
        _transfer(from, to, tokenId);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address tokenOwner = _ownerOf(tokenId);
        return (spender == tokenOwner || isApprovedForAll(tokenOwner, spender) || getApproved(tokenId) == spender);
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(_ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");
        
        delete _tokenApprovals[tokenId];
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    function _requireMinted(uint256 tokenId) internal view {
        require(_exists(tokenId), "ERC721: invalid token ID");
    }
    
    // Ownable functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Main contract functions
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
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner).transfer(balance);
    }
    
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        TipData memory data = tipData[tokenId];
        
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
    
    function _formatEther(uint256 weiAmount) internal pure returns (string memory) {
        uint256 eth = weiAmount / 1e18;
        uint256 gweiAmount = (weiAmount % 1e18) / 1e9;
        
        if (gweiAmount == 0) {
            return string(abi.encodePacked(eth.toString(), ".0"));
        } else {
            return string(abi.encodePacked(eth.toString(), ".", _padGwei(gweiAmount)));
        }
    }
    
    function _padGwei(uint256 gweiAmount) internal pure returns (string memory) {
        string memory gweiStr = gweiAmount.toString();
        uint256 padding = 9 - bytes(gweiStr).length;
        
        string memory result = gweiStr;
        for (uint256 i = 0; i < padding; i++) {
            result = string(abi.encodePacked("0", result));
        }
        return result;
    }
    
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

// Strings library
library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
