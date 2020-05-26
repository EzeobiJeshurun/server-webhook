
//holds the users details
const roomDetails = []

const removeUser = (currentUser) =>{
 const index = roomDetails.findIndex((user)=> user.currentUser === currentUser);
 if(index !== -1){
     return roomDetails.splice(index,1)[0];
 }
};
// the id in function below is "id : socket.id"
const incommingMessage = ({id, currentUser, messageRoom})=>{

  let  user = {id, currentUser, messageRoom}
//add the user to roomDetail
   roomDetails.push(user);

//todo add error scenerio
   

   return user;


}

const getUserAndRoom = (id)=> {
// user = {id,currentUser, messageRoom}    
let user = roomDetails.find(user=> user.id === id);
return user
}

module.exports = {getUserAndRoom,  incommingMessage, removeUser};