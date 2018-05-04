'use strict';

const mqtt = require('./../lib/mqtt-lib.js');
const configMqtt = require('./config_mqtt');

const DroneInfo = require('./../model/drone_info');

const MsgsUtils = require('./../util/msgs_utils');
const ArrayUtils = require('./../util/array_utils');

const mqttController = new mqtt.ClientControllerCache();

const droneInfoDB = new DroneInfo();

function indexOfObjectConstructor() {

  function comparator(elemA, elemB){
    if(elemA.id === elemB.id){
      return true;
    }
    return false;
  }

  return ArrayUtils.buildIndexOf(comparator);

}

class OperationManager {

/**
 * 
 * Process incoming messages.
 * @param  {Object} msg - message received on subscribed topics
 * @return {void} 
 */

  doRouteMessage(msg) {

   // get queue name
    let queueName = MsgsUtils.getQueueNamePart(msg._topic);
    var objPayload = MsgsUtils.doParsingIoTPayloadTelemetry(msg._message.toString('utf8'));

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


    createMqttClient(connectOpts, mqttController) { 

        var cbs = {
            onConnect: onConnect,
            onSubSuccess: onSubSuccess,
            onMessageArrived: onMessageArrived.bind(this),
            onConnectionLost: onConnectionLost
        };

        var clientController = mqttController.getClient(connectOpts, cbs);

        function onConnect() {

            clientController.subscribe();
            console.log('*** DOING SUBSCRIBE:', connectOpts.topic);

        }

        function onMessageArrived(data) {
            this.doRouteMessage(data);
        }

        function onSubSuccess() {
            console.log('*** SUCCESS SUBSCRIBE:', connectOpts.topic);
        }

        function onConnectionLost() {
            // do nothing
            console.log('*** CONNECTION LOST:', connectOpts.topic);
        }

        return clientController;

    }

}

class DroneDBSyncronizer {

    constructor(droneManager) {
        this.queues = [];
        this.droneManager = droneManager;
        this.operationManager = new OperationManager();
    }

    startWork() {
        
        this.droneManager.addListener(this);

        var listQueues = this.droneManager.getListQueues();
        console.log('START LIST_QUEUES:', listQueues);

        listQueues.forEach( function( elem ) {

            this.queues.push(elem);

            console.log(elem);

            var connectOpts = {
                accessKey: configMqtt.accessKey,
                clientId: `${Math.random().toString(36).substring(2,12)}`,      // 10-bit random string
                endpoint: configMqtt.endpoint,
                secretKey: configMqtt.secretKey,
                // sessionToken: params.sessionToken,
                regionName: configMqtt.regionName,
                topic: elem.id + '/telemetry'
              };

            this.operationManager.createMqttClient(connectOpts, mqttController);

        }, this);
    
    }

    doCheck(actualQueues) {

        ArrayUtils.renderSame(actualQueues, this.queues, indexOfObjectConstructor(), 
            this.doDisconnect.bind(this), this.doConnection.bind(this));
    }

    stopWork() {
        // rimuovi dalgli osservatori
        this.droneManager.removeListener(this);

        var listClientControllers = mqttController.val;

        listClientControllers.forEach( function (clientController) {
            clientController.disconnect();
        });
    }

    doConnection(elem) {
        var connectOpts = {
            accessKey: configMqtt.accessKey,
            clientId: `${Math.random().toString(36).substring(2,12)}`,      // 10-bit random string
            endpoint: configMqtt.endpoint,
            secretKey: configMqtt.secretKey,
            // sessionToken: params.sessionToken,
            regionName: configMqtt.regionName,
            topic: elem.id + '/telemetry'
        };

        this.operationManager.createMqttClient(connectOpts, mqttController);

    }

    doDisconnect(elem) {

        console.log('DOING DISCONNECT OF:', elem);

        var listClientControllers = mqttController.val;
        
        var index = 0;
        listClientControllers.forEach( function (clientController) {
          
            if(clientController.topicName === (elem.id + '/telemetry')){
                return;
            }

            index++;
        });

        var clientController = listClientControllers[index];
        clientController.disconnect();

        listClientControllers.splice(index, 1);

    }


}


module.exports = DroneDBSyncronizer;

