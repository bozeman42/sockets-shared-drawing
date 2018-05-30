const CANVAS_PREFIX = 'CANVASID';
const DIV_PREFIX = 'DIVID'

window.addEventListener('load', () => {
  const socket = io();
  let drawing = false;
  let localDrawingState = false;
  let clientLast = { x: 0, y: 0 };
  canvases = {};
  contexts = {};
  socket.on('newClientConnection', (data) => {
    for (client in data.drawing.clients) {
      let canvas = document.createElement('canvas');
      canvas.id = CANVAS_PREFIX + client;
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      contexts[client] = canvas.getContext('2d');
      contexts[client].strokeStyle = data.drawing.clients[client].color;
      document.body.appendChild(canvas);
      canvases[client] = document.getElementById(canvas.id);
      data.drawing.paths[client].forEach(datapoint => {
        if (datapoint.drawing) {
          
          contexts[client].lineTo(Math.round(datapoint.x * window.innerWidth), Math.round(datapoint.y * window.innerHeight));
          contexts[client].stroke();
        } else {
          contexts[client].moveTo(Math.round(datapoint.x * window.innerWidth), Math.round(datapoint.y * window.innerHeight));
        }
      })
    }
    document.addEventListener('mousedown', () => {
      drawing = true;
      document.addEventListener('mouseup', () => {
        drawing = false;
      }, { once: true });
    });

    document.querySelector('#clear').addEventListener('click',clearHandler);

    document.addEventListener('mousemove', _.throttle(event => {
      socket.emit('mouse-time', {
        drawing: drawing,
        x: event.clientX / window.innerWidth,
        y: (event.clientY - 100) / window.innerHeight,
      })
    }, 20))
  });

  socket.on('clientDisconnect', data => {
    if (document.querySelector(`#${DIV_PREFIX + data.id}`)){
      document.body.removeChild(document.querySelector(`#${DIV_PREFIX + data.id}`));
    }
  });

  socket.on('newClientBroadcast', data => {
    let canvas = document.createElement('canvas');
    canvas.id = CANVAS_PREFIX + data.id;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    contexts[data.id] = canvas.getContext('2d');
    contexts[data.id].strokeStyle = data.color;
    document.body.appendChild(canvas);
    canvases[data.id] = document.getElementById(canvas.id);
  })

  socket.on('mouseMove', data => {
    if (data.id !== socket.id) {
      if (!document.getElementById(DIV_PREFIX + data.id)) {
        let element = document.createElement('div');
        element.classList.add('userDiv');
        element.id = DIV_PREFIX + data.id;
        element.style.backgroundColor = data.color;
        document.body.appendChild(element);
      } else {
        let otherUser = document.querySelector(`#${DIV_PREFIX + data.id}`);
        otherUser.style.top = `${Math.round(data.y * window.innerHeight)}px`;
        otherUser.style.left = `${Math.round(data.x * window.innerWidth)}px`;
      }
    }
    if (data.drawing) {

      contexts[data.id].moveTo(Math.round(data.last.x * window.innerWidth), Math.round(data.last.y * window.innerHeight));
      contexts[data.id].lineTo(Math.round(data.x * window.innerWidth), Math.round(data.y * window.innerHeight));
      contexts[data.id].stroke();
    } else {
      contexts[data.id].moveTo(Math.round(data.x * window.innerWidth), Math.round(data.y * window.innerHeight));
    }
  })
  function clearHandler(event) {
    console.log('clear!!!');
    socket.emit('clear');
  }

  socket.on('cleared',drawing => {
    for (ctx in contexts) {
      contexts[ctx].clearRect(0,0,canvases[ctx].width,canvases[ctx].height);
      contexts[ctx].beginPath();
    }
  })
});
