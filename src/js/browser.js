if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}


var containerChat = document.querySelector(".container__chat");
var formSingIn = document.querySelector(".form-signin");
var email = document.getElementById("inputEmailRegistration");
var loginName = document.getElementById("inputLoginRegistration");
var password = document.getElementById("inputPasswordRegistration");
var password2 = document.getElementById("inputPasswordRegistration2");

var inputFields = document.querySelectorAll('#tab-content-2 input');

inputFields.forEach(x => {
  x.addEventListener('change', validate)
});

function validate() {
  function invalid (target) {
    target.classList.remove('is-valid');
    target.classList.add('is-invalid');
  }
  function valid (target) {
    target.classList.remove('is-invalid');
    target.classList.add('is-valid');
  }
  function empty (target) {
    target.classList.remove('is-invalid');
    target.classList.remove('is-valid');
  }

  if (password.value.length > 1 && password.value !== password2.value ||
      password.value.length > 1 && password.value.length < 3) {
    invalid(password);
    invalid(password2);
  } else if(password.value.length > 1) {
    valid(password);
    valid(password2);
  } else {
    empty(password);
    empty(password2);
  }

  if (password.value.length > 1 && email.value.indexOf("@") < 1) {
    invalid(email);
  } else if(email.value.length > 1) {
    valid(email);
  } else {
    empty(email);
  }


  if (password.value.length > 1 && loginName.value.length < 2) {
    invalid(loginName);
  } else if(loginName.value.length > 1) {
    valid(loginName);
  } else {
    empty(loginName);
  }


  if (password.value === password2.value || password.value.length > 2 &&
      loginName.value.length > 1 &&
      email.value.indexOf("@") > 0
  ) {
    return true
  }
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
  var email = document.getElementById("inputEmail");
  var password = document.getElementById("inputPassword");
  var authorization = {
    type: "authorization",
    email: email.value,
    password: password.value,
    date: new Date()
  };

  console.log(JSON.stringify(authorization));
  socket.send(JSON.stringify(authorization));
};




var registrationButton = document.querySelector("#tab-content-2 button");
registrationButton.onclick = () => {

  if (validate() === true) {
    var registration = {
      type: "registration",
      email: email.value,
      name: loginName.value,
      password: password.value,
      status: true
    };
    console.log(JSON.stringify(registration));
    socket.send(JSON.stringify(registration));
    inputFields.forEach(x => x.value = '')
    validate();
  }
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
  } else if (data.access === true) {
    formSingIn.classList.remove('form-signin--visible');
    containerChat.classList.add('container__chat--visible');
  } else if (data.registration === 'created') {
    alert("Аккаунт создан");
    document.getElementById('option1').checked = true;
  } else if (data.registration === 'already_exist') {
    alert("Аккаунт уже существует")
    document.getElementById('option1').checked = true;
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
