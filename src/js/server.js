let http = require('http');
let Static = require('node-static');
let WebSocket = new require('ws');

const {Users, Blog, Tag} = require('./databaseConnectORM')

// подписанные клиенты
let subscribers = [];

function makeData(registration, access, text, name, date) {
    return {
        registration, //'', created, already_exist
        access, // false, true
        message: {
            name,
            text,
            date
        }
    };
}


// WebSocket-сервер на порту 8081
let webSocketServer = new WebSocket.Server({port: 8081});

webSocketServer.on('connection', function (ws) {
    function getProfileIndex(idOrWs) {
        for (let i = 0; i < subscribers.length; i++) {
            if (subscribers[i].ws === idOrWs) {
                return i;
            } else if (subscribers[i].id === idOrWs) {
                return i;
            }
        }
    }

    function disconect(index) {
        let name = subscribers[index].resName;
        console.log('соединение закрыто ' + subscribers[index].resId);
        delete subscribers[index];
        let data = makeData(
            '',
            '',
            name + " покинул чат",
            name,
            new Date()
        );
        subscribers.forEach(x => x.ws.send(JSON.stringify(data)));
    }

    ws.on('close', function () {
        disconect()
    });

    // ws.on('open', function(message) {
    //   console.log(message.data);
    //   console.log('получено сообщение ' + message);
    //
    //
    //   //разослать по клиентам
    //   for(let key in subscribers) {
    //     subscribers[key].send(message);
    //   }
    // });

    ws.on('message', function (message) {
        console.log('получено сообщение ' + message);
        let params = JSON.parse(message);
        if (params.type === "authorization") {
            // проверка есть ли пользователь в базе

            Users.findAll({
                where: {
                    email: `${params.email}`,
                    password: `${params.password}`
                }
            }).then(res => {
                if (res.length) {
                    let resId = res[0].dataValues.id;
                    let resName = res[0].dataValues.name;
                    subscribers.push({
                        resId,
                        ws,
                        resName
                    });

                    let index = getProfileIndex(ws);
                    let data = makeData(
                        '',
                        true,
                        '',
                        subscribers[index].resName,
                        new Date()
                    );
                    console.log(JSON.stringify(data));
                    ws.send(JSON.stringify(data));
                } else {

                    let data = makeData(
                        '',
                        false,
                        ''
                    );
                    console.log(JSON.stringify(data));
                    ws.send(JSON.stringify(data));
                }
            })

        } else if (params.type === "registration") {

            Users.create({
                email: `${params.email}`,
                password: `${params.password}`,
                name: `${params.name}`,
                status: `${params.status}`
            }).then(res => {
                if (res) {

                    let data = makeData(
                        'created',
                        '',
                        ''
                    );
                    console.log(JSON.stringify(data));
                    ws.send(JSON.stringify(data));
                }

            }).catch(() => {

                let data = makeData(
                    'already_exist',
                    '',
                    ''
                );
                console.log(JSON.stringify(data));
                ws.send(JSON.stringify(data));
            })

        } else if (params.type === "exit") {
            let index = getProfileIndex(ws)
            let id = subscribers[index].resId;
            Users.update({
                status: `${params.status}`
            }, {
                where: {id}
            }).then(res => {
                console.log('result', res);
            }).catch((e) => {
                console.log('error', e);
            });

            disconect(index)

        } else if (params.type === "text") {
            let index = getProfileIndex(ws);
            let data = makeData(
                '',
                true,
                `${params.text}`,
                subscribers[index].resName,
                new Date()
            );
            console.log(JSON.stringify(data));
            subscribers.forEach(x => x.ws.send(JSON.stringify(data)));
        }
    });

});


// обычный сервер (статика) на порту 8080
let fileServer = new Static.Server('.');

http.createServer(function (req, res) {
    fileServer.serve(req, res);
}).listen(8080);

console.log("Сервер запущен на портах 8080, 8081");

