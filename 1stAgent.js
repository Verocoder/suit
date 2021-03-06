server.log("Turn LED On: " +http.agenturl() + "?led=1");
server.log("Turn LED Off: " +http.agenturl() + "?led=0");
server.log("Flash LED: " +http.agenturl() + "?led=f");

function requestHandler(request, response) {
    try{
        if ("led" in request.query) {
            if (request.query.led == "1" || request.query.led == "0" || request.query.led == "f") {
                local  ledState = request.query.led.tostring();
                server.log(" State: " + ledState);
                device.send("led", ledState);
            //} else if(request.query.led == "f"){
              //  local ledState = request.query.led.tostring();
                //server.log(" State: " + ledState);
            //    device.send("led", ledState);
                
            } else {
                server.log("Invalid Params");
            }
        }
        response.send(200, "OK");
    } catch (ex) {
        response.send(500, "Internal Server Error: " + ex);
    }
}

http.onrequest(requestHandler);
