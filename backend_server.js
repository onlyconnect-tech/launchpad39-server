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
const droneInfo = new DroneInfo();
 
function onConnect() {
    
    console.log('SONO ON CONNECT')

    clientController.subscribeByTopic('/request-vehicles/+');
    clientController.subscribeByTopic('/+/commands');
 }

function doProcessRequestsVehiclesRequest(topicRequest) {

    var topicParts = topicRequest.split('/');

    var customerID = topicParts[topicParts.length -1];

    console.log(customerID);

    droneInfo.getListDroneInfoByCustomerID(customerID)
    .then( function resolve(listDroneInfo) {
        var queues = [];

        listDroneInfo.forEach( function( elem ) {
            queues.push({ id: elem.queue_name, type: elem.drone_type });
        });

        return queues;
        }, function reject(err){
            console.error('ERROR:', err);
        }).then(function resolve(queues){
            console.log("queues:", queues)
            clientController.publishByTopic('/vehicles/' + customerID, queues);

        });
}

function doPreocessHistoryRequest(queueName) {

    // send history
    console.log('ASKING FOR HISTORY:', queueName);

    /*
    {"jsonrpc":"2.0","method":"history-response", "values": [ [], [], [], .....]}
    */

    //ask for a client from the pool

    droneInfo.getDroneHistoryStatus(queueName).then( function resolve(results) {
    
        var values =  results.values;
        var lastRecord = results.lastRecord;

        var response = { jsonrpc: '2.0', method: 'history-response', values: values, lastRecord: lastRecord };

        console.log('<<-- PUBLISHING:', response, ' ON QUEUE:', queueName);

        clientController.publishByTopic(queueName + "/commands", response);

        }, function reject(err) {

        console.error(err);

    });

      

}

function onMessageArrived(data) {
    
    var msgPayload = data._message.toString('utf8');
    var topic = data._topic;

    console.log('MSG ARRIVE >>', topic , " - ", msgPayload)
    // check if request-vehicles or history commands

    if(topic.startsWith('/request-vehicles/')) {
        doProcessRequestsVehiclesRequest(topic)
    } else if (topic.endsWith('/commands')) {

        let queueName = MsgsUtils.getQueueNamePart(topic);

        var objPayload = null;
        
        try {
            objPayload = JSON.parse(msgPayload);
        } catch( excep){
            console.error('ON payload:', msgPayload, '- eror:', excep);
        }
        

        /*
        {"jsonrpc":"2.0","method":"history" }
        */
        if(objPayload && objPayload.method === 'history') {
            doPreocessHistoryRequest(queueName)
        }

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


