'use strict';

const logger = require('./service/log_service');

const ModuleControllerDBSyncronizer = require('./service/module_controller_DB_syncronizer');

const moduleController = new ModuleControllerDBSyncronizer();

moduleController.startDroneDBSyncronizer();





