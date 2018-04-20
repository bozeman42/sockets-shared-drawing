console.log('script run...');
const socket = io();

socket.on('cool-event', data => console.log(data.description));
socket.on('newClientConnection',data => console.log(data.description));
socket.on('clientDisconnect',data => console.log(data.description));
socket.on('connectToRoom',data => console.log(data));
const otherUsers = {};
let otherUser;
socket.on('mouseMove',data => {
  if (!otherUsers[data.id]) {
    otherUsers[data.id] = data;
    let element = document.createElement('div');
    element.classList.add('userDiv');
    element.id = data.id;
    element.textContent = data.id;
    document.body.appendChild(element);
  } else {
    otherUser = document.querySelector(`#${data.id}`);
    console.log(otherUser.style);
    otherUser.style.top = `${Math.round(data.y * window.innerHeight)}px`;
    otherUser.style.left = `${Math.round(data.x * window.innerWidth)}px`;
  }
})

console.log(socket);

window.addEventListener('load',() => {
  document.addEventListener('mousemove',_.throttle(event => {
    socket.emit('mouse-time',{x: event.clientX / window.innerWidth, y: event.clientY /  window.innerHeight})
  },20))
})