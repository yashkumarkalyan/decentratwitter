//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Decentratwitter is ERC721URIStorage {
    uint256 public tokenCount;
    uint256 public postCount;
    mapping(uint256 => Post) public posts;
     // address --> nft id
    mapping(address => uint256) public profiles;
  
    struct Post {
        uint256 id;
        string hash;
        uint256 tipAmount;
        address payable author;
    }
    event PostCreated(
    uint256 id,
    string hash,
    uint256 tipAmount,
    address payable author
    );
    event PostTipped(
    uint256 id,
    string hash,
    uint256 tipAmount,
    address payable author
    );

    constructor() ERC721("Decentratwitter", "DAPP") {}

    function mint(string memory _tokenURI) external returns (uint256) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        setProfile(tokenCount);
        uploadPost(tokenCount, _tokenURI);
        return (tokenCount);
    }

    function setProfile(uint256 _id) public{   
        require(ownerOf(_id) == msg.sender, 
        "Must Own NFT to select as Profile");
        profiles[msg.sender] = _id;
    }
    function uploadPost(uint256 _id, string memory _hash) public {
        require(ownerOf(_id) == msg.sender, 
        "Must Own NFT to upload post");
        postCount++;
        posts[postCount] = Post(postCount, _hash, 0, payable(msg.sender));
        emit PostCreated(postCount, _hash, 0, payable(msg.sender));
    }
}
