if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}


const containerChat = document.querySelector(".container__chat");
const formSingIn = document.querySelector(".form-signin");
const email = document.getElementById("inputEmailRegistration");
const loginName = document.getElementById("inputLoginRegistration");
const password = document.getElementById("inputPasswordRegistration");
const password2 = document.getElementById("inputPasswordRegistration2");
const inputFields = document.querySelectorAll('#tab-content-2 input');
const profileEdit = document.querySelector('.profile-edit');

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

// создать подключение
let socket = new WebSocket("ws://localhost:8081");

//авторизация
document.querySelector("#tab-content-1 > button").onclick = () => {
  let email = document.getElementById("inputEmail");
  let password = document.getElementById("inputPassword");
  let authorization = {
    type: "authorization",
    email: email.value,
    password: password.value,
    date: new Date()
  };
  console.log(JSON.stringify(authorization));
  socket.send(JSON.stringify(authorization));
};

document.querySelector('.btn--exit').onclick = () => {
  // formSingIn.classList.add('form-signin--visible');
  // containerChat.classList.remove('container__chat--visible');
  let exit = {
    type: "exit",
    date: new Date(),
    status: false
  };
  console.log(JSON.stringify(exit));
  socket.send(JSON.stringify(exit));
};
document.querySelector('.btn--edit').onclick = () => {
  profileEdit.classList.add('profile-edit--visible');
  editBtn.classList.add('btn--invisible');
};
document.querySelector('.btn--save').onclick = () => {
  profileEdit.classList.remove('profile-edit--visible');
  editBtn.classList.remove('btn--invisible');
};

//регистрация
document.querySelector("#tab-content-2 button").onclick = () => {
  if (validate() === true) {
    let registration = {
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




// отправить сообщение из формы
document.querySelector("#newmessage").onclick = (e) => {
  e.preventDefault();
  let chatMessage = {
      type: "text",
      text: document.querySelector('.text-message').value,//edit get element
      date: Date.now()
  };

  console.log(JSON.stringify(chatMessage));
  socket.send(JSON.stringify(chatMessage));
};

// обработчик входящих сообщений
socket.onmessage = function(event) {
  let data = JSON.parse(event.data);

  if (data.access === false) {
    alert("пароль и логин не верный")
  } else if (data.access === true) {
    formSingIn.classList.remove('form-signin--visible');
    containerChat.classList.add('container__chat--visible');
  } else if (data.registration === 'created') {
    alert("Аккаунт создан");
    document.getElementById('option1').checked = true;
  } else if (data.registration === 'already_exist') {
    alert("Аккаунт уже существует");
    document.getElementById('option1').checked = true;
  } else if (data.text.length > 0) {
    let incomingMessage = data.text;
    showMessage(incomingMessage);
  }
};

// показать сообщение в div#subscribe
function showMessage(message) {
  let messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}
