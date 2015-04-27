require("babel/register");

/**
 * @author Julia Jacobs
 * @version 1.0.0
 * @desc Mongodb operations
 * @module operations
 */
var localDb = require('./dbConnections.js').localDb,
    remoteDb = require('./dbConnections.js').remoteDb,
    async = require('async');

/**
 * @desc Filters data from a remote collection and
 * inserts it to a local collection of the same name
 * @param {string} collectionName - name of local and remote collection
 * @param {Object} query - query used to filter remote collection
 * @returns {Promise}
 */
exports.findAndInsert = function(collectionName, query) {
    return new Promise(function (fulfill, reject) {
        async.waterfall([

            function (callback) {

                /**
                 * Truncates local collection
                 */
                localDb.connection(function (db) {
                    db.listCollections().toArray(function (err, replies) {
                        replies.forEach(function (document) {
                            if (document.name == collectionName) {
                                var col = db.collection(collectionName);
                                col.drop(function (err, reply) {
                                    if (err) console.log(err) && reject(err);
                                });
                            }
                        });
                    });
                    callback(null, db);
                });
            },

            function (localDbConnection, callback) {

                /**
                 * Queries and filters
                 * remote collection
                 */
                remoteDb.connection(function (db) {
                    var col = db.collection(collectionName);
                    col.find(query, function (err, resultCursor) {
                        resultCursor.each(function (err, item) {
                            callback(err, item, localDbConnection, db)
                        })
                    });
                });

            },

            function (item, localDbConnection, remoteDbConnection, callback) {

                /**
                 * Inserts documents from
                 * remote collection
                 */
                localDbConnection.collection(collectionName, function (err, col) {
                    if (!!col || col !== null) {
                        col.insert(item, {safe: true}, function (err, r) {
                            callback(err, item, remoteDbConnection);
                        });
                    } else {
                        callback(err, "completed");
                    }
                });
            }

        ], function (err, item) {

            /**
             * Once all documents have been transferred
             * promise is fulfilled and message is passed
             */
            if (item === "completed") {
                fulfill("job " + item);

                /**
                 * As operation continues show successfully inserted
                 * collection objects in console
                 */
            } else {
                if (err) console.log(err) && reject(err);

                // this can be pretty verbose so comment out if needed
                console.log({"inserted": item});
            }

        });
    });
};