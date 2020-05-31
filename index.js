
const express = require('express');
const socketio = require('socket.io');
const PORT = process.env.PORT||5000;
const {getUserAndRoom,  incommingMessage, removeUser} = require('./messages');
const http = require('http');
const app = express();
const router = require('./router');
const server = http.createServer(app);
const io = socketio(server);

var userFirstName = [];
var daysToBirthday = [];

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
       socket.emit('chats', {user: 'chatbot', text: ":) Hi"}) 
       socket.emit('chats', {user: 'chatbot', text: "Please, what\'s your first name?"})

//used to track when the question first name is asked
     
     userFirstName.push({FirstName: false, id: currentUser})
       //join the room/ creates a virtual room
       socket.join(recievedMessage.messageRoom);

       
       callback();
    })

    //waiting for sendMe from client socket
    socket.on('sendMe', (message, callback)=>{
        let getUser = getUserAndRoom(socket.id);

       

        //emit massage to a particular room
        io.to(getUser.messageRoom).emit('chats', {user: getUser.currentUser, text: message});
        let mostRecentUser = userFirstName.find((user)=> user.id === getUser.currentUser)
        if(mostRecentUser.FirstName === false){
            
           let indexOfUser = userFirstName.findIndex((user)=> user.id === getUser.currentUser);
            userFirstName[indexOfUser].FirstName = message;


            io.to(getUser.messageRoom).emit('chats', {user: "chatbot", text: `welcome ${message}, hope you are having a great day?`});
            io.to(getUser.messageRoom).emit('chats', {user: "chatbot", text: "Please, what is your birth date? YYYY-MM-DD"});
            
        }

        let regBirthday= /\d\d\d\d-\d\d-\d\d/
        if(!(mostRecentUser.FirstName === false) && regBirthday.test(message)){
            // create an array of year at index 0, month at index 1 and day at index 0
            let currentUserDateArray = message.split("-");
            let currentUserBirthday = currentUserDateArray[2];
            let currentUserBirthMonth = currentUserDateArray[1];
            let currentUserBirthYear = currentUserDateArray[0];

            if(currentUserBirthMonth > 12 || currentUserBirthMonth < 0 
                || currentUserBirthYear >2020 || currentUserBirthYear< 0
                || currentUserBirthday >31 || currentUserBirthday<0){
                    io.to(getUser.messageRoom).emit('chats',{user: "chatbots", text: "Please Enter a valid birth date."})

            }else{// The statement to Run if the user entered the correct date
                    let d = new Date();
 
            let presentDate = d.getDate();
            let presentMonth = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
          //  let presentYear = d.getFullYear()
            let monthDifference;
            let dayDifference;
            if(presentMonth>currentUserBirthMonth){
                monthDifference = (12-(presentMonth-currentUserBirthMonth));
            }else{
                monthDifference = (currentUserBirthMonth- presentMonth);
            }

            if(presentDate>currentUserBirthday){
                dayDifference = (30 -(presentDate-currentUserBirthday));
            }else{
                dayDifference =(currentUserBirthday-presentDate)
            }
            
            let TotaldaysToBirthday = ((monthDifference*30) + dayDifference);

            daysToBirthday.push({id: getUser.currentUser, days: TotaldaysToBirthday});

            io.to(getUser.messageRoom).emit('chats',{user: "chatbot", text: "Do you wish to know how many days to your next birthday?"})

                }
            
            
        }

        let regYes = /(yes|yeah|yup)/i; 
        let ifUserHasEnteredDate = daysToBirthday.find(user => user.id == getUser.currentUser);   
        if(regYes.test(message)&& ifUserHasEnteredDate){
            io.to(getUser.messageRoom).emit('chats', {user: "chatbot", text: `There are ${ifUserHasEnteredDate.days} days left until your next birthday.`});
            io.to(getUser.messageRoom).emit('chats',{user: "chatbot", text: "If you wish to know more, drop your email . I'll be in touch, Goodbye ."});
            
        }

        let regNo = /(no|nah)/i;

        if(regNo.test(message)){
            io.to(getUser.messageRoom).emit('chats',{user: "chatbot", text: "Goodbye "})
        }



        if(!((regNo.test(message))||(regYes.test(message)&& ifUserHasEnteredDate)
        ||(!(mostRecentUser.FirstName === false) && regBirthday.test(message))
        || (mostRecentUser.FirstName === false) )){

            if(ifUserHasEnteredDate){
                io.to(getUser.messageRoom).emit('chats',{user: "chatbot", text: "Please, answer correctly so I can help you."});
            }
        }

        callback();
   })


    //disconnect below fires when a users disconnects from the socket
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
    })
})

app.use(router);
server.listen(PORT,()=>{
    console.log(`server has started on port ${PORT}`);
});
