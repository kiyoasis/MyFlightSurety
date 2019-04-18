
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        contract.getRegisteredAirlieInfo((error, result) => {
            console.log(error,result);
            display('Registered Airline', '', [ { label: 'Airline Name:', error: error, value: result[0]}, { label: 'Airline Address:', error: error, value: result[3]} ]);
        });

        contract.countRegisteredFlights((error, result) => {
            console.log(error,result);

            //var element = [];
            for (var index = 0; index < result; index++) {
                contract.getRegisteredFlightInfo(index, (error, res) => {
                    console.log(error,res);
                    display('Registered Flights', 'Number of registered flights: ' + result, [ { label: 'Flight Name:', error: error, value: res[0] },  
                    { label: 'Status Code:', error: error, value: res[2] },{ label: 'Updated Timestamp:', error: error, value: res[3] },{ label: 'Flight Address:', error: error, value: res[4] } ]);
                });  
                
            }
            //console.log(element);
        });

        contract.getPassengerInfo((error, result) => {
            console.log(error,result);
            display('My Passenger Info', '', [ { label: 'Purchase Status:', error: error, value: result[0]}, { label: 'My Address:', error: error, value: result[1]}, { label: 'My Fund:', error: error, value: result[2]}, { label: 'My Flight:', error: error, value: result[3]} ]);
        });

        // DOM.elid('create-airline').addEventListener('click', () => {          
        //     let address = DOM.elid('airline-address').value;
        //     let name = DOM.elid('airline-name').value;
        //     //alert(name);
        //     contract.registerAirline(address, name, (error, result) => {
        //         console.log(error, result);
        //         //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
        //     });

        // })

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

            contract.buy(name, amount, (error, result) => {
                console.log(error, result);
            });

        })

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    
    });
    

})();


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







