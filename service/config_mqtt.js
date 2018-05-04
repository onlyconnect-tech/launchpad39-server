'use strict';

const env = require('env2')('./.env');

const settings = {
	endpoint: process.env.SERVER_MQTT_ENDPOINT,
	accessKey: process.env.SERVER_MQTT_ACCESSKEY,
	secretKey: process.env.SERVER_MQTT_SECRETKEY,
	regionName: process.env.SERVER_MQTT_REGIONNAME
};

module.exports =  settings;  