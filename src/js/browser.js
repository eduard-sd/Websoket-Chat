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

  if (password.value === password2.value &&
      password.value.length > 3
  ) {
    valid(password);
    valid(password2);
  } else if (password.value.length < 1  && password2.value.length < 1) {
    empty(password);
    empty(password2);
  } else {
    invalid(password);
    invalid(password2);
  }

  if (email.value.length > 5 && email.value.includes("@") === true) {
    valid(email);
  } else if (email.value.length < 1) {
    empty(email);
  } else {
    invalid(email);
  }


  if(loginName.value.length > 1) {
    valid(loginName);
  } else if (loginName.value.length < 1) {
    empty(loginName);
  } else {
    invalid(loginName);
  }


  if (password.value === password2.value &&
      password.value.length > 3 &&
      loginName.value.length > 1 &&
      email.value.includes("@") === true
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

  window.location.reload()//поправить

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

function formateDate (date) {
  const d = new Date(date);
  const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  const hour = new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false }).format(d);
  const minutes = new Intl.DateTimeFormat('en', { minute: 'numeric' }).format(d);

  return(`${day}.${month}.${year} - ${hour}:${minutes}`);
}

// обработчик входящих сообщений
socket.onmessage = function(event) {
  console.log('browser socket.onmessage = ',event);
  let data = JSON.parse(event.data);

  if (data.access === false) {
    alert("пароль и логин не верный")

  } else if (data.access === true && data.message.text.length < 1) {
    formSingIn.classList.remove('form-signin--visible');
    containerChat.classList.add('container__chat--visible');

  } else if (data.registration === 'created') {
    alert("Аккаунт создан");
    document.getElementById('option1').checked = true;

  } else if (data.registration === 'already_exist') {
    alert("Аккаунт уже существует");
    document.getElementById('option1').checked = true;

  } else if (data.message.text.length > 0) {
    showMessage(data.message);
  }
};

// показать сообщение в div#subscribe
function showMessage(message) {
  let date = formateDate(message.date);
  let element = `<div class="chat-box">
                    <div class="from">
                        <span>${message.name}</span>
                        <span>${date}</span>
                    </div>
                    <div class="message">
                        <span>${message.text}</span>
                    </div>       
                </div>`;
  document.getElementById('subscribe').insertAdjacentHTML("beforeend", element)
  // let messageElem = document.createElement('div');
  // messageElem.appendChild(document.createTextNode(message));
  // document.getElementById('subscribe').appendChild(messageElem);
}
