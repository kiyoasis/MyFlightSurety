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

        let newAirline = accounts[2];
        //let tokenId = 1;
        let count = 0;
        //let fund = web3.toWei(100, "ether");

        console.log("first arline: " + config.firstAirline);
        count = await config.flightSuretyData.countRegisteredAirlies.call();
        console.log("# of registered airlines, count = " + count);
        assert.equal(count, 1, "Registered airline shold be only the first one");

        try {
            await config.flightSuretyApp.registerAirline(newAirline, 'ANA', {
                from: config.firstAirline
            });
        } catch (e) {
            // console.log("Cannot register first airline");
        }
        let result = await config.flightSuretyData.isAirline.call(newAirline);
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

        try {
            //await config.flightSuretyApp.registerAirline(config.firstAirline, 'ANA', {from: config.owner, value: 10});
            await config.flightSuretyApp.registerAirline(newAirline, 'ANA', {
                from: config.firstAirline,
                value: 10 * config.weiMultiple
            });
        } catch (e) {
            console.log("Cannot register first airline");
        }
        let isNewAirlineRegistered = await config.flightSuretyData.isAirline.call(newAirline);
        assert.equal(isNewAirlineRegistered, true, "First Airline should be able to be registered");

    });

    it('(airline) can be registered until 4th ones ', async () => {

        let newAirline2 = accounts[2];
        let newAirline3 = accounts[3];
        let newAirline4 = accounts[4];

        let fund = 10 * config.weiMultiple;

        let count1 = await config.flightSuretyData.countRegisteredAirlies.call();
        console.log("Current count1 = " + count1);

        try {
            await config.flightSuretyApp.registerAirline(newAirline2, 'ANA', {
                from: config.firstAirline,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register the airline that is already registred");
        }
        let result2 = await config.flightSuretyData.isAirline.call(newAirline2);
        assert.equal(result2, true, "The airline should be able to be registered");
        let count2 = await config.flightSuretyData.countRegisteredAirlies.call();
        console.log("Current count2 = " + count2);

        try {
            await config.flightSuretyApp.registerAirline(newAirline3, 'United', {
                from: config.firstAirline,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register airlines");
        }
        let result3 = await config.flightSuretyData.isAirline.call(newAirline3);
        assert.equal(result3, true, "The airline should be able to be registered");
        let count3 = await config.flightSuretyData.countRegisteredAirlies.call();
        console.log("Current count3 = " + count3);

        try {
            await config.flightSuretyApp.registerAirline(newAirline4, 'Delta', {
                from: config.firstAirline,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register airlines");
        }
        let result4 = await config.flightSuretyData.isAirline.call(newAirline4);
        assert.equal(result4, true, "The airline should be able to be registered");
        let count4 = await config.flightSuretyData.countRegisteredAirlies.call();
        console.log("Current count4 = " + count4);

    });

    it('(airline) 5th one needs consensus ', async () => {

        // ARRANGE
        let airline2 = accounts[2];
        // let airline3 = accounts[3];
        // let airline4 = accounts[4];
        let newAirline5 = accounts[5];

        let fund = 10 * config.weiMultiple;

        let voted = await config.flightSuretyApp.isAirlineVoted(newAirline5, {from: config.firstAirline});
        console.log("Voted1: " + voted);
        try {
            await config.flightSuretyApp.registerAirline(newAirline5, 'Singapore', {
                from: config.firstAirline,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register airlines");
        }
        let result5 = await config.flightSuretyData.isAirline.call(newAirline5);
        console.log("Airline5 = " + result5);
        let voted2 = await config.flightSuretyApp.isAirlineVoted(newAirline5, {from: config.firstAirline});
        console.log("Voted2: " + voted2);

        // assert.equal(result5, false, "The airline should not be able to be registered");
        // let count5 = await config.flightSuretyData.countRegisteredAirlies.call();
        // console.log("Current count5 = " + count5);

        try {
            await config.flightSuretyApp.registerAirline(newAirline5, 'Singapore', {
                from: airline2,
                value: fund
            });
        } catch (e) {
            console.log("Cannot register airlines");
        }
        result5 = await config.flightSuretyData.isAirline.call(newAirline5);
        console.log("Airline5 = " + result5);
        assert.equal(result5, true, "The airline should now be able to be registered");


        // try {
        //     await config.flightSuretyApp.registerAirline(newAirline5, 'Singapore', {
        //         from: airline3,
        //         value: fund
        //     });
        // } catch (e) {
        //     console.log("Cannot register airlines");
        // }

        // result5 = await config.flightSuretyData.isAirline.call(newAirline5);
        // console.log("Airline5 = " + result5);
        //assert.equal(result5, false, "The airline should not be able to be registered");


        // try {
        //     await config.flightSuretyApp.registerAirline(newAirline5, 'Singapore', {
        //         from: airline4,
        //         value: fund
        //     });
        // } catch (e) {
        //     console.log("Cannot register airlines");
        // }

        // result5 = await config.flightSuretyData.isAirline.call(newAirline5);
        // assert.equal(result5, true, "The airline should not be able to be registered");
    });

    it('(airline) register flihgt ', async () => {
        let flightName = 'JAL1234';
        try {
            await config.flightSuretyData.registerFlight(flightName, config.firstAirline, {
                from: config.firstAirline
            });
        } catch (e) {
            console.log("Cannot register a flight");
        }

        let result = await config.flightSuretyData.isFlightRegistered.call(flightName);
        assert.equal(result, true, "The flight should be able to be registered");
        let count = await config.flightSuretyData.countRegisteredFlights.call();
        
        console.log("# of registered flights = " + count);
    });

    it('(passenger) buy flihgt insurance', async () => {

        let passengerAddress = accounts[6];
        let flightName = 'JAL1234';

        try {
            await config.flightSuretyData.buy(flightName, {
                from: passengerAddress, value: 1 * config.weiMultiple
            });
        } catch (e) {
            console.log("Cannot buy a flight insurance");
        }

        let result = await config.flightSuretyData.getPassengerInfo.call(passengerAddress);
        console.log(result);
        console.log(Number(result[2]));

    });

    it('(passenger) can get credit by flihgt insurance', async () => {

        let passengerAddress = accounts[6];
        let flightName = 'JAL1234';

        try {
            await config.flightSuretyData.creditInsurees(flightName, {
                from: config.firstAirline
            });
        } catch (e) {
            console.log("Cannot credit a flight insurance");
        }

        let result = await config.flightSuretyData.getPassengerInfo.call(passengerAddress);
        console.log(result);
        console.log(Number(result[2]));

    });

});