/**
 * @author Julia Jacobs
 * @version 1.0.0
 * @description MongoDB remote and local connection singletons
 * @module dbConnections
 */
var LocalClient = require('mongodb').MongoClient;
var RemoteClient = require('mongodb').MongoClient;

// local MongoDB connection
var localConnectionInstance;

// remote MongoDB connection
var remoteConnectionInstance;

/**
 * @description singleton connection to local mongodb
 * @type {{url: string, connection: Function}}
 */
exports.localDb = {

    //default local connection
    url : 'mongodb://localhost:2017',

    connection : function (callback) {

        // if already we have a connection, don't connect to database again
        if (localConnectionInstance) {
            callback(localConnectionInstance);
            return;
        }

        LocalClient.connect(this.url, function(error, databaseConnection) {
            if (error) throw new Error(error);
            localConnectionInstance = databaseConnection;
            callback(databaseConnection);
        });

    }
};

/**
 * @description singleton connection to remote mongodb
 * @type {{url: null, connection: Function}}
 */
exports.remoteDb = {

    // required remote url string
    url : null,

    connection : function (callback) {

        // if already we have a connection, don't connect to database again
        if (remoteConnectionInstance) {
            callback(remoteConnectionInstance);
            return;
        };

        if (!this.url) {
            throw new Error("Remote url connection string required.")
        } else {
            RemoteClient.connect(this.url, function (error, databaseConnection) {
                if (error) throw new Error(error);
                remoteConnectionInstance = databaseConnection;
                callback(databaseConnection);
            });
        }

    }
};


