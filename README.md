# Tokenizer

Solidity project for an ERC-20 style token controlled by a multi-signature wallet.

Use it with [Remix IDE](https://remix.ethereum.org/) and the scripts in `scripts/`.

## What this project does

1. **OUSS42** is a simple token (name `OUSS42`, symbol `O42`, 18 decimals).
2. The deployer receives **1,000,000** tokens and is the initial **owner**.
3. Only the owner can **mint** more tokens or **transfer ownership**.
4. **MultiSignWallet** is a 2-of-3 multi-sig. After you transfer token ownership to it, minting needs **2 owner approvals** instead of one person alone.

## Contracts

| File | Role |
|------|------|
| `contracts/IERC20.sol` | Token interface (standard ERC-20 + `mint` / `transferOwnership`) |
| `contracts/OUSS42.sol` | Token implementation |
| `contracts/MultiSignWallet.sol` | Multi-sig wallet (3 owners, **2** required) |

### Token (`OUSS42`)

- Anyone can use normal ERC-20 functions: `transfer`, `approve`, `transferFrom`, `balanceOf`, etc.
- **Owner only:**
  - `mint(to, amount)` — create new tokens
  - `transferOwnership(newOwner)` — change who can mint

### Multi-sig (`MultiSignWallet`)

Owners (hardcoded in the contract):

1. `0x65779450dF7c91530028d509676b24E94DD758D9`
2. `0x43E55Dc5D5f965CA4aC904da14c31bE2604A10d2`
3. `0x3519b32Cd459f0eCA2a9BC331C2d33935C45262B`

How a multi-sig action works:

1. An owner **submits** a transaction (target contract + calldata).
2. Other owners **approve** it.
3. When there are enough approvals (**2**), someone **executes** it.

Example: submit a `mint(...)` call on the token, get 2 approvals, then execute.

## Scripts (Remix)

Run these from Remix after connecting MetaMask (e.g. Sepolia).

| Script | Purpose |
|--------|---------|
| `scripts/deploy.ts` | Compile and deploy **OUSS42**, save address to `config.json` |
| `scripts/deploy_bonus.ts` | Compile and deploy **MultiSignWallet**, save address to `config.json` |
| `scripts/transfer_ownership.ts` | Transfer token ownership to the multi-sig address in `config.json` |
| `scripts/mint_multisign.ts` | Encode mint + submit / use multi-sig to mint |

`config.json` holds deployed addresses used by the later scripts:

- `tokenAddress`
- `multisignAddress`
- deployer addresses

## Suggested order

1. Run `deploy.ts` → token is live.
2. Run `deploy_bonus.ts` → multi-sig is live.
3. Run `transfer_ownership.ts` → multi-sig becomes token owner.
4. Run `mint_multisign.ts` (and collect approvals as needed) to mint under multi-sig control.

## Requirements

- Solidity `>=0.6.12 <0.9.0`
- Remix + MetaMask (or another wallet provider in Remix)

## License

MIT (`SPDX-License-Identifier: MIT` on the contracts)
