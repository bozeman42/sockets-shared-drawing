const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let drawing = [];

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const PORT = process.env.PORT || 5000;

let clients = 0;
let clientColors = {};
io.on('connection', socket => {
  clients++;
  console.log('A user connected.');
  clientColors[socket.id] = `rgb(${Math.round(256 * Math.random())},${Math.round(256 * Math.random())},${Math.round(256 * Math.random())})`
  socket.emit('newClientConnection',{description: `Welcome! There are ${clients} clients connected!`,id: socket.id, clientColors, drawingData: drawing});
  socket.broadcast.emit('newClientBroadcast',{description: clients + ' clients connected!',clientColors});

  socket.on('mouse-time',data => {
    let dataPoint = {...data,id: socket.id};
    let userDrawing = drawing.filter(data => {
      return (data.id === socket.id);
    })
    socket.broadcast.emit('mouseMove',{...data, color: clientColors[socket.id], id: socket.id});
    if (userDrawing[0] && dataPoint.drawing === false && userDrawing[userDrawing.length - 1].drawing === false){
      return;
    }
    drawing = [...drawing, dataPoint];
  })

  socket.on('disconnect',() => {
    clients--;
    // emit a disconnection event from server. on client delete the indicator div for that ID
    io.sockets.emit('clientDisconnect',{description: 'A client disconnected. ' + clients+ ' clients connected!',id: socket.id});
    console.log('A user disconnected');
  })


})

app.use(express.static(`${__dirname}/public`));

http.listen(PORT,() => console.log(`Listening on port ${PORT}...`));