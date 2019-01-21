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
app.get('/mode', function (req, res) {
	console.log('%%% Server log: /mode ROUTER');

	var domain = req.params.domain;
	var intention = req.params.intention;
	var status = req.params.status;

	// 기본적으로 도메인 목록은 무조건 전시해야함 
	var sql = "SELECT * FROM tb_response_text";
	conn_db.query(sql, function (allError, allResult, allBody) {
		if (allError) { // DB 불러오기 에러
			console.error("SERVER :: DB Connection : All Database reading connection error");
			console.error(allError);
			res.end();
			return allError
		}

		var domainList = [];
		for (var i = 0; i < allResult.length; i++) {
			if (domainList.indexOf(allResult[i].domain) < 0) {
				domainList.push(allResult[i].domain);
			}
		}

		res.render('home', {domList: domainList});
	});
});

app.get('/mode/:domain', function (req, res) {
	var domain = req.params.domain;
	console.log('%%% Server log: /mode/' + domain + ' ROUTER');

	// 기본적으로 도메인 목록은 무조건 전시해야함 
	var sql = "SELECT * FROM tb_response_text";
	conn_db.query(sql, function (allError, allResult, allBody) {
		if (allError) { // DB 불러오기 에러
			console.error("SERVER :: DB Connection : All Database reading connection error");
			console.error(allError);
			res.end();
			return allError
		}

		var domainList = [];
		for (var i = 0; i < allResult.length; i++) {
			if (domainList.indexOf(allResult[i].domain) < 0) {
				domainList.push(allResult[i].domain);
			}
		}

		// 의도 목록은 반드시 필요함 
		var intentionList = [];
		for (var i = 0; i < allResult.length; i++) {
			if (intentionList.indexOf(allResult[i].intention) < 0 && allResult[i].domain == domain) { // 도메인이 일치하면서, 목록에 추가되지 않은 의도만 
				intentionList.push(allResult[i].intention);
			}
		}

		console.log("SERVER :: Number of Intention :: " + intentionList.length);

		res.render('home', {
			domList: domainList,
			nowDomain: domain,
			intList: intentionList
		});
	});
});

app.get('/mode/:domain/:intention', function (req, res) {
	var domain = req.params.domain;
	var intention = req.params.intention;

	console.log('%%% Server log: /mode/' + domain + '/' + intention + ' ROUTER');

	// 기본적으로 도메인 목록은 무조건 전시해야함 
	var sql = "SELECT * FROM tb_response_text";
	conn_db.query(sql, function (allError, allResult, allBody) {
		if (allError) { // DB 불러오기 에러
			console.error("SERVER :: DB Connection : All Database reading connection error");
			console.error(allError);
			res.end();
			return allError
		}

		var domainList = [];
		for (var i = 0; i < allResult.length; i++) {
			if (domainList.indexOf(allResult[i].domain) < 0) {
				domainList.push(allResult[i].domain);
			}
		}

		// 의도 목록은 반드시 필요함 
		var intentionList = [];
		for (var i = 0; i < allResult.length; i++) {
			if (intentionList.indexOf(allResult[i].intention) < 0 && allResult[i].domain == domain) { // 도메인이 일치하면서, 목록에 추가되지 않은 의도만 
				intentionList.push(allResult[i].intention);
			}
		}

		console.log("SERVER :: Number of Intention :: " + intentionList.length);

		var statusList = [];
		for (var i = 0; i < allResult.length; i ++) {
			if (statusList.indexOf(allResult[i].chatbot_status) < 0 && allResult[i].intention == intention) {
				statusList.push(allResult[i].chatbot_status);
			}
		}

		res.render('home', {
			domList: domainList,
			nowDomain: domain,
			intList: intentionList,
			nowIntention: intention,
			stList: statusList
		});
	});
});

app.get('/mode/:domain/:intention/:status', function(req, res) {
	console.log('%%% Server log: /mode ROUTER');

	var domain = req.params.domain;
	var intention = req.params.intention;
	var status = req.params.status;

	// 기본적으로 도메인 목록은 무조건 전시해야함 
	var sql = "SELECT * FROM tb_response_text";
	conn_db.query(sql, function (allError, allResult, allBody) {
		if (allError) { // DB 불러오기 에러
			console.error("SERVER :: DB Connection : All Database reading connection error");
			console.error(allError);
			res.end();
			return allError
		}

		res.render('home', {
			domList: domainList,
			nowDomain: domain,
			intList: intentionList,
			nowIntention: intention,
			stList: statusList,
			nowStatus: status
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