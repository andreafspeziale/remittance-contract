pragma solidity ^0.4.19;

import "./Ownable.sol";

contract Remittance is Ownable {

    event LogWithdraw(address from, uint amount);
    event LogRedeem(address from, uint amount);
    event LogKill(address from);

    struct Puzzle {
        string psw1;
        string psw2;
    }

    Puzzle private puzzle;
    uint public amountToremit;
    address public exchange;
    uint public deadline;

    modifier whileNotExpired() {
        require(block.number<deadline);
        _;
    }

    modifier whileExpired() {
        require(block.number>deadline);
        _;
    }

    function Remittance(string _psw1, string _psw2, address _exchange, uint duration) public payable {
        require(msg.value > 0);
        puzzle=Puzzle(_psw1, _psw2);
        amountToremit = msg.value;
        exchange = _exchange;
        deadline = block.number + duration;
    }

    function withdraw(string _psw1, string _psw2) whileNotExpired public payable {
        require(msg.sender == exchange);
        require(keccak256(puzzle.psw1, puzzle.psw2) == keccak256(_psw1, _psw2));
        msg.sender.transfer(amountToremit);
        LogWithdraw(msg.sender, amountToremit);
    }

    function redeem() onlyOwner whileExpired public payable {
        owner.transfer(amountToremit);
        LogRedeem(owner, amountToremit);
    }

    function kill() onlyOwner whileExpired public returns (bool) {
        selfdestruct(owner);
        LogKill(owner);
        return true;
    }
}