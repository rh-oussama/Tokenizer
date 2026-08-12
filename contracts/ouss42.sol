// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.9.0;

import "./IERC20.sol";

contract OUSS42 is IERC20 {
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _totalSupply;


    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    constructor() {
      _name = "OUSS42";
      _symbol = "O42";
      _decimals = 18; 

      // mint the whole token supply           
      uint256 fixedSupply = 1000000;
      _totalSupply += fixedSupply * (10 ** uint256(_decimals));
      _balances[msg.sender] += _totalSupply;
      emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function name() public view override returns (string memory) {
      return  _name;
    }

    function symbol() public view override returns (string memory) {
      return _symbol;
    }

    function decimals() public view returns (uint8) {
      return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
      return _totalSupply;
    }

    function balanceOf(address _owner) public  view override  returns (uint256 balance) {
      return _balances[_owner];
    }

    function transfer(address _to, uint256 _value) public override  returns (bool success) {
      require(_to != address(0), "Transfer to zero address");
      require(_balances[msg.sender] >= _value, "Insufficient balance");
      require(_to != msg.sender, "Cannot transfer to yourself");
      _balances[msg.sender] -= _value;
      _balances[_to] += _value;
      emit Transfer(msg.sender, _to, _value);
      return true;

    }

    function allowance(address _owner, address _spender) public view override  returns (uint256 remaining) {
      return _allowances[_owner][_spender];
    }

    function approve(address _spender, uint256 _value) public override returns (bool success) {
      _allowances[msg.sender][_spender] = _value;
      emit Approval(msg.sender, _spender, _value);
      return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {
      require(_from != address(0), "Transfer from zero address");
      require(_to != address(0), "Transfer to zero address");
      require(_to != _from, "Cannot transfer to yourself");
      require(_balances[_from] >= _value, "Insufficient balance");
      require(_allowances[_from][msg.sender] >= _value, "Not sufficient allowance");

      _balances[_from] -= _value;
      _balances[_to] += _value;
      _allowances[_from][msg.sender] -= _value;
      
      emit Transfer(_from, _to, _value);

      return true;
    }

}