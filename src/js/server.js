var http = require('http');
var Static = require('node-static');
var WebSocket = new require('ws');

const { Users, Blog, Tag } = require('./databaseConnectORM')

// подключенные клиенты

var clients = [];

var data = {
  registration : false,
  access : false
};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocket.Server({port: 8081});

webSocketServer.on('connection', function(ws) {




  // ws.on('message', function(message) {
  //   console.log('получено сообщение ' + message);
  //   //разослать по клиентам
  //   for(var key in clients) {
  //     clients[key].send(message);
  //   }
  // });
  //
  ws.on('close', function() {
    for (let i = 0; i < clients.length; i++) {
      if(clients[i].ws === ws) {
        clients.forEach(x => x.ws.send(clients[i].resName + " покинул чат"));
        console.log('соединение закрыто ' + clients[i].resId);
        delete clients[i];
      }
    }
  });

  // ws.on('open', function(message) {
  //   console.log(message.data);
  //   console.log('получено сообщение ' + message);
  //
  //
  //   //разослать по клиентам
  //   for(var key in clients) {
  //     clients[key].send(message);
  //   }
  // });

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);
    var params = JSON.parse(message);
    if (params.type === "authorization") {
      // проверка есть ли пользователь в базе

      Users.findAll({
        where: {
          email:`${params.email}`,
          password:`${params.password}`
        }
      }).then(res => {
        if(res.length){
          var resId = res[0].dataValues.id;
          var resName = res[0].dataValues.name;
          clients.push({
            resId,
            ws,
            resName
          });
        } else{
          console.log(JSON.stringify(data));
          ws.send(JSON.stringify(data));
        }
      })

    } else if (params.type  === "registration") {
      console.log(params.date)
      // var date = params.date.getDate()

      Users.create({
        email:`${params.email}`,
        password:`${params.password}`,
        name: `${params.name}`,
        status: `${params.status}`
      }).then(res => {
        if(res) {
          console.log('created');
        } else{
          console.log('not');
        }
      })
    } else if (params.type  === "text") {

    } else if (params.type  === "text") {

    }
    //разослать по клиентам
    for(var key in clients) {
      clients[key].send(message);
    }
  });

});





// обычный сервер (статика) на порту 8080
var fileServer = new Static.Server('.');

http.createServer(function (req, res) {
  fileServer.serve(req, res);
}).listen(8080);

console.log("Сервер запущен на портах 8080, 8081");

