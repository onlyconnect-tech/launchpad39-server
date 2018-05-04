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

    doRouteMessage(clientController, msg) {

        let queueName = MsgsUtils.getQueueNamePart(msg._topic);

        var msgPayload = msg._message.toString('utf8');

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

        } else  if (!objPayload) {
            console.warn('INVALID COMMANDS:', msgPayload);
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
            this.doRouteMessage(clientController, data);
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

class DroneService {

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
            topic: elem.id + '/commands'
        };

        this.operationManager.createMqttClient(connectOpts, mqttController);

    }

    doDisconnect(elem) {

        console.log('DOING DISCONNECT OF:', elem);

        var listClientControllers = mqttController.val;
        
        var index = 0;
        listClientControllers.forEach( function (clientController) {
          
            if(clientController.topicName === (elem.id + '/commands')){
                return;
            }

            index++;
        });

        var clientController = listClientControllers[index];
        clientController.disconnect();

        listClientControllers.splice(index, 1);

    }


}


module.exports = DroneService;

