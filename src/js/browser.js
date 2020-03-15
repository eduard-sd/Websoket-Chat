if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}


const containerChat = document.querySelector(".container__chat");
const formSingIn = document.querySelector(".form-signin");

let authTab = document.querySelector('#tab-content-1');
let regTab = document.querySelector('#tab-content-2');
let updateTab = document.querySelector('#tab-content-3');
const inputFields = document.querySelectorAll('.input-data');
const profileEdit = document.querySelector('.profile-edit');



function validate(form) {
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


  if (form.password.value === form.password2.value &&
      form.password.value.length > 3
  ) {
    valid(form.password);
    valid(form.password2);
  } else if (form.password.value.length < 1  && form.password2.value.length < 1) {
    empty(form.password);
    empty(form.password2);
  } else {
    invalid(form.password);
    invalid(form.password2);
  }

  if (form.email.value.length > 5 && form.email.value.includes("@") === true) {
    valid(form.email);
  } else if (form.email.value.length < 1) {
    empty(form.email);
  } else {
    invalid(form.email);
  }


  if(form.loginName.value.length > 1) {
    valid(form.loginName);
  } else if (form.loginName.value.length < 1) {
    empty(form.loginName);
  } else {
    invalid(form.loginName);
  }


  if (form.password.value === form.password2.value &&
      form.password.value.length > 3 &&
      form.loginName.value.length > 1 &&
      form.email.value.includes("@") === true
  ) {
    return true
  }
}
class Form {
  constructor(form) {
    this.email = form.querySelector('.input-data--email');
    this.loginName = form.querySelector('.input-data--login');
    this.password = form.querySelector('.input-data--password');
    this.password2 = form.querySelector('.input-data--password2');
    this.inputFields = form.querySelectorAll('.input-data');
  }
  getFields() {
    return {
      email: this.email,
      loginName: this.loginName,
      password: this.password,
      password2: this.password2
    };
  }

  setEmpty () {
    this.inputFields.forEach(x => x.value = '');
    validate(this.getFields())
  }

  init() {
   this.inputFields.forEach(x => {
     x.addEventListener('change', () => {
       console.log(1)
       validate(this.getFields())
     });
   });
  }
}


let createData = new Form(regTab);
createData.init(); //вешаем обработчик

let editData = new Form(updateTab);
editData.init(); //вешаем обработчик



// создать подключение
let socket = new WebSocket("ws://localhost:8081");

//авторизация
authTab.onsubmit = (e) => {
  e.preventDefault();
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

//регистрация
regTab.onsubmit = (e) => {
  e.preventDefault();

  if (validate(createData.getFields()) === true) {
    let registration = {
      type: "registration",
      email: createData.email.value,
      name: createData.loginName.value,
      password: createData.password.value,
      status: true
    };
    console.log(JSON.stringify(registration));
    socket.send(JSON.stringify(registration));
    // inputFields.forEach(x => x.value = '')
    createData.setEmpty();
  }
};

//редактирование аккаунта
updateTab.onsubmit = (e) => {
  e.preventDefault();
  console.log(editData.getFields());

  if (validate(editData.getFields())  === true) {
    let profileEdit = {
      type: "profile-edit",
      email: editData.email.value,
      name: editData.loginName.value,
      // oldPassword: editData.password.value,
      newPassword: editData.password.value,
      status: true
    };

    socket.send(JSON.stringify(profileEdit));
    // inputFields.forEach(x => x.value = '');
    editData.setEmpty();
  }
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
  console.log(1);
};
// document.querySelector('.btn--save').onclick = () => {
//   profileEdit.classList.remove('profile-edit--visible');
// };

// отправить сообщение из формы
document.querySelector("#newmessage").onsubmit = (e) => {
  e.preventDefault();
  console.log(this);
  let textBox = document.querySelector('#newmessage textarea');
  let chatMessage = {
      type: "text",
      text: document.querySelector('.text-message').value,//edit get element
      date: Date.now()
  };

  console.log(JSON.stringify(chatMessage));
  socket.send(JSON.stringify(chatMessage));
  textBox.value = '';
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
  console.log('browser socket.onmessage = ', event);
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
