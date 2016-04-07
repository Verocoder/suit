//code to turn led off manually
// Log the URLs we need
server.log("Turn LED On: " + http.agenturl() + "?led=1");
server.log("Turn LED Off: " + http.agenturl() + "?led=0");

function requestHandler(request, response) {
    try {
        // Check if the user sent led as a query parameter
        if ("led" in request.query) {
            // If they did, and led=1.. set our variable to 1
            //if (request.query.led == "1" || request.query.led == "0") {
                // Convert the led query parameter to an integer
                local ledState = request.query.led.tointeger();

                // Send "set.led" message to device, and send ledState as the data
                device.send("set.led", ledState); 
            //}
        }
    
        // Send a response back to the browser saying everything was OK.
        response.send(200, "OK");
    } catch (ex) {
        response.send(500, "Internal Server Error: " + ex);
    }
}

// Register the HTTP handler to begin watching for HTTP requests from your browser
http.onrequest(requestHandler);





