// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "hardhat/console.sol";

// error GreeterError();
// awesome

contract PriceGame{
    enum Stages {
        Initial,
        GenesisRound,
        NormalRound,
        Paused
    }

    enum RoundStages {
        Start,
        Locked,
        Ended,
        finished
    }

    struct Round {
        RoundStages stage;
        uint256 epoch;
        uint256 startBlock;
        uint256 lockBlock;
        uint256 endBlock;
        uint256 lockPrice;
        uint256 closePrice;
        uint256 totalAmount;
        uint256 bullAmount;
        uint256 bearAmount;
    }


    mapping(uint256 => Round) public rounds;
    Stages public stage = Stages.Initial;
    uint256[] public pendingRounds;
    address public owner;
    uint256 public treasuryAmount;
    uint256 public currentEpoch;
    uint256 public lastActiveEpoch = 1;
    uint256 public currentPrice = 100;

    event StartRound(uint256 indexed epoch, uint256 blockNumber);
    event LockRound(uint256 indexed epoch, uint256 blockNumber, uint256 price);
    event EndRound(uint256 indexed epoch, uint256 blockNumber, uint256 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier atStage(Stages _stage) {
        require(stage == _stage);
        _;
    }

    modifier transitionAfter() {
        _;
        nextStage();
    }

    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }

    function nextEpoch() internal {
        currentEpoch = currentEpoch + 1;
    }

    constructor() {
        owner = msg.sender;
    }


    function next() external onlyOwner {
        if(stage == Stages.Initial) {
            nextStage();
            nextEpoch();
            _startRound(currentEpoch);
        } else if (stage == Stages.GenesisRound) {
            require(getNextRequiredAssistance() <= 0, "getNextRequiredAssistance() need to be 0 or below");

            _lockRound(currentEpoch, currentPrice);

            nextEpoch();
            _startRound(currentEpoch);
            
            nextStage();
        } else if (stage == Stages.NormalRound) {
            require(getNextRequiredAssistance() <= 0, "getNextRequiredAssistance() need to be 0 or below");

            _endRound(currentEpoch, currentPrice);
            _lockRound(currentEpoch, currentPrice);

            nextEpoch();
            _startRound(currentEpoch);
        }
    }

    function _lockRound(uint256 epoch, uint256 price) internal {
        Round storage round = rounds[epoch];
        round.lockPrice = currentPrice;
        round.stage =  RoundStages.Locked;

        emit LockRound(epoch, block.number, round.lockPrice);
    }

    function _endRound(uint256 epoch, uint256 price) internal {
        Round storage round = rounds[epoch];
        round.closePrice = price;
        round.stage = RoundStages.Ended;
        lastActiveEpoch = lastActiveEpoch + 1;

        emit EndRound(epoch, block.number, round.closePrice);
    }

    function getCurrentRound() public view returns(Round memory) {
        return rounds[currentEpoch];
    }
    
    function getNextRequiredAssistance() public view returns(int256) {
        if (lastActiveEpoch == 0) {
            return int(block.number);
        }
        Round memory _round = rounds[lastActiveEpoch];
        if(_round.stage == RoundStages.Start) {
            return int(_round.lockBlock) - int(block.number);
        } else {
            return int(_round.endBlock) - int(block.number);
        }
    }

    function setCurrentPrice(uint256 price) external onlyOwner {
        currentPrice = price;
    }

    function sendMoney() external payable onlyOwner {
        treasuryAmount = treasuryAmount + msg.value;
    }

    function withdrawAllMoney(address payable _to) public onlyOwner {
       _to.transfer(address(this).balance);
    }

    function _startRound(uint256 epoch) internal {
    Round storage round = rounds[epoch];
    round.startBlock = block.number;
    round.lockBlock = block.number + 100;
    round.endBlock = block.number + 100 * 2;
    round.epoch = epoch;
    round.totalAmount = 0;

    emit StartRound(epoch, block.number);
}
}
