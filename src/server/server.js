import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import 'babel-polyfill';
var BigNumber = require('bignumber.js');

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const TEST_ORACLES_COUNT = 10;

class OracleHandler {

  constructor() {
    let config = Config['localhost'];
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
    this.oracleAccounts = [];
  }

  async registerOracles() {

    await this.web3.eth.getAccounts((error, accts) => {
      console.log(accts);
      for (let a = 0; a < TEST_ORACLES_COUNT; a++) {
        this.oracleAccounts.push(accts[a]);                
      }
    });

    //let fee = await this.flightSuretyApp.REGISTRATION_FEE;
    //console.log("Fee:", Number(flightSuretyApp.REGISTRATION_FEE));
    console.log(this.oracleAccounts.length);

    for (let a = 0; a < this.oracleAccounts.length; a++) {
      console.log(this.oracleAccounts[a]);
      try {
        await this.flightSuretyApp.methods.registerOracle().send({
            from: this.oracleAccounts[a],
            value: (new BigNumber(10)).pow(18),
            gas: 600000
        });
        //console.log("Registration succeeded:", result);
      } catch(e) {
        console.log("Oracle registration failed or is already registered");
      }

      let result = await this.flightSuretyApp.methods.getMyIndexes().call({
        from: this.oracleAccounts[a]
      });
      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);

    }
  }

  async showRegisteredOracles() {
    for (let a = 0; a < this.oracleAccounts.length; a++) {
      try {
        console.log(this.oracleAccounts[0]);
        let result = await this.flightSuretyApp.methods.getMyIndexes().call({
            from: this.oracleAccounts[0]
        });
        console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
      } catch(e) {
        console.log("Cannot show indexes");
      }
    }
    return result;
  }

  async simulateOracles(address, flight, timestamp) {

    for (let a = 0; a < this.oracleAccounts.length; a++) {
      //console.log("HEeeeeeeeu");
      
      // Get oracle information
      let oracleIndexes = await this.flightSuretyApp.methods.getMyIndexes().call({
          from: this.oracleAccounts[a]
      });
      //console.log(oracleIndexes);
      for (let idx = 0; idx < 3; idx++) {
          //console.log(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_ON_TIME);
          try {
              // Submit a response...it will only be accepted if there is an Index match
              await this.flightSuretyApp.methods.submitOracleResponse(oracleIndexes[idx], address, flight, timestamp, STATUS_CODE_LATE_AIRLINE).send({
                  from: this.oracleAccounts[a]
              });
              console.log('\nSuccess', idx, oracleIndexes[idx], flight, timestamp);
          } catch (e) {
              // Enable this when debugging
              console.log('\nError', idx, oracleIndexes[idx], flight, timestamp);
          }
      }
    }
  }

}

let oracleHandler = new OracleHandler();
oracleHandler.registerOracles();

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {

    if (error) console.log(error)

    console.log("Oracle event triggered", event);
    console.log("airline:", event.returnValues.airline);
    console.log("timestamp:", event.returnValues.timestamp);
    console.log("flight:", event.returnValues.flight);
    let airline = event.returnValues.airline;
    let flight = event.returnValues.flight;
    let timestamp = event.returnValues.timestamp;
    //let timestamp = Math.floor(Date.now() / 1000);
    
    oracleHandler.simulateOracles(airline, flight, timestamp);

});

const app = express();
app.get('/api', (req, res) => {

  // let timestamp = Math.floor(Date.now() / 1000);
  // oracleHandler.simulateOracles("JAL1234", timestamp);

    res.send({
      message: 'An API for use with your Dapp!'
      //accounts: oracleHandler.simulateOracles()
      //test: oracleHandler.showRegisteredOracles()
    })
})

export default app;