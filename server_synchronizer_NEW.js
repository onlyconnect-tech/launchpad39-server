'use strict';

const Promise = require('bluebird');

const logger = require('./service/log_service');
const mqtt = require('./lib/mqtt-lib.js');
const configMqtt = require('./service/config_mqtt');
const DroneInfo = require('./model/drone_info');
const MsgsUtils = require('./util/msgs_utils');


var connectOpts = {
    accessKey: configMqtt.accessKey,
    clientId: `${Math.random().toString(36).substring(2,12)}`,      // 10-bit random string
    endpoint: configMqtt.endpoint,
    secretKey: configMqtt.secretKey,
    // sessionToken: params.sessionToken,
    regionName: configMqtt.regionName
  };

 const mqttController = new mqtt.ClientControllerCache();

  var cbs = {
    onConnect: onConnect,
    onSubSuccess: onSubSuccess,
    onMessageArrived: onMessageArrived,
    onConnectionLost: onConnectionLost
};

const clientController = mqttController.getClient(connectOpts, cbs);
const droneInfoDB = new DroneInfo();
 
function onConnect() {
    
    console.log('SONO ON CONNECT')

    clientController.subscribeByTopic('/+/telemetry');
 }

 function doSaveTelemetry(queueName, objPayload) {

     if(objPayload && objPayload.location) {
       // lat, lon, alt, roll, pitch, yaw
 
       console.log('SINCRONIZING ON DB for queue:', queueName, '- values: ', objPayload.location);
 
       var droneInfo = {};
 
       droneInfo.lat = objPayload.location.global.lat;
       droneInfo.lon = objPayload.location.global.lon;
       droneInfo.alt = objPayload.location.global.alt;
 
       droneInfo.groundspeed = objPayload.groundspeed;
 
       droneInfo.yaw = objPayload.attitude.yaw;
       droneInfo.roll = objPayload.attitude.roll;
       droneInfo.pitch = objPayload.attitude.pitch;
 
       droneInfoDB.insertDroneStatus(queueName, droneInfo.lat, droneInfo.lon, droneInfo.alt,
         droneInfo.groundspeed, droneInfo.yaw, droneInfo.roll, droneInfo.pitch)
         .then( function resolve() {
             console.log('INSERT DONE --> queueName:', queueName, '-', droneInfo);
           }, function reject(err) {
             console.error('ERROR INSERT --> queueName:', queueName, '-', droneInfo, ' - ERR:', err);
           });       
 
     
     } else {
       // stange situation: invalid format
 
     }
   
   }

function onMessageArrived(data) {
    
    var objPayload = MsgsUtils.doParsingIoTPayloadTelemetry(data._message.toString('utf8'));
    var topic = data._topic;

    console.log('MSG ARRIVE >>', topic , " - ", objPayload)
    // check if request-vehicles or history commands

    if (topic.endsWith('/telemetry')) {

        let queueName = MsgsUtils.getQueueNamePart(topic);

        if(objPayload)
           doSaveTelemetry(queueName, objPayload);

    } else {
        console.log('ANOTHER TOPIC')
    }

    


}

function onSubSuccess() {
  
    console.log('SONO ON SUB SUCCESS')
}

function onConnectionLost() {
  // do nothing
  console.log('SONO ON CONNECT')
}


