/**
 * Created by DELL on 4/22/2016.
 */

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var connection = require('./connection');
var cors = require('cors');


//var config = require('./config');

var userSchema = require('./dbmodels/users');
var UserModel = mongoose.model('usersinfo', userSchema, 'users');

var user_transSchema = require('./dbmodels/user_transaction');
var UserhistoryModel = mongoose.model('users_historyinfo', user_transSchema, 'users_history');
app.use(cors());
/*app.use(favicon(__dirname + '/public/images/favicon.ico'));*/
app.use(express.static(__dirname + '/public'));
//app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use(bodyparser.json());
var ErrorLogInterface = require('./common/errorLogger.js');

mongoose.Promise = require('bluebird');
mongoose.connect(connection.connectionString, {
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    useMongoClient: true
  });

//Common functions
var LogError = function(error, moduleName)
{
    let errorlogger = ErrorLogInterface();
    let errorModel = {
      message: error.message,
      modulename: moduleName,
      errorStack: error.errorStack === undefined ?  JSON.stringify(error) : JSON.stringify(error.errorStack)
    }
    errorlogger.logError(errorModel);
}

app.post('/validateLogin', function(req, res)
{
	console.log(req.body);
	UserModel.findOne({userid: req.body.userid, Password: req.body.password },{userid: true, Role: true}, function(err,obj) { 
		console.log(obj); 
		if (obj != undefined) {
			res.json({ "success": true, "errormessage": "", data: obj });
		}
		else
		{
			res.json({ "success": false, "errormessage": "authentication mismatch or user doesnt exists in the system" });
		}		
	
	});
});

app.post('/createUser', function(req, res)
{
	try {
		
		var userdata = req.body;

		var userInfo = new UserModel(userdata);

		UserModel.findOne({userid: userdata.userid}, function(err,obj) { 
			console.log(obj); 
			if (obj == undefined) {
				userInfo.save(function (err) {
					if (err) {
						LogError(err, "createUser");
						res.status(400).send(err);
					}
					else { res.json({ "success": true, "errormessage": "" }); }
				});	
			}
			else
			{
				res.json({ "success": false, "errormessage": "userid already exists in the system" });
			}		
		
		});        
		
	} catch (error) {
		LogError(error, "createUser");
	}
});




var Port = process.env.PORT || 3000;
app.listen(Port);
console.log("server running on port " + Port);