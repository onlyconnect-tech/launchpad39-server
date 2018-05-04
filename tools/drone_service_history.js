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

  function doRouteMessage(clientController, msg) {

     if (MsgsUtils.checkIfCommands(msg._topic)){

          let queueName = MsgsUtils.getQueueNamePart(msg._topic);

          var msgPayload = msg._message.toString('utf8');

          var objPayload = JSON.parse(msgPayload);
/*
{"jsonrpc":"2.0","method":"history" }
*/
          if(objPayload.method === 'history') {
            // send history
            console.log('ASKING FOR HISTORY:', queueName);

/*
{"jsonrpc":"2.0","method":"history-response", "values": [ [], [], [], .....]}
*/

            //ask for a client from the pool

          droneInfoDB.getDroneHistoryStatus(queueName).then( function resolve(results) {
                
                var values =  results.values;
                var lastRecord = results.lastRecord;

                var response = { jsonrpc: '2.0', method: 'history-response', values: values, lastRecord: lastRecord };

                console.log('<<-- PUBLISHING:', response, ' ON QUEUE:', queueName);

                clientController.publish(response);

                }, function reject(err) {

                  console.error(err);

                });

         }

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
    doRouteMessage(clientController, data);
  }

  function onSubSuccess() {
    console.log('SUCCESSS!!!!');

  }

  function onConnectionLost() {
    // do nothing
    console.log('CONNECTION LOST!!!');
  }
}

var argv = require('yargs').argv;

var arrArguments = argv._;

if(arrArguments.length === 0) {
  console.error('ERROR: missing CLIENT_NAME');  
  process.exit(1);
} 

var clientName = arrArguments[0];
console.log(`CLIENT_NAME: %s`, clientName);

droneInfoDB.getListDroneInfoByCustomerID(clientName)
        .then( function resolve(listDroneInfo) {

            listDroneInfo.forEach( function( elem ) {

              var connectOpts1 = {
                  accessKey: configMqtt.accessKey,
                  clientId: `${Math.random().toString(36).substring(2,12)}`,      // 10-bit random string
                  endpoint: configMqtt.endpoint,
                  secretKey: configMqtt.secretKey,
                  // sessionToken: params.sessionToken,
                  regionName: configMqtt.regionName,
                  topic: elem.queue_name + '/commands'
                };

                createMqttClient(connectOpts1, mqttController);

            });

            if(listDroneInfo.length == 0) {
              process.exit();
            }
        }, function reject(err){
            console.error('ERROR:', err);
        });

