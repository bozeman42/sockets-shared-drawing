const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = 5000;

let clients = 0;
let roomNumber = 1;


io.on('connection', socket => {
  clients++;
  console.log('A user connected.');
  socket.emit('newClientConnection',{description: `Welcome! There are ${clients} clients connected!`,id: socket.id});
  socket.broadcast.emit('newClientConnection',{description: clients + ' clients connected!'});

  socket.on('mouse-time',data => {
    socket.broadcast.emit('mouseMove',{...data,id: socket.id});
  })

  socket.on('disconnect',() => {
    clients--;
    io.sockets.emit('newClientConnection',{description: 'A client disconnected. ' + clients+ ' clients connected!'});
    console.log('A user disconnected');
  })


})

app.use(express.static(`${__dirname}/public`));

http.listen(PORT,() => console.log(`Listening on port ${PORT}...`));