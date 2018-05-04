'use strict';

const mqtt = require('./../lib/mqtt-lib.js');
const configMqtt = require('./config_mqtt');



class OperationManager {

    constructor(connectOpts, simOpts, mqttController, droneManager) {
        this.connectOpts = connectOpts;
        this.simOpts = simOpts;
        this.mqttController = mqttController;
        this.droneManager = droneManager;

        this.clientController = null;
        this.intervalID = null;
    }

    /**
    * [doOperationPublishListVehicles description]
    * @param  {boolean} single - if 'true', only one send, otherwise repeat
    * @return {void}       
    */
  
    doOperationPublishListVehicles() {

        var self = this;

        var intervalID = setInterval(() => {

            var listQueues = self.droneManager.getListQueues();

            console.log('PUBLISHING queues:', listQueues, new Date());
              
            if (self.clientController) {
                self.clientController.publish(listQueues);
            }

        }, self.simOpts.interval);

        this.intervalID = intervalID;

    }


    startWork() {

        var cbs = {
            onConnect: onConnect.bind(this),
            onSubSuccess: onSubSuccess,
            onMessageArrived: onMessageArrived,
            onConnectionLost: onConnectionLost
        };

        this.clientController = this.mqttController.getClient(this.connectOpts, cbs);

        
        function onConnect() {

            this.doOperationPublishListVehicles();

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

    stopWork() {
      
        if(this.intervalID) {
            clearInterval(this.intervalID);
        }

        this.mqttController.removeClient(this.clientController);
        console.log('After remove client!!!');   
        
    }

}

class DronePublisher {

  constructor(droneManager) {

    console.log('DronePublisher on queue customerName: ', droneManager.customerID);
    this.droneManager = droneManager;
    this.operationManager = null;    

    var connectOpts = {
      accessKey: configMqtt.accessKey,
      clientId: `${Math.random().toString(36).substring(2,12)}`,      // 10-bit random string
      endpoint: configMqtt.endpoint,
      secretKey: configMqtt.secretKey,
      // sessionToken: params.sessionToken,
      regionName: configMqtt.regionName,
      topic: '/vehicles/' + droneManager.customerID
    };

    var simOpts = {
      interval: 5000
    };

    const mqttController = new mqtt.ClientControllerCache();

    this.operationManager = new OperationManager(connectOpts, simOpts, mqttController, droneManager);

  }

  startWork() {
    this.operationManager.startWork();
  }

  stopWork() {
    
    console.log('CALL STOP WORK!!!');

    if(this.operationManager) {
      console.log('***** CALL STOP WORK!!!');
      this.operationManager.stopWork();
    }

    
  }




}

module.exports = DronePublisher;