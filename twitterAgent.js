/* AGENT CODE
* ----------
* I've ommited the Twitter Class + creating a global twitter variable from this example
* to save some space - if you're copy/pasting code, make sure you grab the code from
* the TwitterClass file in this gist
*/

// Class for searching twitter
// No comments (see other files in gist for explanation)
// Expanded criteria for search (everything is optional except query)
// see twitter documentation for more info on parameters and return data:
// https://dev.twitter.com/docs/api/1/get/search

// dateParse
// calculate the number of seconds since 01.01.1970 for a date taken frmo twitter
// can't find absolute value function  - abs(x) isn't found - so manually adding leap year days
function s2i(s){

 i<-s.tochar();
 i<-i.tointeger();

  return i;
}

function dateParse(date){

 // days since 01.01.1970
 // grab year
 y<-s2i(date[29])+(s2i(date[28])*10)+(s2i(date[27])*100)+(s2i(date[26])*1000);
 y<-y-1970;
 month<-date[4].tochar() + date[5].tochar() + date[6].tochar();
  if (month == "Jan")
  {
    days<-0; // number of days passed since year began
  }
  if (month == "Feb")
  {
    days <- 31;
  }
  if (month == "Mar")
  {
    days <- 59;
  }
  if (month == "Apr")
  {
    days == 90;
  }
  if (month == "May")
  {
    days <- 120;
  }
  if (month == "Jun")
  {
    days <- 151;
  }
  if (month == "Jul")
  {
    days <- 181;
  }
  if (month == "Aug")
  {
    days <- 212;
  }
  if (month == "Sep")
  {
    days <- 243;
  }
  if (month == "Oct")
  {
    days <- 273 ;
  }
  if (month == "Nov")
   {
     days<-304; // or 305 if a leap year
   }
  if (month == "Dec")
  {
    days <- 334 ;
  }
  // add on the days this month
  v<-s2i(date[9])+(s2i(date[8])*10);
  days<-days+v;

  // now total days since 1970 excluding leap years
  days<-days+(y*365);
  days<-days+10; // a big fudge because no absolute value function working...
  s<-days*24*60*20;

  // add leap years - (int)((y-2)/4)  // see above
  sT<-(((s2i(date[11])*10)+(s2i(date[12])))*3600) + (((s2i(date[14])*10)+(s2i(date[15])))*60) + ((s2i(date[17])*10) + (s2i(date[18])));
  s<-s+sT;
  return s;

}

class TwitterClient {
    consumerKey = null
    consumerSecret = null
    auth = null;
    baseUrl = "https://api.twitter.com/1.1/";
    constructor (_consumerKey, _consumerSecret) {
        this.consumerKey = _consumerKey;
        this.consumerSecret = _consumerSecret;
        this.auth = getApplicationAuth();
    }
    /************************************************************
    * Gets an application authentication token
    * returns:
    * string: token if auth was successful
    * null: if auth was unsuccessful
    ************************************************************/
    function getApplicationAuth() {
        local authURL = "https://api.twitter.com/oauth2/token"
        local authRequestBody = "grant_type=client_credentials";

        //local credentials = consumerKey + ":" + consumerSecret;

        local credentials = "jdOw7R5GFvT5yB1b5UNcz4qNX"+ ":" + "BCbKdlYvVcyCGqblZVA5PybPvVp5rncyQXYEYMKMNxQ56PWWTo";
        local encodedCredentials = http.base64encode(credentials);

        local headers = {
            "Authorization": "Basic " + encodedCredentials,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        }
        server.log("Getting Authorization from Twitter..");
        local response = http.post(authURL, headers, authRequestBody).sendsync();
        if (response.statuscode != 200) {
            server.log("Error Authenticating: " + response.body);
            return null;
        }
        local data = {};
        try {
            data = http.jsondecode(response.body);
        } catch(ex) {
            server.log("Error parsing response body to JSON: " + response.body);
            return null;
        }
        if (!("token_type" in data)) {
           server.log("Response body missing token_type: " + response.body);
           return null;
        } else if (data.token_type != "bearer") {
            server.log("Error: token_type not 'bearer': " + body.token_type);
             return null;
        }else if (!("access_token" in data)) {
            server.log("Error: response body missing access_token: " + response.body);
            return null;
        }
        server.log("Got it!");
        return "Bearer " + data.access_token;
    }
    /************************************************************
     * Searches Twitter and returns results
     * returns:
     *    table: a table with tweet information if successful (see https://dev.twitter.com/docs/api/1.1/get/search/tweets)
     *    null: if there was an error searching
    ************************************************************/
    function search(query, count = null, since_id = null, geocode = null) {
        local requestUrl = baseUrl + "search/tweets.json";
        requestUrl += "?" + http.urlencode({ q = query });
        if (count != null) requestUrl += "&count=" + count;
        if (since_id != null) requestUrl += "&since_id=" + since_id;
        if (geocode != null && "latitude" in geocode && "longitude" in geocode && "radius" in geocode) requestUrl += "&geocode=" + geocode.latitude + "," + geocode.longitude + "," + geocode.radius;

        local headers = { "Authorization": this.auth };

        local response = http.get(requestUrl, headers).sendsync();
        if (response.statuscode != 200) {
            server.log("Error searching tweets. HTTP Status Code " + response.statuscode);
            server.log(response.body);
            return null;
        }
        local tweets = {};
        try {
            tweets = http.jsondecode(response.body);
            return tweets;
        }catch(ex) {
            server.log("Error parsing response from twitter search: " + response.body);
            return null;
        }
    }
}
// Create a global variable that we can use anywhere in our agent
twitter <- TwitterClient("YOUR_CONSUMER_KEY", "YOUR_CONSUMER_SECRET");
old_time <- null;
current_time <- null;
lightval <- null;

// This is a trick that lets us call a function with parameters as a callback for a function that expects no parameters
function PollTwitterWrapper(pollTime, query, count = null,  geocode = null) {
    return function() { PollTwitter(pollTime, query, count, geocode); };
}

// The actual function that searches twitter and sends tweets to the device
// A tremendous amount of information is returned per tweet - enough that it
// can crash the device if we try to send EVERYTHING to it in the device.send call.
// That's why we create a new list of tweets that ONLY contains the information we want
function PollTwitter(pollTime, query, count = null, geocode = null) {


    local tweets = twitter.search(query, count, geocode);
    if ("statuses" in tweets && tweets.statuses.len() > 0) {
        local tweetData = [];

        foreach (tweet in tweets.statuses) {
            tweetData.push({
                id = tweet.id_str,
                text = tweet.text,
                tweeted_by = "@" + tweet.user.screen_name,
                created_at = tweet.created_at,
                coordinates = tweet.coordinates
            });
            current_time = tweet.created_at;
            if (current_time != 0) {
                if (current_time != old_time) {
                    server.log("tweet: " +  tweet.text + tweet.created_at);
                    lightval = 1;
                    old_time = current_time;
                } else { server.log("no new tweets");
                    lightval = 0;
                }
            }
        }

    device.send("set.led", lightval);
    if(tweetData.len()>0){
        local lastTweetPos = tweetData.len() - 1;
        device.send("lastTweet", tweetData[lastTweetPos]);
    }
    


    }
  //  if ("search_metadata" in tweets && "max_id_str" in tweets.search_metadata) {
  //  since_id = tweets.search_metadata.max_id_str;
   // }

    imp.wakeup(pollTime, PollTwitterWrapper(pollTime, query, count, geocode));
  //  device.send("tweetivity", td );
}

PollTwitter(30 , "@Lazeransidhe", 1);
