'use strict';

require('env2')('./.env');

class RedisService {

    constructor(callbackOnLoginCustomer, callbackOnLogoutCustomer, logger) {

        this.callbackOnLoginCustomer = callbackOnLoginCustomer;
        this.callbackOnLogoutCustomer = callbackOnLogoutCustomer;
        this.logger = logger;

        var self = this;

        var redisSub = require('redis-connection')('subscriber');

        redisSub.on('connect', log('connect'));
        redisSub.on('ready', log('ready'));
        redisSub.on('reconnecting', log('reconnecting'));
        redisSub.on('error', logError('error'));
        redisSub.on('end', log('end'));

        function log(type) {
            return function () {
                self.logger.debug(type, arguments);
            };
        }

        function logError(type) {
            return function () {
                self.logger.error(type, arguments);
            };
        }

        redisSub.subscribe('clients:login:new', 'clients:login:out');

        redisSub.on('message', function (channel, message) {

            if (channel === 'clients:login:new') {
                self.callbackOnLoginCustomer(message);
                return;
            }

            if (channel === 'clients:login:out') {
                self.callbackOnLogoutCustomer(message);
                return;
            }

        });

    }
}

module.exports = RedisService;