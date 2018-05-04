# README

## PUBLISHING VEHICLES

[drone_publisher.js](./tools/drone_publisher.js) Service that publish on queue */vehicles/<CLIENT_NAME>* the queue names associated with *<CLIENT_NAME>*.

### RUN

`> node ./tools/drone_publisher.js <CLIENT_NAME>`

## VEHICLE POSITIONS

[drone_DB_syncronizer.js](./tools/drone_DB_syncronizer.js) Service that read on queues telemetry informations and insert telemetry informations on database.

### RUN

`> node ./tools/drone_DB_syncronizer.js`

## HISTORY TELEMETRY INFO 

[drone_service_history.js](./tools/drone_service_history.js) Send history telemetry info on request from a *<CLIENT_NAME>* on associated queues.

**REQUEST**

On */<NAME_QUEUE>/commands* message request:

```javascript
{"jsonrpc":"2.0","method":"history" }
```

**RESPONSE**

On */<NAME_QUEUE>/commands* message response:

```javascript
{	
	"jsonrpc":"2.0",
	"method":"history-response",
	"values":[
		["2017-04-11T08:46:07.434Z", 44.8273383, 10.8158202],
		["2017-04-11T09:08:32.126Z", 44.8272663, 10.8159701],
		["2017-04-11T09:08:38.119Z", 44.827097, 10.8164512],
		["2017-04-11T09:08:44.113Z", 44.8269289, 10.8169319],
		["2017-04-11T09:08:50.113Z", 44.8267603, 10.8174127],
		["2017-04-11T09:08:56.132Z", 44.8265923, 10.817894]
        ],
	"lastRecord": {
		"time": "2017-04-11T09:08:56.132Z",
		"lat": 44.8265923,
		"lon": 10.817894,
		"alt": 80,
		"groundspeed": null,
		"yaw": 2.45827651023865, 
		"roll": 0.00174767489079386,
		"pitch": 0.00181786890607327
		}
 }

```

### RUN

`> node ./tools/drone_service_history.js <CLIENT_NAME>`

## SERVERS

> `node server_ccs_dashboard_backend.js`

The server respond publishing the vehicle's queues for every connected dashboard client and history command: composition of `drone_publisher.js` and `drone_service.js` services.

Respond to login, logout and expires events on redis.

> `node server_syncronizer_DB.js`

The server syncronize drone informations read from queues inserting into database for history.




