
const express = require('express');
const socketio = require('socket.io');
const PORT = process.env.PORT||5000;
const http = require('http');
const app = express();
const router = require('./router');
const server = http.createServer(app);
const io = socketio(server);
//the name socket below represents the clients socket
io.on('connection',(socket)=>{
    console.log('Someone Connected');

    //disconnect below fires when a users disconnects from the socket
    socket.on('disconnect',()=>{
        console.log('someone just left');
    })
})

app.use(router);
server.listen(PORT,()=>{
    console.log(`server has started on port ${PORT}`);
});
