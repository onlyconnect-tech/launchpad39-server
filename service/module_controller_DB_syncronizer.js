'use strict';

const DroneInfo = require('./../model/drone_info');
const DroneDBSyncronizer = require('./module_drone_DB_syncronizer');

class DroneManager {

    constructor(){
        this.queues = [];
        this.callOnInit = [];
        this.listCallbackOnAddClient = [];
        this.listCallbackOnRemoveClient = [];

        this.intervalID = null;
        
        this.droneInfo = new DroneInfo();
        this.loadListQueueFromDB();

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

    loadListQueueFromDB() {

        var self = this;

        this.droneInfo.getListDroneInfoAll()
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
            self.droneInfo.getListDroneInfoAll()
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

class ModuleControllerDBSyncronizer {

    constructor() {
    
        this.droneManager = new DroneManager();
        this.droneDBSyncronizer = null;
    }

    startDroneDBSyncronizer() {
        this.droneDBSyncronizer = new DroneDBSyncronizer(this.droneManager);
        this.droneDBSyncronizer.startWork(); 
    }

    stopDroneDBSyncronizer() {
        if (this.droneDBSyncronizer) {
            this.droneDBSyncronizer.stopWork();
        }
        
    }

    stopDroneManager() {
        this.droneManager.stopWork();
    }

}

module.exports = ModuleControllerDBSyncronizer;

