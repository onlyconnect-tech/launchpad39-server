'use strict';

var redis = require('redis');

var RedisNotifier = require('redis-notifier');

require('env2')('./.env');

var url   = require('url');

var rc; // redis config
if (process.env.REDISCLOUD_URL) {
  var redisURL = url.parse(process.env.REDISCLOUD_URL);
  rc = {
    port: redisURL.port,
    host: redisURL.hostname
    // auth: redisURL.auth.split(":")[1]
  };

  if(redisURL.auth) {
    rc.auth = redisURL.auth.split(":")[1];
  }
}
else {
  rc =  {
    port: 6379,
    host: '127.0.0.1'
    // auth: '' no auth on localhost see: https://git.io/vH3TN
  }
}

var eventNotifier = new RedisNotifier(redis, {
  redis : { host : rc.host, port : rc.port },
  expired : true,
  evicted : true,
  logLevel : 'DEBUG' //Defaults To INFO 
});
 
class RedisNotifierService {

    constructor(onExpiredCallback) {
        this.onExpiredCallback = onExpiredCallback;
        
        var self = this;

        //Listen for event emission 
        eventNotifier.on('message', function(pattern, channelPattern, emittedKey) {
            var channel = this.parseMessageChannel(channelPattern);
            switch(channel.key) {
            case 'expired':
                console.log('EXPIRED:', emittedKey);
                self.onExpiredCallback(emittedKey);
                break;
            case 'evicted':
                console.log('EVICTED:', emittedKey);
                // this._handleEvicted(emittedKey);
                break;
            default:
                console.log('Unrecognized Channel Type:', channel.type);
            }
        });


    }


}

module.exports = RedisNotifierService;
