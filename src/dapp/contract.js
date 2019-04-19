import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
var BigNumber = require('bignumber.js');

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);                
            }

            console.log(this.airlines);

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            console.log(this.passengers);
            
            console.log(this.owner);

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    countRegisteredAirlies(callback) {
        let self = this;
        self.flightSuretyData.methods
            .countRegisteredAirlies()
            .call({ from: self.owner}, callback);
    }

    getRegisteredAirlieInfo(index, callback) {
        let self = this;
        self.flightSuretyData.methods
            .getRegisteredAirlieInfo(index)
            .call({ from: self.owner}, callback);
    }

    getRegisteredFlightInfo(index, callback) {
        let self = this;
        self.flightSuretyData.methods
            .getRegisteredFlightInfo(index)
            .call({ from: self.owner}, callback);
    }

    countRegisteredFlights(callback) {
        let self = this;
        self.flightSuretyData.methods
            .countRegisteredFlights()
            .call({ from: self.owner}, callback);
    }

    registerAirline(address, name, callback) {
        let self = this;
        let fund = 10 * (new BigNumber(10)).pow(18);
        self.flightSuretyApp.methods
        .registerAirline(address, name)
        .send({ from: self.owner, value: fund, gas:600000}, (error, result) => {
            callback(error);
        });
    }

    registerFlight(name, address, callback) {
        let self = this;
        //alert(name);
        self.flightSuretyData.methods
        .registerFlight(name, address)
        .send({ from: address, gas:600000 }, (error, result) => {
            callback(error);
        });
    }

    getPassengerInfo(callback) {
        let self = this;
        self.flightSuretyData.methods
            .getPassengerInfo(self.passengers[0])
            .call({ from: self.owner}, callback);
    }

    buy(name, amount, callback) {
        let self = this;
        self.flightSuretyData.methods
        .buy(name)
        .send({ from: self.passengers[0], gas:600000, value: amount}, (error, result) => {
            callback(error);
        });
    }

    fetchFlightStatus(address, flight, callback) {
        let self = this;
        let payload = {
            airline: address, //self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}