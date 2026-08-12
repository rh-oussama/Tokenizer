// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.9.0;


contract MultiSigOwners {

    address[] public owners = [
        0x65779450dF7c91530028d509676b24E94DD758D9,
        0x43E55Dc5D5f965CA4aC904da14c31bE2604A10d2,
        0x3519b32Cd459f0eCA2a9BC331C2d33935C45262B
    ];

    uint256 public required = 2;
    mapping(address => bool) public isOwner;

    constructor() {
        for (uint256 i = 0; i < owners.length; i++) {
            isOwner[owners[i]] = true;
        }
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

}


contract MultiSigWallet is MultiSigOwners{

    struct Transaction {
        address tokenAddress;
        bytes data;
        bool executed;
        uint256 approvalCount;
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approvals;

    
    function submitTransaction(address _tokenAddress, bytes calldata _data) external onlyOwner returns (uint256 txId) {
        transactions.push(Transaction({
            tokenAddress: _tokenAddress,
            data: _data,
            executed: false,
            approvalCount: 0
        }));
        
        txId = transactions.length - 1;
    }

    function approveTransaction(uint256 _txId) external onlyOwner {
        require(_txId < transactions.length, "Invalid tx");
        require(!approvals[_txId][msg.sender], "Already approved");
        require(!transactions[_txId].executed, "Already executed");
        approvals[_txId][msg.sender] = true;
        transactions[_txId].approvalCount += 1;
    }

    function executeTransaction(uint256 _txId) external onlyOwner {
        require(_txId < transactions.length, "Invalid tx");
        Transaction storage txn = transactions[_txId];
        require(!txn.executed, "Already executed");
        require(txn.approvalCount >= required, "Not enough approvals");
        txn.executed = true;

        (bool success, ) = txn.tokenAddress.call(txn.data);
        require(success, "Call failed");
    }

}