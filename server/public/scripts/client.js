const ID_PREFIX = 'USERDIV';

window.addEventListener('load', () => {
  let drawing = false;
  const socket = io();
  const otherUsers = {};
  let otherUser;
  let clientColor;
  const canvas = document.getElementById('canvas');
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  const ctx = canvas.getContext('2d');
  let localDrawingState = false;
  document.addEventListener('mousemove', _.throttle(event => {
    socket.emit('mouse-time', {
      drawing: drawing,
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight
    })
    if (drawing) {
      if (localDrawingState === false) {
        ctx.beginPath();
        console.log('begin local path');
      }
      localDrawingState = true;
      ctx.strokeStyle = clientColor
      ctx.lineTo(event.clientX, event.clientY);
      ctx.stroke();
    } else {
      if (localDrawingState === true) {
        console.log('close local path');
        ctx.closePath();
      }
      localDrawingState = false;
      ctx.moveTo(event.clientX, event.clientY);
    }
  }, 20))
  canvas.addEventListener('mousedown', () => {
    drawing = true;
    document.addEventListener('mouseup', () => {
      drawing = false;
    }, { once: true });
  });
  console.log('script run...');
  let drawingUsers = {};
  let userDrawingState = {};
  socket.on('newClientConnection', data => {
    console.log(data.drawingData.length);
    let colors = data.clientColors;
    clientColor = data.clientColors[data.id];
    data.drawingData.forEach(data => {
      if (!drawingUsers[data.id]) {
        userDrawingState[data.id] = false;
        drawingUsers[data.id] = true;
      } else {
        if (data.drawing) {
          if (userDrawingState[data.id] === false) {
            ctx.beginPath();
            console.log('beginning path',data.id)
            userDrawingState[data.id] = true;
          }
          ctx.strokeStyle = colors[data.id];
          ctx.lineTo(Math.round(data.x * window.innerWidth), Math.round(data.y * window.innerHeight));
          ctx.stroke();
        } else {
          if (userDrawingState[data.id] === true) {
            console.log('closing path',data.id)
            ctx.closePath();
          }
          userDrawingState[data.id] = false;
          ctx.moveTo(Math.round(data.x * window.innerWidth), Math.round(data.y * window.innerHeight));
        }
      }
    })
  });
  socket.on('clientDisconnect', data => {
    document.body.removeChild(document.querySelector(`#${ID_PREFIX + data.id}`));
  });
  socket.on('connectToRoom', data => console.log(data));
  socket.on('mouseMove', data => {
    if (!otherUsers[data.id]) {
      otherUsers[data.id] = data;
      let element = document.createElement('div');
      element.classList.add('userDiv');
      element.id = ID_PREFIX + data.id;
      element.style.backgroundColor = data.color;
      document.body.appendChild(element);
    } else {
      otherUser = document.querySelector(`#${ID_PREFIX + data.id}`);
      otherUser.style.top = `${Math.round(data.y * window.innerHeight)}px`;
      otherUser.style.left = `${Math.round(data.x * window.innerWidth)}px`;
      if (data.drawing) {
        if (userDrawingState[data.id] === false) {
          console.log('beginning path',data.id)
          ctx.beginPath();
          userDrawingState[data.id] = true;
        }
        ctx.strokeStyle = data.color;
        ctx.lineTo(Math.round(data.x * window.innerWidth), Math.round(data.y * window.innerHeight));
        ctx.stroke();
      } else {
        if (userDrawingState[data.id] === true) {
          ctx.closePath();
          console.log('closing path',data.id);
        }
        userDrawingState[data.id] = false;
        ctx.moveTo(Math.round(data.x * window.innerWidth), Math.round(data.y * window.innerHeight));
      }
    }
  })
})