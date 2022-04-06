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
    const tryChangeChairPerson = async () => {
      await votingContract
        .connect(accounts[1])
        .changeChairPerson(accounts[1].address);
    };
    await expect(tryChangeChairPerson()).to.be.rejectedWith(
      "VM Exception while processing transaction: reverted with reason string 'Only chairperson allowed."
    );
  });

  it("Should update chairperson 🏬", async () => {
    await votingContract.changeChairPerson(accounts[1].address);
    let chairPerson = await votingContract.chairPerson();
    expect(chairPerson).to.equal(accounts[1].address);
  });

  it("Should register voter 🏬", async () => {
    let votersAddress1 = accounts[1].address;
    let votersAddress2 = accounts[2].address;
    let txn = await votingContract.registerVoters([
      votersAddress1,
      votersAddress2,
    ]);
    await txn.wait();
    let voter1 = await votingContract.getVoter(votersAddress1);
    let voter2 = await votingContract.getVoter(votersAddress2);
    expect(Number(voter1.weight)).equals(1);
    expect(Number(voter2.weight)).equals(1);
  });

  it("Should let only registered users vote", async () => {
    const tryVote = async () => {
      let voter = accounts[1];
      txn = await votingContract.connect(voter).vote(1);
    };
    await expect(tryVote()).to.be.rejectedWith(
      "VM Exception while processing transaction: reverted with reason string 'Only registered users allowed.'"
    );
  });

  it("Should not let registered voters vote twice", async () => {
    const tryVoteTwice = async () => {
      let voter = accounts[1];
      let txn = await votingContract.registerVoters([voter.address]);
      await txn.wait();
      txn = await votingContract.connect(voter).vote(1);
      txn = await votingContract.connect(voter).vote(1);
    };
    await expect(tryVoteTwice()).to.be.rejectedWith(
      "VM Exception while processing transaction: reverted with reason string 'Already voted.'"
    );
  });

  it("Should allow only registered voters to delegate their votes🏬", async () => {
    const tryDelegate = async () => {
      let voter = accounts[1];
      let delegate = accounts[2].address;
      await votingContract.connect(voter).delegate(delegate);
    };
    await expect(tryDelegate()).to.be.rejectedWith(
      "VM Exception while processing transaction: reverted with reason string 'You are not a registered voter.'"
    );
  });

  it("Should not delegate if voter has voted 🏬", async () => {
    const tryDelegateAfterVoting = async () => {
      let voter = accounts[1];
      let delegate = accounts[2].address;
      let txn = await votingContract.registerVoters([voter.address]);
      txn = await votingContract.connect(voter).vote(1);
      txn = await votingContract.connect(voter).delegate(delegate);
    };
    await expect(tryDelegateAfterVoting()).to.be.rejectedWith(
      "VM Exception while processing transaction: reverted with reason string 'Already voted.'"
    );
  });

  it("Should not allow cyclic delegation🏬", async () => {
    const doCyclicDelegation = async () => {
      let voter = accounts[1];
      let delegate1 = accounts[2];
      let delegate2 = accounts[3];
      let txn = await votingContract.registerVoters([
        voter.address,
        delegate1.address,
        delegate2.address,
      ]);
      await txn.wait();
      txn = await votingContract.connect(delegate1).delegate(delegate2.address);
      await txn.wait();
      txn = await votingContract.connect(delegate2).delegate(voter.address);
      await txn.wait();
      txn = await votingContract.connect(voter).delegate(delegate1.address);
      await txn.wait();
    };
    await expect(doCyclicDelegation()).to.be.rejectedWith(
      "VM Exception while processing transaction: reverted with reason string 'Cyclic delegation not allowed.'"
    );
  });

  it("Should increase delegate weight (delegate has not voted)", async () => {
    let voter = accounts[1];
    let delegate = accounts[2];
    let delegate2 = accounts[3];
    await votingContract.registerVoters([
      voter.address,
      delegate.address,
      delegate2.address,
    ]);
    await votingContract.connect(voter).delegate(delegate.address);
    await votingContract.connect(delegate2).delegate(delegate.address);

    let updatedDelegate = await votingContract.getVoter(delegate.address);
    expect(Number(updatedDelegate.weight)).equals(3);
  });

  it("Should increase contestant vote count (delegate has voted)", async () => {});

  it("Should prevent self delegation", async () => {});
});

//Helper functions
async function createBytes() {
  let namesInByes = [];
  contestantNames.forEach((name) => {
    namesInByes.push(ethers.utils.formatBytes32String(name));
  });
  return namesInByes;
}
