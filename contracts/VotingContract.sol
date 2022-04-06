//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract VotingContract {
    address public chairPerson;
    Contestant[] public contestants;
    mapping(address => Voter) public registeredVoters;

    event RegistrationStatus(address voter, bool status);

    struct Contestant {
        bytes32 name;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint256 weight;
        address delegate;
        uint256 vote;
    }

    constructor(bytes32[] memory contestantNames) {
        for (uint256 i = 0; i < contestantNames.length; i++) {
            contestants.push(
                Contestant({name: contestantNames[i], voteCount: 0})
            );
        }
        chairPerson = msg.sender;
    }

    function changeChairPerson(address newChairPerson) public {
        require(msg.sender == chairPerson, "Only chairperson allowed.");
        require(newChairPerson != address(0), "Invalid address");
        chairPerson = newChairPerson;
    }

    function registerVoters(address[] memory voters) public {
        for (uint256 i = 0; i < voters.length; i++) {
            if (
                voters[i] == address(0) || registeredVoters[voters[i]].hasVoted
            ) {
                emit RegistrationStatus(voters[i], false);
                continue;
            }

            registeredVoters[voters[i]].weight = 1;
            emit RegistrationStatus(voters[i], true);
        }
    }

    function getVoter(address votersAddress)
        public
        view
        returns (Voter memory)
    {
        return registeredVoters[votersAddress];
    }

    function vote(uint256 contestant) public {
        require(
            registeredVoters[msg.sender].weight > 0,
            "Only registered users allowed."
        );

        require(!registeredVoters[msg.sender].hasVoted, "Already voted.");
        for (uint256 i = 0; i < contestants.length; i++) {
            if (contestant == i) {
                contestants[i].voteCount++;
                registeredVoters[msg.sender].hasVoted = true;
            }
        }
    }

    /**
     * @dev Delegate your vote to the another voter.
     * @param to address to which vote is delegated
     */
    function delegate(address to) public {
        Voter storage sender = registeredVoters[msg.sender];
        require(!sender.hasVoted, "Already voted.");
        require(sender.weight > 0, "You are not a registered voter.");

        while (registeredVoters[to].delegate != address(0)) {
            to = registeredVoters[to].delegate;

            // Sender's Delegate already delegated vote to sender
            require(to != msg.sender, "Cyclic delegation not allowed.");
        }

        registeredVoters[msg.sender].delegate = to;
    }
}
