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

    function registerVoter(address[] memory voters) public {
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
}
