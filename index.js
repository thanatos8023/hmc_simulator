// Express Loading
const express = require('express');
const app = express();

// MySQL setting
// Definition
const mysql = require('mysql');
const conn_db = mysql.createConnection({
  host     : 'localhost',
  user     : 'hmc',
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
app.get('/home', function (req, res) {
	// 드롭다운 메뉴를 위해서 목록을 만들어야함 
	var ilSQL = "SELECT * FROM tb_response_text";
	conn_db.query(ilSQL, function (ilError, ilResult, ilBody) {
		if (ilError) {
			console.error("SERVER :: DB Connection : tb_user_input connection error");
			console.error(ilError);
			res.end();
			return ilError
		}

		// 도메인 목록만 제시함 
		var domainList = [];
		for (var i = 0; i < ilResult.length; i++) {
			if (domainList.indexOf(ilResult[i].domain) < 0) { // 처음 보는 도메인인 경우
				domainList.push(ilResult[i].domain);
			}
		}

		res.render('manage', {domainList: domainList})
	});
});

app.get('/mode', function(req, res) {
	console.log('%%% Server log: /mode ROUTER');

	var domain = req.query.selectedDomain;
	var intention = req.query.selectedIntention;
	var status = req.query.selectedStatus;

	// 드롭다운 메뉴를 위해서 목록을 만들어야함 
	var ilSQL = "SELECT * FROM tb_response_text";
	conn_db.query(ilSQL, function (ilError, ilResult, ilBody) {
		if (ilError) {
			console.error("SERVER :: DB Connection : tb_user_input connection error");
			console.error(ilError);
			res.end();
			return ilError
		}

		// 도메인 목록만 제시함 
		var domainList = [];
		for (var i = 0; i < ilResult.length; i++) {
			if (domainList.indexOf(ilResult[i].domain) < 0) { // 처음 보는 도메인인 경우
				domainList.push(ilResult[i].domain);
			}
		}

		// 도메인이 선택되면 나머지 정보들이 발생

		// 사용자 입력 목록 
		var inputSQL = "SELECT * FROM tb_user_input WHERE domain = ? AND intention = ? AND chatbot_status = ?"
		conn_db.query(inputSQL, [domain, intention, status], function(inErr, inResult, inBody) {
			if (inErr) {
				console.error("SERVER :: DB Connection : tb_user_input connection error");
				console.error(inErr);
				res.end();
				return inErr
			}
			
			console.log('%%% Server log: User input confirm');
			console.log("Domain: " + inResult[0].domain);
			console.log("Intention: " + inResult[0].intention);
			console.log("User Input: " + inResult[0].user_input);
			
			//var resSQL = "SELECT * FROM tb_response_text WHERE domain = ? AND intention = ? AND chatbot_status = ?"


			res.render('manage', {inputResult: inResult, domainList: domainList});
		});
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
	var checked_utt = req.body.checked_utt;

	console.log("%%% Server log: /delete ROUTER");
	console.log("Checked Utterance: " + checked_utt);

	var sql = "DELETE FROM tb_utterance_manage WHERE user_input=?";
	conn_db.query(sql, [checked_utt], function(err, result, body) {
		console.log("%%% Server log: /delete ROUTER :: Successfully delete [" + checked_utt + "] in DB.");
		res.redirect('/mode');
	});
});