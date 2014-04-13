//Sends the pixel array to the strip
//Converts colors (red = 255) to 'bits' that WS2812 can understand
function updateStrip(){
 
    const ONBIT = 0xFC; //1.2 / .25us = 1.45us, 83% on time
    const OFFBIT = 0x80; //0.5 / .91us = 1.41us, 35% on time
 
    //Each pixel requires 24 bits
    //Each "bit" going to the WS2812 is actually a byte (0xFC or 0x80)
    stringData <- blob( (sizeOfStrip * 24) + 2);
    
    //The 0x00 at the beginning gets the SPI hardware working correctly
    //so that the first bit of actual data has proper timing
    stringData.writen(0x00, 'b');
 
    //Step through all the bytes in the pixel array, three bytes per pixel
    for(local j = 0 ; j < sizeOfStrip * 3; j++)
    {
        local myByte = pixels[j];
        
        //Convert this one part of a pixel (r g or b data) into ON/OFFBITs
        for(local i = 0 ; i < 8 ; ++i)
        {
            if(myByte & 0x80) 
                stringData.writen(ONBIT, 'b')
            else
                stringData.writen(OFFBIT, 'b');
            
            myByte = myByte << 1;
        }
    }
 
    //The 0x00 at the end will keep the data line low when done.
    stringData.writen(0x00, 'b');
 
    hardware.spi257.write(stringData);
}