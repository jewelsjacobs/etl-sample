require("babel/register");

var operations = require('./operations.js');
var async = require('async');
var localDb = require('./dbConnections.js').localDb;
var remoteDb = require('./dbConnections.js').remoteDb;

// define url connection strings
localDb.url = 'mongodb://localhost:9000';
remoteDb.url = 'mongodb://remotehost:27017/db';

// Last week from today ISO Date string
// Used in date range query condition
var dateObjForDayGranularity = new Date();
dateObjForDayGranularity.setDate(dateObjForDayGranularity.getDate() - 7);
var lastWeekIso = dateObjForDayGranularity.toISOString();

// Last 24 hours ISO Date string
// Used in date range query condition
var dateObjForHourGranularity = new Date();
dateObjForHourGranularity.setDate(dateObjForHourGranularity.getDate() - 1);
var lastDayIso = dateObjForHourGranularity.toISOString();

/**
 * ETL operations
 *
 * A waterfall series of async functions that proceed
 * when completion messages are passed
 *
 * @link {https://github.com/caolan/async#waterfall}
 */
async.waterfall([

    function (callback) {

        // begin first operation
        operations.findAndInsert('metric_names', { metrics: {'$regex': "mongo.*", '$options': "i"} })

            .then(function(response) {
                callback(null, response)
            });
    },

    function (messageFromMetricNamesOperation, callback) {

        // announce completion of first operation
        console.log("metric names operation " + messageFromMetricNamesOperation);

        operations.findAndInsert('day', { name: { $in: [ 'mongodb.connections.current', 'mongodb.globalLock.activeClients.total', 'mongodb.opcounters.insert', 'mongodb.opcounters.update', 'mongodb.opcounters.query', 'mongodb.opcounters.delete', 'mongodb.globalLock.currentQueue.readers', 'mongodb.globalLock.currentQueue.writers' ] }, day : { $gt: new Date(lastWeekIso) } })

            .then(function(response) {
                callback(null, response)
            });

    },

    function (messageFromDayOperation, callback) {

        // announce completion of second operation
        console.log("day operation " + messageFromDayOperation);

        operations.findAndInsert('hour', { name: { $in: [ 'mongodb.connections.current', 'mongodb.globalLock.activeClients.total', 'mongodb.opcounters.insert', 'mongodb.opcounters.update', 'mongodb.opcounters.query', 'mongodb.opcounters.delete', 'mongodb.globalLock.currentQueue.readers', 'mongodb.globalLock.currentQueue.writers' ] }, hour : { $gt: new Date(lastDayIso) } })

            .then(function(response) {
                callback(null, response)
            });

    }

], function(messageFromHourOperation){

    // announce completion of last operation
    console.log("hour operation " + messageFromHourOperation);

    // close out nodeJS script
    process.exit();

});