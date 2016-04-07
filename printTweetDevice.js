class Screen {
    port = null;
    lines = null;
    positions = null;

    constructor(_port) {
        port = _port;
        lines = ["booting...", ""];
        positions = [0, 0];
    }
    
    function set0(line) {
        lines[0] = line;
    }
    
    function set1(line) {
        lines[1] = line;
    }
    
    function clear_screen() {
        port.write(0xFE);
        port.write(0x01);
    }
    
    function cursor_at_line0() {
        port.write(0xFE);
        port.write(128);
    }
    
    function cursor_at_line1() {
        port.write(0xFE);
        port.write(192);
    }
    
    function write_string(string) {
        foreach(i, char in string) {
            port.write(char);
        }
    }
    
    function start() {
        update_screen();
    }
    
    function update_screen() {
        imp.wakeup(0.4, update_screen.bindenv(this));
        
        cursor_at_line0();
        display_message(0);
        
        cursor_at_line1();
        display_message(1);
    }
    
    function display_message(idx) {  
        local message = lines[idx];
        
        local start = positions[idx];
        local end   = positions[idx] + 16;
        
    
        if (end > message.len()) {
            end = message.len();
        }
    
        local string = message.slice(start, end);
        for (local i = string.len(); i < 16; i++) {
            string  = string + " ";
        }
    
        write_string(string);
    
        if (message.len() > 16) {
            positions[idx]++;
            if (positions[idx] > message.len() - 1) {
                positions[idx] = 0;
            }
        }
    }
}



// Register with the server
imp.configure("Serial Display", [], []);

// Configure the UART port
local port0 = hardware.uart57
port0.configure(9600, 8, PARITY_NONE, 1, NO_CTSRTS);

// Boot!
server.log("booting!");

// Allocate and start a screen
screen <- Screen(port0);
screen.clear_screen();
screen.start();

server.log("hellow world")
screen.set0("Hello"); // Write the first line
screen.set1("World"); // Write the second line


// Create a global variabled called 'led' and assign the 'pin9' object to it
// The <- is Squirrel’s way of creating a global variable and assigning its initial value
led <- hardware.pin1;
 
// Configure 'led' to be a digital output with a starting value of digital 0 (low, 0V)
led.configure(DIGITAL_OUT,0);
 
// Function called to turn the LED on or off
// according to the value passed in (1 = on, 0 = off)
function setLedState(state) {
    server.log("Set LED to state: " + state);
    led.write(state);
}

function showLastTweet(lastTweet){
    server.log("from: "+ lastTweet.tweeted_by);
    server.log("said: "+ lastTweet.text);
}

// Register a handler for incoming "set.led" messages from the agent
agent.on("set.led", setLedState);
agent.on("lastTweet", showLastTweet);
