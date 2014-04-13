led <-hardware.pin9;
testLed <-hardware.pin8;

led.configure(DIGITAL_OUT);
function setLed(ledState) {
    if (ledState="1"||ledState="0"){
        testLed.write("1");
        server.log("Set LED: " + ledState);
        led.write(ledState);
    } else if(ledState="f"){
        i=0;
        while(i<10){
            testLed.write("1");
            //on
            led.write("1");
            //wait
            imp.sleep(0.01);
            //off
            led.write("0");
            //wait
            imp.sleep(0.01);
            i++;
        }//make flash
    }
}
agent.on("led", setLed);
