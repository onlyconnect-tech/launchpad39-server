'use strict';

const logger = require('./service/log_service');

const ModuleController = require('./service/module_controller');

const RedisService = require('./service/redis_service');

const RedisNotifierService = require('./service/redis_notifier');

const Sessions = require('./model/sessions');

// first module controller for demo

//  ['demo', 'AAA', 'BBB']

// default client for demo

var listClientNames = ['demo'];

var mapClients = new Map();
var mapClientsCounter = new Map();

const sessions = new Sessions();

function onLogin(customerID) {
    logger.log('****************************');
    logger.log('**** <<<<<------ LOGIN: ', customerID);

    if (!mapClients.has(customerID)) {
        logger.log('info', '***************************');
        logger.log('info', '******** ModuleController: customerName: ' + customerID + ' * ');
        logger.log('info', '***************************');

        const moduleController = new ModuleController(customerID);

        moduleController.startDronePublisher();

        moduleController.startDroneServiceHistory();

        mapClients.set(customerID, moduleController);
        mapClientsCounter.set(customerID, 1);
    } else {
        // increment by 1
        logger.log('INCREMENT COUNTER!!');

        let counter = mapClientsCounter.get(customerID);
        counter++;
        mapClientsCounter.set(customerID, counter);
    }
    

}

function onLogout(customerID) {
    logger.log('****************************');
    logger.log('**** LOGOUT: ', customerID,' ------>>>>');

    const moduleController = mapClients.get(customerID);

    if(moduleController) {
        let counter = mapClientsCounter.get(customerID);
        
        logger.log('COUNTER:', counter);

        if(counter == 1) {
            logger.log('STOPPING MODULE_CONTROLLER');
            // stop module controller
            moduleController.stopDroneManager();
            
            moduleController.stopDronePublisher();

            moduleController.stopDroneServiceHistory();

            mapClients.delete(customerID);
            mapClientsCounter.delete(customerID);
        } else {
            // decrement counter
            logger.log('DECREMENTING COUNTER');
            counter--;
            mapClientsCounter.set(customerID, counter);
        }
    }

}

function onExpires(clientID) {
    sessions.getOwnerCodeBySession(clientID).then( function resolve(session) {
        var customerID = session.owners_code;

        logger.log('****************************');
        logger.log('**** EXPIRES: ', customerID ,' ------>>>>');

        const moduleController = mapClients.get(customerID);

        if(moduleController) {
            let counter = mapClientsCounter.get(customerID);
            
            logger.log('COUNTER:', counter);

            if(counter == 1) {
                logger.log('STOPPING MODULE_CONTROLLER');
                // stop module controller
                moduleController.stopDroneManager();
                
                moduleController.stopDronePublisher();

                moduleController.stopDroneService();

                mapClients.delete(customerID);
                mapClientsCounter.delete(customerID);
            } else {
                // decrement counter
                logger.log('DECREMENTING COUNTER');
                counter--;
                mapClientsCounter.set(customerID, counter);
            }
        } // end if
    }, function reject(err) {
        logger.log('ERROR getting customerID from sessions - sessionID:', clientID, ' - ERR:', err);
    });
}

logger.info('********************************************');
logger.info('** STARTING APPLICATION **');
logger.info('********************************************');

const redisService = new RedisService(onLogin, onLogout, logger);

const redisNotifierService = new RedisNotifierService(onExpires);

listClientNames.forEach(function (clientName) {
 
    logger.log('info', '***************************');
    logger.log('info', '******** ModuleController: customerName: ' + clientName + ' * ');
    logger.log('info', '***************************');

    const moduleController = new ModuleController(clientName);

    moduleController.startDronePublisher();

    moduleController.startDroneServiceHistory();
});




