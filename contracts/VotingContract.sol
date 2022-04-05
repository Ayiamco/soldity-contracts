//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract VotingContract {
    address public chairPerson;

    struct Contestant {
        bytes32 name;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint256 weight;
        address delegate;
    }

    constructor() {
        chairPerson = msg.sender;
    }
}
