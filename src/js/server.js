var http = require('http');
var Static = require('node-static');
var WebSocket = new require('ws');

// подключенные клиенты

var clients = [];

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocket.Server({port: 8081});

webSocketServer.on('connection', function(ws) {
  var id = Math.random();
  clients.push({id,ws});
  // let list = JSON.stringify(clients);
  // console.log("новое соединения " + list);


  // ws.open('message', function(message) {
  //   console.log('получено сообщение ' + message);
  //   //разослать по клиентам
  //   for(var key in clients) {
  //     clients[key].send(message);
  //   }
  // });

  // ws.on('message', function(message) {
  //   console.log('получено сообщение ' + message);
  //   //разослать по клиентам
  //   for(var key in clients) {
  //     clients[key].send(message);
  //   }
  // });
  //
  // ws.on('close', function() {
  //   console.log('соединение закрыто ' + id);
  //   delete clients[id];
  // });

});



// обычный сервер (статика) на порту 8080
var fileServer = new Static.Server('.');

http.createServer(function (req, res) {
  fileServer.serve(req, res);
}).listen(8080);

console.log("Сервер запущен на портах 8080, 8081");

