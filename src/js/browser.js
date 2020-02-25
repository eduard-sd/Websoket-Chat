
if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}

var newPerson = {
    id:
}

// создать подключение
var socket = new WebSocket("ws://localhost:8081");

const login = document.querySelector("#tab-content-1 button");
login.onclick = () => {
  console.log('click');

  let email = document.querySelector("#inputEmail");
  let password = document.querySelector("#inputPassword");
  socket.send(`{email:${email.value},password:${password.value}}`);
  // Users.findAll({
  //   email:`${email.value}`,
  //   password:`${password.value}`
  // }).then(res => {
  //   if(res){
  //     console.log(res)
  //   } else{
  //     console.log(res)
  //   }
  // })
};




// отправить сообщение из формы publish
document.forms.publish.onsubmit = function() {
  var outgoingMessage = this.message.value;
  console.log('outgoingMessage');
  socket.send(outgoingMessage);
  return false;
};

// обработчик входящих сообщений
socket.onmessage = function(event) {

  var incomingMessage = event.data;
  showMessage(incomingMessage);
};

// показать сообщение в div#subscribe
function showMessage(message) {

  var messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);

}
