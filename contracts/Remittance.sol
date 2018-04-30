pragma solidity ^0.4.19;

import "./Ownable.sol";

contract Remittance is Ownable {

    event LogWithdraw(address from, uint amount);
    event LogRedeem(address from, uint amount);
    event LogKill(address from);

    uint public amountToremit;
    address public exchange;
    uint public deadline;
    bytes32 private puzzle;

    modifier whileNotExpired() {
        require(block.number<deadline);
        _;
    }

    modifier whileExpired() {
        require(block.number>=deadline);
        _;
    }

    function Remittance(bytes32 _puzzle, address _exchange, uint duration) public payable {
        require(msg.value > 0);
        puzzle=_puzzle;
        amountToremit = msg.value;
        exchange = _exchange;
        deadline = block.number + duration;
    }

    function withdraw(string _psw1, string _psw2) whileNotExpired public payable {
        require(msg.sender == exchange);
        require(_solvePuzzle(_psw1, _psw2));
        msg.sender.transfer(amountToremit);
        LogWithdraw(msg.sender, amountToremit);
    }

    function _solvePuzzle(string _psw1, string _psw2) private view returns(bool) {
        return puzzle == keccak256(_psw1, _psw2);
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