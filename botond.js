var Twit = require('twit')

var pass = require('./pass.js')

var T = new Twit({
  consumer_key:         pass.consumer_key,
  consumer_secret:      pass.consumer_secret,
  access_token:         pass.access_token,
  access_token_secret:  pass.access_token_secret,
  timeout_ms:            60*1000,  //optional HTTP request timeout to apply to all requests.
})

var BME280 = require('node-bme280');
 
var barometer = new BME280({address: 0x76});
 
//ツイート用
function sendtweet(text){
	T.post('statuses/update',{status:text} ,function(err, data, response) {
	  console.log(data)
	})
}
//リプライ用
function replytweet(text,id,sname){
	T.post('statuses/update', {status: "@"+sname+" "+text , in_reply_to_status_id : id} ,function(err, data, response) {
	  console.log(data)
	})
}

//  stream a sample of public statuses

var stream = T.stream('user')
var num = 0
var username

//リプライ用
stream.on('tweet', function(tweet) {
  console.log(tweet.user.screen_name)
  console.log(tweet.text)
  //console.log(tweet.in_reply_to_screen_name)
  //console.log(tweet.in_reply_to_status_id_str)

  	if (reprly(tweet)){
		if(tweet.text.indexOf("温度" )!= -1){
			console.log("test");
			tweetbarometer(tweet);
		}
	}
})

function reprly(tweet){
	return tweet.in_reply_to_screen_name == "GameKawanishi"
}

function getTweetid(tweet){
	return tweet.id_str
}

function getname(tweet){
	return tweet.user.screen_name
}

function getTweetTxet(tweet){
	return tweet.text.replace(/@GameKawanishi/,"")
}

function tweetbarometer(tweet){
	 barometer.begin(function(err) {
   		if (err) {
      		console.info('error initializing barometer', err);
      		return;
    		} 
      barometer.readPressureAndTemparature(function(err, pressure, temperature, humidity){
			replytweet(pressure.toFixed(2)+"hPa\n"+temperature.toFixed(2)+"C\n"+humidity.toFixed(2)+"%",getTweetid(tweet),getname(tweet));
       		});
	})
}