pragma solidity ^0.4.19;

import "./Ownable.sol";

contract Remittance is Ownable {

    event LogRemittancePerformed(address indexed to, uint amount);
    
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
        LogRemittancePerformed(msg.sender, amountToremit);
        msg.sender.transfer(amountToremit);
    }

    function redeem() onlyOwner whileExpired public payable {
        owner.transfer(amountToremit);
    }

    function kill() onlyOwner whileExpired public returns (bool) {
        selfdestruct(owner);
        return true;
    }
}