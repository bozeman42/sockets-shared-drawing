console.log('script run...');
const socket = io();

socket.on('cool-event', data => console.log(data.description));
socket.on('newClientConnection',data => console.log(data.description));
socket.on('clientDisconnect',data => console.log(data.description));
socket.on('connectToRoom',data => console.log(data));
socket.on('mouse-time',data => console.table(data))

console.log(socket);

window.addEventListener('load',() => {
  document.addEventListener('mousemove',_.throttle(event => {
    socket.emit('mouse-time',{x: event.clientX / window.innerWidth, y: event.clientY /  window.innerHeight})
  },100))
})