'use strict';

const DESTINATION_TELEMETRY = '/telemetry';
const DESTINATION_COMMANDS = '/commands';

/**
 * @class MsgsUtils
 *  
 */

class MsgsUtils { 

  static normalizeIdDrone(idDroone) {
    if(idDroone) {
      if(!idDroone.startsWith('/')) {
        idDroone = '/' + idDroone;
      }

      if(idDroone.endsWith('/')){
        idDroone = idDroone.slice(0, -1);
      } 
    }

    return idDroone;
  }

  /**
   * function to format queue name
   * @param  {string} queueName queue name to be properly formatted, should start with / and end with /+
   * @return {string}           return queue name
   */
  
  static buildQueueName(queueName) {
    if(queueName) {
      if(!queueName.startsWith('/')) {
        queueName = '/' + queueName;
      }

      if(queueName.endsWith('/')){
        queueName += '+';
      } else {
        queueName += '/+';
      }
    }

    return queueName;
  }

/**
 * @typedef {Object} MsgsUtils#Msg
 * @property {string} queueDest - The X Coordinate
 * @property {Object} content - command or telemetry object
 */

/**
 * 
 * parse incoming messages.
 * @param  {Paho.MQTT.Message} mgs - message received on subscribed topics
 * @return {MsgsUtils#Msg} parsedObject - parsed object
 */

 static doParseMessage(mgs) {


 }
 
 /**
  * [getQueueNamePart description]
  * @param  {string} destination [description]
  * @return {string}             [description]
  */
 
 static getQueueNamePart(destination) {

    var index = destination.lastIndexOf('/');

    if(index != -1 && index != 0) {
       destination = destination.substring(0, index);
    }

    return destination;
 }

 static checkIfTelemetry(destination) {
  
    if(destination.endsWith(DESTINATION_TELEMETRY)) {
      return true;
    }

    return false;
  }

  static checkIfCommands(destination) {

    if(destination.endsWith(DESTINATION_COMMANDS)) {
        return true;
      }

      return false;

  }

  static doParsingIoTPayloadTelemetry(iotPayload){
    var startIotPayload = iotPayload;

    if(iotPayload.charAt(0) === '"') {
      iotPayload = iotPayload.substring(1);
      iotPayload = iotPayload.substring(0, iotPayload.length - 1);
    }
    
    iotPayload = iotPayload.replace(new RegExp('\'', 'g'), '"');

    iotPayload = iotPayload.replace(new RegExp('None', 'g'), 'null');

    iotPayload = iotPayload.replace(new RegExp('True', 'g'), 'true');

    iotPayload = iotPayload.replace(new RegExp('False', 'g'), 'false');

    iotPayload = iotPayload.replace(new RegExp('L', 'g'), '');

    var obj = null;
    try {
      obj = JSON.parse(iotPayload);
    } catch(err){
      console.log('***** ERROR PARSING', startIotPayload, err);
    }

    return obj;

  }     

}

module.exports = MsgsUtils;

