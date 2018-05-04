'use strict';

const RedisNotifierService = require('../service/redis_notifier');

function onExpires(clientID) {
    console.log('EXPIRES clientID:', clientID);
}

const redisNotifierService = new RedisNotifierService(onExpires);