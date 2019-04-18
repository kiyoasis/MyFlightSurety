var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);

        //console.log(config.flightSuretyApp);

        //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function() {

        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function() {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, {
                from: config.testAddresses[2]
            });
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function() {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function() {

        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try {
            await config.flightSurety.setTestingMode(true);
        } catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {

        let newAirline = config.firstAirline; //accounts[1];
        let fund = 10 * config.weiMultiple;

        let count = await config.flightSuretyData.countRegisteredAirlies.call();
        assert.equal(count, 1, "First airline should be registered when the contract is deployed");

        try {
            await config.flightSuretyApp.registerAirline(newAirline, 'ANA', {
                //from: config.firstAirline
                from: config.owner
            });
        } catch (e) {
            // console.log("Cannot register an airline");
        }
        let result = await config.flightSuretyData.isAirline.call(newAirline);
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

        try {
            //await config.flightSuretyApp.registerAirline(config.firstAirline, 'ANA', {from: config.owner, value: 10});
            await config.flightSuretyApp.registerAirline(newAirline, 'ANA', {
                from: config.owner, //from: config.firstAirline,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register an airline");
        }
        let isNewAirlineRegistered = await config.flightSuretyData.isAirline.call(newAirline);
        assert.equal(isNewAirlineRegistered, true, "The airline should be able to be registered with fund");


        let count1 = await config.flightSuretyData.countRegisteredAirlies.call();
        assert.equal(count1, 2, "Two airlines should be able to be registered with fund");
    });

    it('(airline) can be registered until 4th ones ', async () => {

        let newAirline2 = accounts[2];
        let newAirline3 = accounts[3];

        let fund = 10 * config.weiMultiple;

        try {
            await config.flightSuretyApp.registerAirline(newAirline2, 'JetBlue', {
                from: config.firstAirline,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register the airline");
        }
        let result1 = await config.flightSuretyData.isAirline.call(newAirline2);
        assert.equal(result1, true, "The airline should be able to be registered");
        let count1 = await config.flightSuretyData.countRegisteredAirlies.call();
        assert.equal(count1, 3, "Three airlines should be able to be registered with fund");

        try {
            await config.flightSuretyApp.registerAirline(newAirline3, 'United', {
                from: newAirline2,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register the airline");
        }
        let result2 = await config.flightSuretyData.isAirline.call(newAirline3);
        assert.equal(result2, true, "The airline should be able to be registered");
        let count2 = await config.flightSuretyData.countRegisteredAirlies.call();
        assert.equal(count2, 4, "Four airlines should be able to be registered with fund");

    });

    it('(airline) 5th one needs consensus ', async () => {

        let airline2 = accounts[2];
        let newAirline4 = accounts[4];
        let fund = 10 * config.weiMultiple;

        try {
            await config.flightSuretyApp.registerAirline(newAirline4, 'Singapore', {
                from: config.firstAirline,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register airlines");
        }
        let result1 = await config.flightSuretyData.isAirline.call(newAirline4);
        assert.equal(result1, false, "The airline should not be able to be registered until 50% of concensus has been made");
        let voted = await config.flightSuretyApp.isAirlineVoted(newAirline4, {from: config.firstAirline});
        assert.equal(voted, true, "The airline should be marked as voted");

        try {
            await config.flightSuretyApp.registerAirline(newAirline4, 'Singapore', {
                from: airline2,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register airlines");
        }
        let result2 = await config.flightSuretyData.isAirline.call(newAirline4);
        assert.equal(result2, true, "The airline should now be able to be registered with 50% votes");

    });

    it('(airline) register flihgt ', async () => {
        //let flightName = 'JAL1234';
        let flightNumber = 'ANA1234';
        try {
            await config.flightSuretyData.registerFlight(flightNumber, config.firstAirline, {
                from: config.firstAirline
            });
        } catch (e) {
            console.log("Cannot register a flight");
        }

        let result = await config.flightSuretyData.isFlightRegistered.call(flightNumber);
        assert.equal(result, true, "The flight should be able to be registered");
        let count = await config.flightSuretyData.countRegisteredFlights.call();
        assert.equal(count, 1, " of registered flights should be one");
    });

    it('(passenger) Passengers may pay up to 1 ether for purchasing flight insurance', async () => {

        let passengerAddress = accounts[6];
        let flightNumber = 'ANA1234';

        try {
            await config.flightSuretyData.buy(flightNumber, {
                from: passengerAddress, value: 1 * config.weiMultiple
            });
        } catch (e) {
            console.log("Cannot buy a flight insurance");
        }

        let result = await config.flightSuretyData.getPassengerInfo.call(passengerAddress);
        console.log(result);
        console.log('Founded amount:', Number(result[2]));

    });

    it('(passenger) If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid', async () => {

        let passengerAddress = accounts[6];
        let flight = 'ANA1234';
        let timestamp = Math.floor(Date.now() / 1000);
        let result1 = await config.flightSuretyData.getPassengerInfo.call(passengerAddress);
        try {
            await config.flightSuretyApp.processFlightStatus(config.firstAirline, flight, timestamp, 20);            
            // await config.flightSuretyData.creditInsurees(flightName, { from: config.firstAirline });
        } catch (e) {
            console.log("Cannot credit a flight insurance");
        }

        let result2 = await config.flightSuretyData.getPassengerInfo.call(passengerAddress);
        let originalFund = Number(result1[2]);
        let increasedFund = Number(result2[2]);
        assert.equal(increasedFund, 1.5 * originalFund, "The credit is not paid");

    });

    it('(passenger) Insurance payouts are not sent directly to passenger’s wallet', async () => {

        let passengerAddress = accounts[6];

        let result1 = await config.flightSuretyData.getPassengerInfo.call(passengerAddress);

        try {
            await config.flightSuretyData.pay(config.weiMultiple, { from: passengerAddress });
        } catch (e) {
            console.log("Cannot pay out to passenger's wallet");
        }

        let result2 = await config.flightSuretyData.getPassengerInfo.call(passengerAddress);
        
        let originalFund = Number(result1[2]);
        let decreasedFund = Number(result2[2]);

        console.log("Originsl Fund:", originalFund);
        console.log("Fund after withdraw:", decreasedFund);

        assert.equal(decreasedFund, originalFund - config.weiMultiple, "The credit is not paid out");

    });

});