// create a connector to access the database
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/vast.db');

// initialize express 
var express = require('express');
var restapi = express();

restapi.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
   res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
   res.append('Access-Control-Allow-Headers', 'Content-Type');
   next();
 });


// define a simple entry point to retrieve all features
restapi.get('/features/hours', function(req, res){
	db.all("SELECT * from features_h", function(err, rows){
		res.json(rows);
	})
})


// get all features of a specified sensor
restapi.get('/features/hour/sensor/:id', function(req, res){
	var id = req.params.id;
	if(id){
		db.all("SELECT * from features_h where SensorId = ?", id,function(err,rows){
			res.json(rows);
		})
	}
})

// start listening 
restapi.listen(3000);
console.log("Listening on port 3000...");