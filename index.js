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

// Monitoring page
app.get('/view', function(req, res) {
	var sql = "SELECT * FROM tb_monitoring"
	conn_db.query(sql, function(err, monit_info, body) {
		console.log("User ID: " + monit_info[0].user_id);
		console.log("Car Type: " + monit_info[0].car_type);
		console.log("Bluelink_status: " + monit_info[0].bluelink_status);
		console.log("Intention: " + monit_info[0].intention);
		console.log("User input: " + monit_info[0].user_input);
		console.log("Response text: " + monit_info[0].response_text);

		res.render('view', {monit_info: monit_info});
	});
});

// Modify page
app.get('/mode', function(req, res) {
	var sql = "SELECT * FROM tb_utterance_manage"
	conn_db.query(sql, function(err, manage_table, body) {
		console.log('%%% Server log: /mode ROUTER');

		console.log("Intention: " + manage_table[0].intention);
		console.log("ID Number: " + manage_table[0].id_number);
		console.log("User Input: " + manage_table[0].user_input);
		console.log("Response text: " + manage_table[0].response_text);
		console.log("chatbot_status: " + manage_table[0].chatbot_status);

		res.render('manage', {manage_table: manage_table});
	});
});

// Input Utterance in DB
app.post('/input', function(req, res) {
	var intention = req.body.selectedIntention;
	var new_userInput = req.body.new_userInput;
	var new_responseText = req.body.new_responseText;
	var new_chatbotStatus = req.body.new_chatbotStatus;

	console.log("%%% Server log: /input ROUTER");
	console.log("Intention: " + intention);
	console.log("New Input: " + new_userInput);
	console.log("New Response: " + new_responseText);
	console.log("New Status: " + new_chatbotStatus);

	var sql = 'INSERT INTO tb_utterance_manage (intention, user_input, response_text, chatbot_status) VALUES(?, ?, ?, ?)';
	conn_db.query(sql, [intention, new_userInput, new_responseText, new_chatbotStatus], function(err, result, fields){
		console.log("%%% Server log: New information Successfully added in DB.");
		res.redirect('/mode')
	});
});


// Delete Utterance in DB
app.post('/delete', function(req, res) {
	var id = req.body.checked

	console.log("%%% Server log: /delete ROUTER");
	console.log("ID: " + id);

	res.redirect('/mode');
});