// Express Loading
const express = require('express');
const app = express();

// MySQL setting
// Definition
const mysql = require('mysql');
const conn_db = mysql.createConnection({
  host     : 'localhost',
  user     : 'spp',
  password : 'aleldjwps',
  database : 'hmc_chatbot'
});

// Connection
conn_db.connect();

// BodyParser Loading
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Setting for using jade
app.set('views', './views');
app.set('view engine', 'jade');

// Location
app.listen(23705, function(){
	console.log('Connected, 23705 port!');
});

// View page
app.get('/view', function(req, res) {
	var sql_input = "SELECT * from TB_USER_UTTERANCE"
	conn_db.query(sql_input, function(err, user_inputs, body) {
		var sql_output = "SELECT * from TB_RESPONSE"
		conn_db.query(sql_output, function(err, response_utt, body) {
			console.log("Intention: " + user_inputs.intention);
			console.log("User Utterance: " + user_inputs.utterance);

			console.log("Response Message: " + response_utt.response_message);
		});
	});
	res.render('view');
});

// Modify page
app.get('/mode', function(req, res) {
	var view_sql = "SELECT * from TB_USER_UTTERANCE"
	conn_db.query(view_sql, function(err, user_inputs, body) {
		console.log("Hello");
	});
});