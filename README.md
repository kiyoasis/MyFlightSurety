# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:
`npm install`

Make sure that smart contracts can be compiled:
`truffle compile`

## Test Smart Contracts

To run truffle tests:

First, in the terminal, run ganache-cli:
`ganache-cli -a 50`
<!-- `ganache-cli -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" -a 50`  -->

And then migrate the compiled contracts:
`truffle migrate`

In another window, type 
`truffle test ./test/flightSurety.js`
for testing Flight Surety contracts.

If you want to test Oracles, type
`truffle test ./test/oracles.js`

## Develop Client

Make sure the contracrts are compiled and migrated on ganache-cli. 

To use the dapp:
`npm run dapp`

To view dapp:
`http://localhost:8000`

## Develop Server

Make sure the contracrts are compiled and migrated on ganache-cli.

To use oracle server:
`npm run server`

<!-- If you want to test Oracles, type `truffle test ./test/oracles.js` -->

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder

## How to test dapp
Your first need to luanch ganache-cli, dapp, and oracle server as described above.
Please refere to the video:

'https://www.youtube.com/watch?v=TQyzAZl1DJc&t=16s'

## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)