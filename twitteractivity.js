info_val<-0; // tA is the twitter activity from agent
rVal<-0.5;
gVal<-0.5;
bVal<-0.0;


imp.configure("RGB Led", [], []);
server.log("Device Started");

red <- hardware.pin1;
red.configure(PWM_OUT, 1.0/500.0, 1.0);

green <- hardware.pin2;
green.configure(PWM_OUT, 1.0/500.0, 1.0);

blue <- hardware.pin9;
blue.configure(PWM_OUT, 1.0/500.0, 1.0);

function setRGB(r,g,b) {
    red.write(1.0-r);
    green.write(1.0-g);
    blue.write(1.0-b);

   // server.log ("RGB " + r +" "  + g +  " " + b);
}

function setLEDHandler(color) {
    server.log("Got a setLED message from the agent");

        // this is a bug in the video
    //setRGB(color.red, color.blue, color.green);

    setRGB(color.red, color.green, color.blue);
}

function runLED(){

  agent.on("info", function(t){
  server.log("tweetness is:" + t)
  info_val = t;
  });

  //server.log("tA  " + tA);

 rVal = 0.2;
 gVal = 0.8;
 bVal = 0.4;

  if (info_val==1){

  rVal = 1.0;
  gVal = 0.2;
  bVal = 0.2;



}

else if (info_val==0){
  rVal = 0.2;
  gVal = 0.8;
  bVal = 0.2;

}

  //server.log("rVal " + rVal);
  setRGB(rVal,gVal , bVal);
  //runLED();
  imp.wakeup(0.01, runLED);
}


runLED();