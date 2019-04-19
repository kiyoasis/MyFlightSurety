
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

let defaultAirlineAddress;
let flights = [];

(async() => {

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        contract.countRegisteredAirlies((error, res) => {
            console.log(error,res);

            for (var index = 0; index < res; index++) {
            contract.getRegisteredAirlieInfo(index, (error, result) => {
                console.log(error,result);
                display('Registered Airline', '', [ { label: 'Airline Name:', error: error, value: result[0]}, { label: 'Airline Address:', error: error, value: result[3]} ]);
                defaultAirlineAddress = result[3];
            });
        }
        });

        contract.countRegisteredFlights((error, result) => {
            console.log(error,result);

            //var element = [];
            for (var index = 0; index < result; index++) {
                contract.getRegisteredFlightInfo(index, (error, res) => {
                    
                    flights.push({
                        flight: res[0],
                        address: res[4]
                    });
                    
                    console.log(error,res);
                    display('Registered Flight', '', [ { label: 'Flight Name:', error: error, value: res[0] },  
                    { label: 'Status Code:', error: error, value: res[2] },{ label: 'Updated Timestamp:', error: error, value: res[3] },{ label: 'Flight Address:', error: error, value: res[4] } ]);
                });  
                
            }
            //console.log(element);
        });

        contract.getPassengerInfo((error, result) => {
            console.log(error,result);
            display('My Passenger Info', '', [ { label: 'Purchase Status:', error: error, value: result[0]}, { label: 'My Address:', error: error, value: result[1]}, { label: 'My Fund:', error: error, value: result[2]}, { label: 'My Flight:', error: error, value: result[3]} ]);
        });

        DOM.elid('create-airline').addEventListener('click', () => {          
            let address = DOM.elid('airline-address').value;
            let name = DOM.elid('airline-name').value;
            //alert(name);
            contract.registerAirline(address, name, (error, result) => {
                console.log(error, result);
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });

        })

        DOM.elid('register-flight').addEventListener('click', () => {
            
            let address = DOM.elid('airline-address2').value;
            let name = DOM.elid('flight-name').value;

            //alert(address);
            contract.registerFlight(name, address, (error, result) => {
                console.log(error, result);
                //display('Flight', 'register flight ', [ { label: 'Fetch Flight', error: error, value: result + ' ' + result} ]);
            });

        })

        DOM.elid('buy-flight').addEventListener('click', () => {
            
            let name = DOM.elid('flight-number-buy').value;
            let amount = DOM.elid('buy-amount').value;

            let flightInfo = getFlightInfo(name);
            console.log(flightInfo);
            if (flightInfo == null) {
                alert("Flight [" + name + "] is not registered.");
                return;
            }

            contract.buy(name, amount, (error, result) => {
                console.log(error, result);
            });

        })

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction

            let flightInfo = getFlightInfo(flight);
            console.log(flightInfo);
            if (flightInfo == null) {
                alert("Flight [" + flight + "] is not registered.");
                return;
            }

            contract.fetchFlightStatus(flightInfo.address, flightInfo.flight, (error, result) => {
                display2('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    
    });
    

})();

function getFlightInfo(flight) {
    var info = null;
    for (var i=0; i < flights.length; i++) {
        if(flights[i].flight == flight) {
            info = flights[i];
        }
    }
    return info;
}

function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}

function display2(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper-flight-update");
    let section = DOM.section();
    //section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







