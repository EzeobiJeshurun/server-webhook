
const express = require('express');
const socketio = require('socket.io');
const PORT = process.env.PORT||5000;
const {getUserAndRoom,  incommingMessage, removeUser} = require('./messages');
const http = require('http');
const app = express();
const router = require('./router');
const server = http.createServer(app);
const io = socketio(server);
//the name socket below represents the clients socket
io.on('connection',(socket)=>{
    console.log('Someone Connected');
    socket.on('/message', ({currentUser,messageRoom}, callback)=>{
        const recievedMessage = incommingMessage({id: socket.id, currentUser, messageRoom});
        console.log(currentUser,'',messageRoom);
    //for handling error
    // const error = true;
        //if(error){
        //   callback({error: 'error message here'})
       // }

       //chatbot welcome notes
       socket.emit('chats', {user: 'chatbot', text: "Hi, how can I help you?"}) 




       //join the room/ creates a virtual room
       socket.join(recievedMessage.messageRoom);

       
       callback();
    })

    //waiting for sendMe from client socket
    socket.on('sendMe', (message, callback)=>{
        let getUser = getUserAndRoom(socket.id);

        //emit massage to a particular room
        io.to(getUser.messageRoom).emit('chats', {user: getUser.currentUser, text: message});

        callback();
   })


    //disconnect below fires when a users disconnects from the socket
    socket.on('disconnect',()=>{
        console.log('someone just left');
    })
})

app.use(router);
server.listen(PORT,()=>{
    console.log(`server has started on port ${PORT}`);
});
