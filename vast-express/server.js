// create a connector to access the database
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('vast2015_mc1.db');

// initialize express 
var express = require('express');
var restapi = express();


// define a simple entry point to retrieve all users
restapi.get('/features/hour', function(req, res){
	db.all("SELECT * from features_h", function(err, rows){
		res.json(rows);
	})
})


// get all points of a specified user
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