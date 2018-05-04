'use strict';

const DroneInfo = require('./../model/drone_info');
const DronePublisher = require('./module_drone_publisher');
const DroneServiceHistory = require('./module_drone_service_history');

class DroneManager {

    constructor(customerID){
        this.customerID = customerID;
        this.queues = [];
        this.callOnInit = [];
        this.listCallbackOnAddClient = [];
        this.listCallbackOnRemoveClient = [];

        this.intervalID = null;
        
        this.droneInfo = new DroneInfo();
        this.loadListQueueFromDB(customerID);

        this.listeners = [];

    }

    addListener(module) {
        this.listeners.push(module);
    }

    removeListener(module) {
        var index = this.listeners.indexOf(module);
        console.log('remove module index:', index);
        this.listeners.splice(index, 1);
    }

    loadListQueueFromDB(customerID) {

        var self = this;

        this.droneInfo.getListDroneInfoByCustomerID(customerID)
            .then( function resolve(listDroneInfo) {
            var queues = [];

            listDroneInfo.forEach( function( elem ) {
                queues.push({ id: elem.queue_name, type: elem.drone_type });
            });

            this.updateQueueList(queues);

        }.bind(this), function reject(err){
            console.error('ERROR:', err);
        });

        // periodic check on status queue

        this.intervalID = setInterval( function doCheck() {

            var queueNew = [];
            // initalizeQueue
            self.droneInfo.getListDroneInfoByCustomerID(customerID)
                .then( function resolve(listDroneInfo) {

                    listDroneInfo.forEach( function( elem ) {
                        queueNew.push({ id: elem.queue_name, type: elem.drone_type });
                    });

                    // checkDifference
                    self.updateQueueList(queueNew);

                }, function reject(err){
                    console.error('ERROR:', err);
                });

        }, 5000);
    }

    updateQueueList(listQueues) {

        console.log('>>> listQueues::', listQueues, new Date());

        // for method getListQueues
        this.queues = listQueues;

        this.listeners.forEach( function (module) {
            module.doCheck(listQueues);
        });

        // do comparation
        // eventi add e eventi remove

        // scorre le callback
    }

    getListQueues() {
        return this.queues;
    }

    doCallOnInit(callback) {
        this.callOnInit.push(callback);
    }

    doCallOnAddClient(callback){
        this.listCallbackOnAddClient.push(callback);
    }

    doCallOnRemoveClient(callback){
        this.listCallbackOnRemoveClient.push(callback);
    }

    stopWork() {
        clearInterval(this.intervalID);
    }


}

class ModuleController {

    constructor(customerID) {
    
        this.droneManager = new DroneManager(customerID);
        this.dronePublisher = null;
        this.droneServiceHistory = null;
    }

    startDronePublisher() {
        this.dronePublisher = new DronePublisher(this.droneManager);
        this.dronePublisher.startWork(); 
    }

    stopDronePublisher() {
        if (this.dronePublisher) {
            this.dronePublisher.stopWork(); 
        }
       
    }

    startDroneServiceHistory() {
        this.droneServiceHistory = new DroneServiceHistory(this.droneManager);
        this.droneServiceHistory.startWork();   
    }

    stopDroneServiceHistory() {
        if(this.droneServiceHistory) {
            this.droneServiceHistory.stopWork();
        } 
    }


    stopDroneManager() {
        this.droneManager.stopWork();
    }

}

module.exports = ModuleController;

