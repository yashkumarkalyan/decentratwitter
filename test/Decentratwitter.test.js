const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Decentratwitter", function () {
let decentratwitter
let deployer, user1, user2, users
let URI = "SampleURI"
let postHash ="SampleHash"

beforeEach(async ()=>  {
    // Get signers from development accounts
     [deployer, user1, user2, ...users] = await ethers.getSigners();
    // We get the contract factory to deploy the contract
    const DecentratwitterFactory  = await ethers. getContractFactory("Decentratwitter");
    // Deploy contract
    decentratwitter = await DecentratwitterFactory.deploy();
    // user1 mints an nfts
    await decentratwitter.connect(user1).mint (URI)
})
describe('Deployment',async () => {
    it("Should track name and symbol", async function () {
        const nftName="Decentratwitter"
        const nftSymbol = "DAPP"
        expect(await decentratwitter.name()).to.equal(nftName);
        expect(await decentratwitter.symbol()).to.equal(nftSymbol);
    });
})
describe('Minting NFTS',async () => {
    it("Should track each mint NFT", async function () {
        expect(await decentratwitter.tokenCount()).to.equal(1);
        expect(await decentratwitter.balanceOf(user1.address)).to.equal(1);
        expect(await decentratwitter.tokenURI(1)).to.equal(URI);

        await decentratwitter. connect (user2).mint(URI)
        expect(await decentratwitter.tokenCount()).to.equal(2);
        expect(await decentratwitter.balanceOf(user2.address)).to.equal(1);
        expect(await decentratwitter.tokenURI(2)).to.equal(URI);
    });
})
describe('Setting profiles',async () => {
    it("Should allow user to represent Profile using Owned NFT", async function() {
        await decentratwitter.connect(user1).mint(URI)
        expect(await decentratwitter.profiles(user1.address)).to.equal(2);

        await decentratwitter.connect(user1).setProfile(1)
        expect(await decentratwitter.profiles(user1.address)).to.equal(1);
        await expect(
            decentratwitter.connect(user2).setProfile(2)
        ).to.be.revertedWith("Must own NFT to set profile");
        
    });
    
})
describe('Uploading posts',async () => {
    it("Should allow user to upload posts", async function() {
        await expect(decentratwitter.connect(user1).uploadPost(postHash))
        .to.emit(decentratwitter, "PostUploaded")
        .withArgs(
            1,
            postHash,
            0,
            user1.address
        );
        const postCount = await decentratwitter.postCount()
        expect(postCount).to.equal(1)
        const post = await decentratwitter.posts(postCount)
        expect(post.id).to.equal(1)
        expect(post.hash).to.equal(postHash)
        expect(post.likes).to.equal(0)
        expect(post.owner).to.equal(user1.address)

        await expect(decentratwitter.connect(user2).uploadPost(postHash)).to.be.revertedWith("Must own NFT to upload post")
        await expect(
            decentratwitter.connect(user1).uploadPost("")
        ).to.be.revertedWith("Post hash cannot be empty");

    });})

describe('Tipping posts',async () => {
    it("Should allow user to tip posts and track", async function() {
        await decentratwitter.connect(user1).uploadPost(postHash)
       
        const initAuthorBalance = await ethers.provider.getBalance(user1.address)
        const tipAmount = ethers.utils.parseEther("1")     
        await decentratwitter.connect(user2).tipPostOwner(1, {value: tipAmount})
        .withArgs(
            1,
            postHash,
            tipAmount,
            user1.address,

        )   
        const Post= await decentratwitter.posts(1)
        expect(Post.tipAmount).to.equal(tipAmount);

        const finalAuthorBalance = await ethers.provider.getBalance(user1.address)
        expect (finalAuthorBalance).to.equal(initAuthorBalance.add(tipAmount))

        await expect(
            decentratwitter.connect(user2).tipPostOwner(2)
        ).to.be.revertedWith("Post does not exist");

        await expect(
            decentratwitter.connect(user1).tipPostOwner(1)
        ).to.be.revertedWith("Cannot tip your own post");
    });
})
    

});
