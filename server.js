const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const ADMIN_PASS = 'admin123'; // 適宜変更
let messages = [];

app.use(express.static('public'));

io.on('connection', socket => {
  io.emit('updateUserCount', io.engine.clientsCount);
  socket.emit('updateMessages', messages);

  socket.on('sendMessage', data => {
    const { seed, username, message, time } = data;
    if(!seed || !username || !message) return;
    messages.push({ seed, username, message, time });
    io.emit('updateMessages', messages);
  });

  socket.on('deleteMessage', data => {
    const { messageId, password } = data;
    if(password !== ADMIN_PASS) return;
    if(messageId >= 0 && messageId < messages.length){
      messages.splice(messageId,1);
      io.emit('updateMessages', messages);
    }
  });

  socket.on('clearMessages', data => {
    const { password } = data;
    if(password !== ADMIN_PASS) return;
    messages = [];
    io.emit('updateMessages', messages);
  });

  socket.on('disconnect', () => {
    io.emit('updateUserCount', io.engine.clientsCount);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
