'use strict';

const ModuleController = require('../service/module_controller');

const moduleController = new ModuleController();

moduleController.startDronePublisher();

moduleController.startDroneDBSyncronizer();

moduleController.startDroneService();

setTimeout( function() {
    console.log('**** STOPPING dronePublisher ****');
    moduleController.stopDronePublisher();
}, 20 * 1000);

setTimeout( function() {
    console.log('**** STOPPING droneDBSyncronizer ****');
    moduleController.stopDroneDBSyncronizer();
}, 30 * 1000);

setTimeout( function() {
    console.log('**** STOPPING droneService ****');
    moduleController.stopDroneService();
}, 40 * 1000);

setTimeout( function() {
    console.log('**** STOPPING droneManager ****');
    moduleController.stopDroneManager();
}, 50 * 1000);

