/*  Imp Serial Pipeline Agent
    by: Jim Lindblom
    SparkFun Electronics
    date: March 24, 2014
    license: Beerware. Use, reuse, and modify this code however you see fit.
    If you find it useful, buy me a beer some day!

    The Serial Pipeline model is designed to pass serial data from one imp to
    another.  A second Serial Pipeline model should be created to be a near exact
    copy of this, except the agentURL variable should be  modified to the URL of 
    this agent.

    The agent must accomplish two tasks:
        1. On data in from the imp, post it to another agent. This is the 
        agentURL variable at the top of the code.
        2. On data from another agent, send that through to the imp.

    Resources:
    http://electricimp.com/docs/api/hardware/uart/configure/
    http://natemcbean.com/2014/03/imp-to-imp-communication/
*/

// The URL of the other Imp's agent:
const agentURL = "https://agent.electricimp.com/Agent2URLHERE";

// When the imp sends data to the agent, that data needs to be relayed to the
// other agent. We need to construct a simple URL with a parameter to send
// the data.
device.on("impSerialIn", function(char)
{
    // Construct the URL. The other agent will be looking for the key "data".
    // Value will be the byte-value of our serial data.
    local urlSend = format("%s?data=%d", agentURL, char);
    // HTTP get the constructed URL.
    http.get(urlSend).sendasync(function(resp){});
});

// The request handler will be called whenever this agent receives an HTTP
// request. We need to parse the request, look for the key "data". If we 
// found "data", send that value over to the imp.
function requestHandler(request, response)
{
    try
    {
        // Check for "data" key.
        if ("data" in request.query)
        {
            // If we see "data", send that value over to the imp.
            // Label the data "dataToSerial" (data to serial output).
            device.send("dataToSerial", request.query.data);
        }
        // send a response back saying everything was OK.
        response.send(200, "OK");
    }
    catch (ex)  // In case of an error, produce an error code.
    {
        response.send(500, "Internal Server Error: " + ex);
    }
}

// Register our HTTP request handler. requestHandler will be called whenever
// an HTTP request comes in.
http.onrequest(requestHandler);
