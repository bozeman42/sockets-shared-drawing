window.addEventListener('load', () => {
  let drawing = false;
  const socket = io();
  socket.on('newClientConnection', data => console.log(data.description));
  socket.on('clientDisconnect', data => console.log(data.description));
  socket.on('connectToRoom', data => console.log(data));
  const otherUsers = {};
  let otherUser;
  const canvas = document.getElementById('canvas');
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  const ctx = canvas.getContext('2d');
  document.addEventListener('mousemove', _.throttle(event => {
    socket.emit('mouse-time', {
      drawing: drawing,
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight
    })
    if (drawing) {
      ctx.lineTo(event.clientX,event.clientY);
      ctx.stroke();
    } else {
      ctx.moveTo(event.clientX,event.clientY);
    }
  }, 20))
  canvas.addEventListener('mousedown', () => {
    drawing = true;
    document.addEventListener('mouseup', () => {
      drawing = false;
    }, { once: true });
  });
  console.log('script run...');
  userCtx = {};
  socket.on('mouseMove', data => {
    if (!otherUsers[data.id]) {
      otherUsers[data.id] = data;
      userCtx[data.id] = canvas.getContext('2d');
      let element = document.createElement('div');
      element.classList.add('userDiv');
      element.id = data.id;
      document.body.appendChild(element);
      ctx.move
    } else {
      otherUser = document.querySelector(`#${data.id}`);
      otherUser.style.top = `${Math.round(data.y * window.innerHeight)}px`;
      otherUser.style.left = `${Math.round(data.x * window.innerWidth)}px`;
      if (data.drawing) {
        userCtx[data.id].lineTo(Math.round(data.x * window.innerWidth), Math.round(data.y * window.innerHeight));
        userCtx[data.id].stroke();
      } else {
        userCtx[data.id].moveTo(Math.round(data.x * window.innerWidth), Math.round(data.y * window.innerHeight));
      }
    }
  })
})