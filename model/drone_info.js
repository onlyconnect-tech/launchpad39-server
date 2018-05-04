'use strict';

const Promise = require('bluebird');

const DBPool = require('./../lib/db');
const configDb = require('./../service/config_db');

const pool = new DBPool(configDb);

class DroneInfo {

    getListDroneInfoAll(){

        return new Promise(function(resolve, reject) {

            var listDroneInfo = [];

            pool.connect(function(err, client, done) {

                if(err) {
                    console.error('error fetching client from pool', err);
                    return reject(err);
                }

                client.query('SELECT  A.id::int, A.queue_name, A.drone_type from drone_info A', function(err, result) {
                        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)

                        done(err);

                        if(err) {
                            console.error('error running query', err);
                            return reject(err);
                        }
                        
                        result.rows.forEach(function (elem) {
                            var aElem = { id: elem.id, queue_name: elem.queue_name, drone_type: elem.drone_type };
                
                            listDroneInfo.push(aElem);
                        });

                        resolve(listDroneInfo);

                    });

            });

        });

    }

    getListDroneInfoByCustomerID(customerID){

        return new Promise(function(resolve, reject) {

            var listDroneInfo = [];

            pool.connect(function(err, client, done) {

                if(err) {
                    console.error('error fetching client from pool', err);
                    return reject(err);
                }

                console.log('customerID: ', customerID);

                client.query('SELECT  A.id::int, A.queue_name, A.drone_type from drone_info A, owners B where A.is_active = true and ' +
                    'A.id_owner = B.id and B.owners_code = $1',
                    [ customerID ], function(err, result) {
                        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)

                        done(err);

                        if(err) {
                            console.error('error running query', err);
                            return reject(err);
                        }
                        
                        result.rows.forEach(function (elem) {
                            var aElem = { id: elem.id, queue_name: elem.queue_name, drone_type: elem.drone_type };
                
                            listDroneInfo.push(aElem);
                        });

                        resolve(listDroneInfo);

                    });

            });

        });

    }

    insertDroneStatus(queueName, lat, lon, alt, groundspeed, yaw, roll, pitch ) {

        return new Promise(function(resolve, reject) { 

            //ask for a client from the pool
            pool.connect(function(err, client, done) {

                if(err) {
                    console.error('error fetching client from pool', err);
                    return reject(err);
                }
                
                //use the client for executing the query
                
                client.query('INSERT INTO drone_status (time, id_queue, lat, lon, alt, groundspeed, yaw, roll, pitch) select now(), B.id, $2, $3, $4, $5, $6, $7, $8 from DRONE_INFO B where B.queue_name = $1',
                [ queueName, lat, lon, alt, groundspeed, yaw, roll, pitch ], function(err) {
                //call `done(err)` to release the client back to the pool (or destroy it if there is an error)

                done(err);

                if(err) {
                    console.error('error running query', err);
                    return reject(err);
                }

                resolve();

                });
            });
        });

    }


    getDroneHistoryStatus(queueName) {
        
        return new Promise(

            function(resolve, reject) {

                pool.connect(function(err, client, done) {

                    if(err) {
                        console.error('error fetching client from pool', err);
                        return reject(err);
                    }
            
                    //use the client for executing the query
                    // lat, lon, alt, groundspeed, yaw, roll, pitch
                    client.query('SELECT  A.time, A.lat::float, A.lon::float, A.alt::float, A.groundspeed::float, A.yaw::float, A.roll::float, A.pitch::float from drone_status A, drone_info B where A.id_queue = B.id and B.queue_name = $1 order by time asc',
                    [ queueName ], function(err, result) {  
                        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)

                        done(err);

                        if(err) {
                            console.error('error running query', err);
                            return reject(err);
                        }
                        
                        var arr = [];

                        var arrElemPrevoius = null;

                        result.rows.forEach(function (elem) {
                            var aElem = [];
                            aElem.push(elem.time);
                            aElem.push(elem.lat);
                            aElem.push(elem.lon);

                            if(arrElemPrevoius) {
                                // chek if changed, else continue

                                if(arrElemPrevoius[1] === aElem[1] && arrElemPrevoius[2] === aElem[2]) {
                                    return;
                                }
                            }

                            arrElemPrevoius = aElem;
                            
                            arr.push(aElem);
                        });

                        var lastRecord = result.rows.pop();

                        var valueLastRecord = {};

                        if(lastRecord) {
                            valueLastRecord.time = lastRecord.time;
                            valueLastRecord.lat = lastRecord.lat;
                            valueLastRecord.lon = lastRecord.lon;
                            valueLastRecord.alt = lastRecord.alt;
                            valueLastRecord.groundspeed = lastRecord.groundspeed;
                            valueLastRecord.yaw = lastRecord.yaw;
                            valueLastRecord.roll = lastRecord.roll;
                            valueLastRecord.pitch = lastRecord.pitch;
                        }

                        //output: 1

                        var response = { values: arr, lastRecord: valueLastRecord };
                        resolve(response);

                    });
                });

            }
        );
        



    }


    getVehicleTypes() {

       return new Promise(function(resolve, reject) {

            var listVehicleTypes = [];

            pool.connect(function(err, client, done) {

                if(err) {
                    console.error('error fetching client from pool', err);
                    return reject(err);
                }

                client.query('SELECT unnest(enum_range(NULL::vehicle))::text AS vehicle_type',
                    [], function(err, result) {
                        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)

                        done(err);

                        if(err) {
                            console.error('error running query', err);
                            return reject(err);
                        }
                        
                        result.rows.forEach(function (elem) {
                            listVehicleTypes.push(elem.vehicle_type);
                        });

                        resolve(listVehicleTypes);

                    });

            });

        });

    }


}


module.exports = DroneInfo;



