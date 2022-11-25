//required for front end communication between client and server

const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
let typesOrnot = document.getElementById("typesOrnot")
let message1 = document.getElementById('message1');


const scrollmsg = document.getElementById('chatbox1');

let userName = "";
const yourName = prompt('What is your name?')
let id;
const newUserConnected = function (data) {
    

    //give the user a random unique id
    id = Math.floor(Math.random() * 1000000);
    userName = yourName;
    //console.log(typeof(userName));   
    
    //emit an event with the user id
    socket.emit("new user", userName);
    //call
    addToUsersBox(userName);
};




const addToUsersBox = function (userName) {
    //This if statement checks whether an element of the user-userlist
    //exists and then inverts the result of the expression in the condition
    //to true, while also casting from an object to boolean
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    
    }
    
    //setup the divs for displaying the connected users
    //id is set to a string including the username
    const userBox = `
    <div class="chat_id ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
    //set the inboxPeople div with the value of userbox
    inboxPeople.innerHTML += userBox;
};

//call 
newUserConnected();

//when a new user event is detected
socket.on("new user", function (data) {
  alert("A new user joined the chat")
  data.map(function (user) {
          return addToUsersBox(user);
      });
});

socket.on('message', message =>{
    outputMessage(message);
    });

//when a user leaves
socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
});

message1.addEventListener('keypress', () => {
  socket.emit("typing", userName);
});



socket.on("typing", (name) => {
  let typingMessage = typesOrnot.innerHTML=`<p><em>${userName}</em> is typing... </p>`;
  typesOrnot.innerHTML = typingMessage;
  setTimeout(notTyping, 4000);
});

function notTyping() {
const noType = `<p></p>`;
typesOrnot.innerHTML = noType;
};


function outputMessage(message){
      const div = document.createElement('div');
      div.classList.add('message');
      div.innerHTML = `${message}`;
      scrollmsg.appendChild(div);
};

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p class="msg-txt">${formattedTime} <b>${user}</b>: ${message}</p>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p class="msg-txt">${formattedTime} <b>${message}</b></p>
    </div>
  </div>`;
  //is the message sent or received
  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }
  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });
  inputField.value = "";
});

socket.on("chat message", function (data) {
  messageBox.scrollTop = messageBox.scrollHeight;
  addNewMessage({ user: data.nick, message: data.message });
});