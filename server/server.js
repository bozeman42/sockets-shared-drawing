const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const PORT = process.env.PORT || 5000;

let drawing = {
  clients: {},
  paths: {},
  last: {}
};

io.on('connection', socket => {
  drawing.clients[socket.id] = {};
  console.log(`A user connected. ${socket.id}`);
  drawing.clients[socket.id].color = `rgb(${Math.round(256 * Math.random())},${Math.round(256 * Math.random())},${Math.round(256 * Math.random())})`
  drawing.paths[socket.id] = [];
  drawing.last[socket.id] = {drawing: false};
  socket.emit('newClientConnection', {
    description: 'Welcome!',
    id: socket.id,
    drawing
  });
  socket.broadcast.emit('newClientBroadcast',{id: socket.id, color: drawing.clients[socket.id].color});

  socket.on('mouse-time', data => {
    let datapoint = { ...data, id: socket.id };
    if (!drawing.paths[socket.id]){
      drawing.paths[socket.id] = [];
      drawing.last[socket.id] = datapoint;
    }
    console.log(drawing.last[socket.id]);
    if (drawing.paths[socket.id][0] && datapoint.drawing === true && drawing.last[socket.id].drawing === false) {
      drawing.paths[socket.id] = [...drawing.paths[socket.id],drawing.last[socket.id], datapoint];
    } else if (datapoint.drawing === true || (datapoint.drawing === false && drawing.last[socket.id] === true)) {
      drawing.paths[socket.id] = [...drawing.paths[socket.id],datapoint];
    }
    let pathLength = 0;
    for (path in drawing.paths) {
      pathLength += drawing.paths[path].length
    }
    console.log(pathLength);
    io.sockets.emit('mouseMove', {
      ...data,
      last: drawing.last[socket.id],
      color: drawing.clients[socket.id].color,
      id: socket.id,
      drawingData: drawing
    });
    drawing.last[socket.id] = {
      ...datapoint
    }
  })

  socket.on('disconnect', () => {
    // emit a disconnection event from server. on client delete the indicator div for that ID
    io.sockets.emit('clientDisconnect', { description: 'A client disconnected.',id: socket.id });
    console.log('A user disconnected');
  })


})

app.use(express.static(`${__dirname}/public`));

http.listen(PORT, () => console.log(`Listening on port ${PORT}...`));