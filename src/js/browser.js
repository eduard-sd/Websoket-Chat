if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}

function authorization () {
  var email = document.getElementById("inputEmail");
  var password = document.getElementById("inputPassword");
  var authorization = {
    type: "authorization",
    email: email.value,
    password: password.value,
    date: new Date()
  };
  return authorization;
}

function registration () {
  var email = document.getElementById("inputEmailRegistration");
  var name = document.getElementById("inputLoginRegistration");
  var password = document.getElementById("inputPasswordRegistration");
  var password2 = document.getElementById("inputPasswordRegistration2");
  if(password.value !== password2.value) {
    console.log("Пароли не совпадают");
    password2.classList.add('is-invalid');
    return false
  }


  var registration = {
    type: "registration",
    email: email.value,
    name: name.value,
    password: password.value,
    status: true
  };
  return registration;
}



// var chatMessage = {
//     id,
//     type: "text",
//     text: document.getElementById("text").value,//edit get element
//     date: Date.now()
// };

// создать подключение
var socket = new WebSocket("ws://localhost:8081");

var loginButton = document.querySelector("#tab-content-1 button");
loginButton.onclick = () => {
  console.log(JSON.stringify(authorization()));
  socket.send(JSON.stringify(authorization()));
};

var registrationButton = document.querySelector("#tab-content-2 button");
registrationButton.onclick = () => {
  if (registration() === false) {
    alert("Пароли не совпадают")
  }
  console.log(JSON.stringify(registration()));
  socket.send(JSON.stringify(registration()));
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
  var data = JSON.parse(event.data);
  if (data.access === false) {
    alert("пароль и логин не верный")
  } else if (data.registration === false) {
    alert("пароль и логин не верный")
  }


  var incomingMessage = event.data;
  showMessage(incomingMessage);
};

// показать сообщение в div#subscribe
function showMessage(message) {

  var messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);

}
