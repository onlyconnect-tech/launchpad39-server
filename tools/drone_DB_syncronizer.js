'use strict';

const mqtt = require('./../lib/mqtt-lib.js');
const configMqtt = require('./../service/config_mqtt');
const DroneInfo = require('./../model/drone_info');
const MsgsUtils = require('./../util/msgs_utils');
const mqttController = new mqtt.ClientControllerCache();
const droneInfoDB = new DroneInfo();

/**
 * 
 * Process incoming messages.
 * @param  {Object} msg - message received on subscribed topics
 * @return {void} 
 */

  function doRouteMessage(msg) {

    if(MsgsUtils.checkIfTelemetry(msg._topic)) {

        // get queue name
        let queueName = MsgsUtils.getQueueNamePart(msg._topic);
        var objPayload = MsgsUtils.doParsingIoTPayloadTelemetry(msg._message.toString('utf8'));

        if(objPayload && objPayload.location) {
          // lat, lon, alt, roll, pitch, yaw

            var droneInfo = {};

            droneInfo.lat = objPayload.location.global.lat;
            droneInfo.lon = objPayload.location.global.lon;
            droneInfo.alt = objPayload.location.global.alt;

            droneInfo.groundspeed = objPayload.location.groundspeed;

            droneInfo.yaw = objPayload.attitude.yaw;
            droneInfo.roll = objPayload.attitude.roll;
            droneInfo.pitch = objPayload.attitude.pitch;

            droneInfoDB.insertDroneStatus(queueName, droneInfo.lat, droneInfo.lon, droneInfo.alt,
              droneInfo.groundspeed, droneInfo.yaw, droneInfo.roll, droneInfo.pitch)
            .then( function resolve() {
                console.log('INSERT DONE --> queueName:', queueName, '-', droneInfo);
              }, function reject(err) {
                  console.error('ERROR INSERT --> queueName:', queueName, '-', droneInfo, ' - ', err);
              });       

        
        } else {
          // stange situation: invalid format

        }
      } else if (MsgsUtils.checkIfCommands(msg._topic)) {

          let queueName = MsgsUtils.getQueueNamePart(msg._topic);
          console.log('<<-- RECEIVED COMMAND:', queueName, msg._message.toString('utf8'));

          // emit comman event: queueName, payloadString
          
      }
        
  
}


function createMqttClient(connectOpts, mqttController) {

  var cbs = {
    onConnect: onConnect,
    onSubSuccess: onSubSuccess,
    onMessageArrived: onMessageArrived,
    onConnectionLost: onConnectionLost
  };

  var clientController = mqttController.getClient(connectOpts, cbs);

  function onConnect() {

    clientController.subscribe();
    console.log('*** DONE SUBSCRIBED:', connectOpts.topic);

  }

  function onMessageArrived(data) {
    doRouteMessage(data);
  }

  function onSubSuccess() {
    console.log('SUCCESSS!!!!');

  }

  function onConnectionLost() {
    // do nothing
    console.log('CONNECTION LOST!!!');
  }
}

droneInfoDB.getListDroneInfoAll()
        .then( function resolve(listDroneInfo) {

            listDroneInfo.forEach( function( elem ) {

              var connectOpts1 = {
                  accessKey: configMqtt.accessKey,
                  clientId: `${Math.random().toString(36).substring(2,12)}`,      // 10-bit random string
                  endpoint: configMqtt.endpoint,
                  secretKey: configMqtt.secretKey,
                  // sessionToken: params.sessionToken,
                  regionName: configMqtt.regionName,
                  topic: elem.queue_name + '/+'
                };

                createMqttClient(connectOpts1, mqttController);

            });

        }, function reject(err){
            console.error('ERROR:', err);
        });


