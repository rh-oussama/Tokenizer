# Tokenizer

Solidity contracts for an ERC-20 style token (**OUSS42**) and a multi-signature wallet that can control privileged token actions (mint, ownership transfer).

Built for use with [Remix IDE](https://remix.ethereum.org/).

## Contracts

| File | Contract | Description |
|------|----------|-------------|
| `contracts/IERC20.sol` | `IERC20` | Token interface (standard ERC-20 + `mint` / `transferOwnership`) |
| `contracts/ouss42.sol` | `OUSS42` | Fungible token implementation |
| `contracts/MultiSigWallet.sol` | `MultiSigOwners`, `MultiSigWallet` | Multi-sig owners list and transaction wallet |

### OUSS42 token

| Property | Value |
|----------|--------|
| Name | `OUSS42` |
| Symbol | `O42` |
| Decimals | `18` |
| Initial supply | `1_000_000` tokens (minted to deployer) |

**Main functions**

- Standard: `transfer`, `approve`, `transferFrom`, `balanceOf`, `allowance`, `totalSupply`
- Privileged (owner only):
  - `mint(address _to, uint256 _amount)` — mint new tokens
  - `transferOwnership(address _newOwner)` — change token owner

The deployer becomes `owner` and receives the initial supply.

### MultiSigWallet

A 2-of-3 multi-sig wallet. Hardcoded owners (2 approvals required to execute):

1. `0x65779450dF7c91530028d509676b24E94DD758D9`
2. `0x43E55Dc5D5f965CA4aC904da14c31bE2604A10d2`
3. `0x3519b32Cd459f0eCA2a9BC331C2d33935C45262B`

**Flow**

1. **Submit** — an owner calls `submitTransaction(tokenAddress, data)` with the target contract and encoded call data.
2. **Approve** — other owners call `approveTransaction(txId)` until `required` (2) approvals are reached.
3. **Execute** — an owner calls `executeTransaction(txId)`, which runs the call on the token contract.

Typical use: transfer OUSS42 ownership to the multi-sig, then mint or change ownership only through approved multi-sig transactions.

## Suggested setup

1. Deploy **OUSS42** (deployer is the initial owner and holds the supply).
2. Deploy **MultiSigWallet**.
3. From the token owner, call:
   ```text
   transferOwnership(<MultiSigWallet address>)
   ```
4. To mint via multi-sig:
   - Encode a call to `mint(to, amount)` (e.g. with Remix “At Address” / ABI encoder or `cast calldata`).
   - `submitTransaction` with the OUSS42 address and that calldata.
   - Get 2 owner approvals, then `executeTransaction`.

### Example calldata (mint)

Using [Foundry](https://book.getfoundry.sh/) `cast` (optional):

```bash
cast calldata "mint(address,uint256)" 0xRecipientAddress 1000000000000000000
```

That encodes minting `1` full token (18 decimals).

## Project layout

```text
Tokenizer/
├── contracts/
│   ├── IERC20.sol
│   ├── ouss42.sol
│   └── MultiSigWallet.sol
├── remix.config.json
└── README.md
```

Local Remix VM state is ignored (`.states/`). Build artifacts are also ignored.

## Requirements

- Solidity `>=0.6.12 <0.9.0`
- Remix (or any toolchain that compiles/deploys these contracts)

## License

Contracts use the MIT license (`SPDX-License-Identifier: MIT`).
