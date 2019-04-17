
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let count = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        contract.countRegisteredAirlies((error, result) => {
            console.log(error,result);
            display('Number of Registered Airlines', 'Count the # of registered airlines', [ { label: '# of registered airlines:', error: error, value: result} ]);
        });

        contract.countRegisteredFlights((error, result) => {
            console.log(error,result);
            display('Number of Registered Flights', 'Count the # of registered flights', [ { label: '# of registered flights:', error: error, value: result} ]);
            count = result;
        });  

        // contract.getFlightInfo('test', (error, result) => {
        //     console.log(error,result);
        //     display('Number of Registered Flights', 'Count the # of registered flights', [ { label: '# of registered flights:', error: error, value: result} ]);
            
        // });  


        // contract.registerFlight('JAL1234', 'address', (error, result) => {
        //     //display('Oracles', 'register flight oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
        // }); 

        DOM.elid('create-airline').addEventListener('click', () => {
            
            let address = DOM.elid('airline-address').value;
            let name = DOM.elid('airline-name').value;

            //alert(name);
            contract.registerAirline(address, name, (error, result) => {
                //display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });

        })

        DOM.elid('register-flight').addEventListener('click', () => {
            
            let address = DOM.elid('airline-address2').value;
            let name = DOM.elid('flight-name').value;

            //alert(address);
            contract.registerFlight(name, address, (error, result) => {
                //display('Flight', 'register flight ', [ { label: 'Fetch Flight', error: error, value: result + ' ' + result} ]);
            });

        })

        DOM.elid('buy-flight').addEventListener('click', () => {
            
            let name = DOM.elid('flight-number-buy').value;

            //alert(name);
            contract.buy(name, (error, result) => {
                //display('Flight', 'register flight ', [ { label: 'Fetch Flight', error: error, value: result + ' ' + result} ]);
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







