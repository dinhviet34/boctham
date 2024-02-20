
require('dotenv').config();
const jwt = require('jsonwebtoken');
var express = require("express");
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.json())
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server, { wsEngine: 'ws' });;
server.listen(app.get('port'), function () {
	console.log("Server - Waiting connection at port", app.get('port'));
});


io.on("connection", function (socket) {
	console.log(socket.id + " is connected");
	
	socket.on("disconnect", function () {
		console.log(socket.id + " is disconnect");
		
	});
	socket.on("Joinroom", function (data) {
		
		
		//io.sockets.in(data).emit("RoomAlert", "ConnectedRoom " + data);
	
		socket.join(data);
		
		console.log("Welcome room " + data);
		
	})

	//server lắng nghe dữ liệu từ client
	socket.on("Client-sent-data", function (data) {
		console.log(data);
		var message = data.split(" ")[0];
		var room = data.split(" ")[1];
		socket.join(room);
		console.log(room);
		//sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác
		io.sockets.in(room).emit("Server-sent-data", message);
	});
	socket.on("Home-sent-data", function (data) {
		console.log(data);
		var message = data.split(" ")[0];
		var room = data.split(" ")[1];
		socket.join(room);
		//sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác
		io.sockets.in(room).emit("Server-sent-home-ready", message);
	});
});



// create route, display view

app.get("/", function (req, res) {
	res.render("home");
});
app.post("/builder", function (req, res) {
	
	var name = req.body.name;
	var room = req.body.room;
	var game = req.body.game;
	var coupon = req.body.coupon;
	const data = req.body;
	const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '2h',
	});

	res.json({name:name, room: room, game: game, coupon: coupon, accessToken });



});
app.get("/table/:name/:room/:game/:coupon/:key", function (req, res) {
	const name = req.params.name;
	const roomnum = req.params.room;
	const gamechar = req.params.game;
	const coupon = req.params.coupon;
	const authorizationClient = req.params.key;
	const token = authorizationClient;
	
	if (!token) return res.sendStatus(401)

	try {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
		res.render("table", { name: name, room: roomnum, game: gamechar, coupon: coupon,key:token });
	} catch (e) {
		return res.sendStatus(403);
	}

});

app.get("/button/:room/:key", function (req, res) {
	const roomnum = req.params.room;
	const gamechar = req.params.game;
	const authorizationClient = req.params.key;
	const token = authorizationClient;

	if (!token) return res.sendStatus(401)

	try {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
		res.render("button", { room: roomnum });
	} catch (e) {
		return res.sendStatus(403);
	}

})


