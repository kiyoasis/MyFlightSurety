pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;

    struct Airline {
        string airlineName;
        bool isRegistered;
        bool isFunded;
        address airline;

        // Added for consensus
        //address[] multiCalls; // = new address[](0);
    }
    mapping(address => Airline) airlines;
    Airline[] airlineArray;

    struct Flight {
        string flightName;
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }
    //mapping(address => Flight) private flights;
    //mapping(bytes32 => Flight) private flights;
    mapping(string => Flight) private flights;
    Flight[] flightArray;

    struct Passenger {
        bool isRegistered;
        address passenger;
        uint fund;
        string flightNumber;
        //address[] airlines;  // = new address[](0);
    }
    mapping(address => Passenger) private passengers;
    Passenger[] passengerArray;

    uint tokenId = 1;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
    event FundWithdrawn(address addr, uint value);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public {
        contractOwner = msg.sender;

        address newAirline = msg.sender; //0xee9fd8f530906e74c9639b107837dba24e542fa8;
        airlines[newAirline].isRegistered = true;
        airlines[newAirline].airlineName = "JAL";
        airlines[newAirline].isFunded = false;
        airlines[newAirline].airline = newAirline;

        airlineArray.push(airlines[newAirline]);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() public view returns(bool) {
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function isAirline(address airline) public view returns(bool) {
        require(airline != address(0), "airline address must be a valid address.");
        return airlines[airline].isRegistered;
    }

    function isFlightRegistered(string name) public view returns(bool) {
        //require(airline != address(0), "airline address must be a valid address.");
        return flights[name].isRegistered;
    }

    function countRegisteredAirlies() public view returns(uint) {
        return airlineArray.length;
    }

    function getRegisteredAirlieInfo(uint index) public view returns(string, bool, bool, address) {
 
        return (
            airlineArray[index].airlineName,
            airlineArray[index].isRegistered,
            airlineArray[index].isFunded,
            airlineArray[index].airline
        );
    }

    function getRegisteredFlightInfo(uint index) public view returns(string, bool, uint, uint, address) {
 
        return (
            flightArray[index].flightName,
            flightArray[index].isRegistered,
            flightArray[index].statusCode,
            flightArray[index].updatedTimestamp,
            flightArray[index].airline
        );
    }

    function countRegisteredFlights() public view returns(uint) {
        return flightArray.length;
    }


    function getPassengerInfo(address passenger) public view returns (bool, address, uint, string) {
        return (
            passengers[passenger].isRegistered,
            passengers[passenger].passenger,
            passengers[passenger].fund,
            passengers[passenger].flightNumber
        );
    }

    function getFlightInfo(string flightName) public view returns(string, bool, uint, uint, address) {
        return (
            flights[flightName].flightName,
            flights[flightName].isRegistered,
            flights[flightName].statusCode,
            flights[flightName].updatedTimestamp,
            flights[flightName].airline
        );
    }


    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address newAirline, string name) external requireIsOperational {

        airlines[newAirline].isRegistered = true;
        airlines[newAirline].airlineName = name;
        airlines[newAirline].isFunded = false;        
        airlines[newAirline].airline = newAirline;

        airlineArray.push(airlines[newAirline]); 

        tokenId ++;
    }

    /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight(string name, address airline) external requireIsOperational {

        require(!flights[name].isRegistered, "The flight is already registered");

        flights[name].flightName = name;
        flights[name].isRegistered = true;
        flights[name].statusCode = STATUS_CODE_UNKNOWN;
        flights[name].updatedTimestamp = now;        
        flights[name].airline = airline;

        flightArray.push(flights[name]);
    }

    function changeFlightStatus(string name, address airline, uint256 timestamp, uint8 statusCode) external requireIsOperational {

        require(flights[name].isRegistered, "The flight should be registered");
        require(keccak256(abi.encodePacked(flights[name].flightName)) == keccak256(abi.encodePacked(name)), "The flight name should be identical");
        require(flights[name].airline == airline, "The flight airline should be identical");

        flights[name].statusCode = statusCode;
        flights[name].updatedTimestamp = timestamp;        

        //flightArray.push(flights[name]);
    }    

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy(string flightName) external payable requireIsOperational {

        require(this.isFlightRegistered(flightName), "The flight needs to be registered first.");
        require(msg.value <= 1 ether, "Too much fund");

        passengers[msg.sender].isRegistered = true;
        passengers[msg.sender].passenger = msg.sender;
        passengers[msg.sender].flightNumber = flightName;
        passengers[msg.sender].fund += msg.value;

        passengerArray.push(passengers[msg.sender]);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees(string flightName) external requireIsOperational {
        
        for (uint c = 0; c < passengerArray.length; c++) {
            if (keccak256(abi.encodePacked(passengerArray[c].flightNumber)) == keccak256(abi.encodePacked(flightName)) && passengerArray[c].isRegistered) {
                address passengerAddr = passengerArray[c].passenger;
                uint value = passengers[passengerAddr].fund;
                passengers[passengerAddr].fund = (value * 3)/2;
                passengerArray[c] = passengers[passengerAddr];
            }
        }
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay(uint256 amount) external requireIsOperational { 

        // Checks
        require(passengers[msg.sender].fund >= amount, "Insufficient fund");

        // Effects
        uint256 value = passengers[msg.sender].fund;
        passengers[msg.sender].fund = value.sub(amount);

        //Interraction
        msg.sender.transfer(amount);

        emit FundWithdrawn(msg.sender, amount); 
    }


   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund() public payable requireIsOperational {

        uint requiredFund = 10 ether;
        uint256 value = msg.value;
        uint refund = 0;

        if(msg.value > requiredFund) {
            refund = value.sub(requiredFund);
        }
        
        contractOwner.transfer(msg.value - refund);
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() external payable {
        fund();
    }

}