# Sample ETL NodeJS MongoDB Scripts

Scripts to populate a local mongoDB instance database collections from a remote one.

They are very simple and only do the following:

Query and filter from the remote source and then insert into the local source.

These are samples so to use, you'll have to modify the sampleJobs.js file with the local and remote instance
 information as well as the collection names and queries.

## How to hack scripts
Uses: 

- [nodeJS](https://nodejs.org/)
- [async - nodeJS module for asynchronous control flow](https://github.com/caolan/async)
- [babel - compiles ES6+ code into ES5 friendly code](http://babeljs.io/)

###Install
After installing nodeJS (use link above):

- Fork and Clone repo
- Install node modules

```bash
$ cd etl-scripts
$ npm install
```

###Run

```bash
$ cd etl-scripts
$ node <jobScript>
```






