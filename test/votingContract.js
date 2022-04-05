const chai = require("chai");
const { expect, assert } = chai;
chai.use(require("chai-as-promised"));
const { ethers } = require("hardhat");

let votingContract;
let owner;
let contractFactory;
let accounts;
const contestantNames = ["joseph1", "joseph2", "joseph3"];
let contestantNamesInBytes;

describe("Voting Contract 🥇", async () => {
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    contractFactory = await ethers.getContractFactory("VotingContract");
    contestantNamesInBytes = await createBytes();
    votingContract = await contractFactory.deploy(contestantNamesInBytes);
    await votingContract.deployed();
  });

  it("Should deploy contract 🏬", async function () {
    let chairPerson = await votingContract.chairPerson();
    expect(chairPerson).to.equal(owner.address);
  });

  it("Should allow only chairperson to change chairperson 🏬", async function () {
    await expect(tryChangeChairPerson()).to.be.rejectedWith(
      "VM Exception while processing transaction: reverted with reason string 'Only chairperson allowed."
    );
  });

  it("Should update chairperson 🏬", async () => {
    await votingContract.changeChairPerson(accounts[1].address);
    let chairPerson = await votingContract.chairPerson();
    expect(chairPerson).to.equal(accounts[1].address);
  });
});

//Helper functions
async function tryChangeChairPerson() {
  await votingContract
    .connect(accounts[1])
    .changeChairPerson(accounts[1].address);
}

async function createBytes() {
  let namesInByes = [];
  contestantNames.forEach((name) => {
    namesInByes.push(ethers.utils.formatBytes32String(name));
  });
  return namesInByes;
}
