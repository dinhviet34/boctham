var express = require("express");
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
  });
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server, { wsEngine: 'ws' });;
server.listen(app.get('port'),function(){
	console.log("Server - Waiting connection at port",app.get('port'));
});



io.on("connection", function(socket)
	{
		//console.log("userconnect");
		socket.on("disconnect", function()
			{
				console.log("disconnect");
			});
         //server lắng nghe dữ liệu từ client
		socket.on("Client-sent-data", function(data)
			{
				console.log(data);
				//sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác
                io.sockets.emit("Server-sent-data", data);
			});
	});

// create route, display view

app.get("/", function(req, res)
	{
		res.render("home");
	});

app.get("/button",function(rep,res){
	res.render("button");
})