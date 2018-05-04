'use strict';

const mqtt = require('./../lib/mqtt-lib.js');
const configMqtt = require('./../service/config_mqtt');
const DroneInfo = require('./../model/drone_info');
const mqttController = new mqtt.ClientControllerCache();

function createMqttClient(connectOpts, simOpts, mqttController, clientName) {

  var cbs = {
    onConnect: onConnect.bind(null, clientName),
    onSubSuccess: onSubSuccess,
    onMessageArrived: onMessageArrived,
    onConnectionLost: onConnectionLost
  };

  var clientController = mqttController.getClient(connectOpts, cbs);

  /**
   * [doOperation description]
   * @param  {boolean} single - if 'true', only one send, otherwise repeat
   * @return {void}        [description]
   */
  
  function doOperation(clientName) {

      var droneInfo = new DroneInfo();

      var interval = setInterval(() => {

        droneInfo.getListDroneInfoByCustomerID(clientName)
        .then(function resolve(listDroneInfo) {

            var queues = [];  
            
            listDroneInfo.forEach( function( elem ) {
              queues.push({ id: elem.queue_name, type: elem.drone_type });
            });

            console.log('PUBLISHING queues:', queues, new Date());
            clientController.publish(queues);

        }, function reject(err){
            console.error('ERROR:', err);
        });
      }, simOpts.interval);

  }

  function onConnect(clientName) {

    console.log('ON_CONNECT:', clientName);

    // clientController.subscribe();
    doOperation(clientName);

  }

  function onMessageArrived(data) {
    // do nothing
  }

  function onSubSuccess() {
    

  }

  function onConnectionLost() {
    // do nothing
    
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

let connectOpts = {
    accessKey: configMqtt.accessKey,
    clientId: `${Math.random().toString(36).substring(2,12)}`,      // 10-bit random string
    endpoint: configMqtt.endpoint,
    secretKey: configMqtt.secretKey,
    // sessionToken: params.sessionToken,
    regionName: configMqtt.regionName,
    topic: '/vehicles/' + clientName 
  };

let simOpts = {
  interval: 5000
};

createMqttClient(connectOpts, simOpts, mqttController, clientName);


