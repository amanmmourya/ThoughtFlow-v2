const userSocketMap = new Map();
const groupSocketMap=new Map();
const darkSocketMap=new Map();
import GroupMsg from "../models/groupmsg.js";
import SingleMsg from "../models/singlemsg.js";
import TFUser from "../models/users.js";
import DarkMsg from "../models/darkmsg.js";
import { encrypt } from "../utils/encrypt.js";
import redis from '../redis/client.js';
import {getActiveUsersFromRedis,setActiveUsersInRedis} from '../redis/redisFunc.js'

import {getRateOfMessageOfUserFromRedis,setRateOfMessageOfUserInRedis} from '../redis/redisFunc.js'

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user login
    socket.on('register',async (username) => {
      userSocketMap.set(username, socket.id);
      await TFUser.findOneAndUpdate({username},{status:"online"})
      await setActiveUsersInRedis(username, true);
      console.log(`User ${username} logged in with socket ID: ${socket.id} on chat`);
    });
    socket.on('registerGroupUser',async (username) => {
      groupSocketMap.set(username, socket.id);
      console.log(`User ${username} logged in with socket ID: ${socket.id} on group`);
    });
    socket.on('registerDarkUser',async (username) => {
      darkSocketMap.set(username, socket.id);
      console.log(`User ${username} logged in with socket ID: ${socket.id} on dark`);
    });
    socket.on('newMessageSentForGroup',async (data)=>{
      console.log("message at backend",data.message)
      const encryptedMsg = encrypt(data.message);
      const newmessage = new GroupMsg({
        groupIdentity: data.groupIdentity,
        sender: data.sender,
        message: encryptedMsg.content,
        iv: encryptedMsg.iv,
        time: Date.now()
      });
      await newmessage.save();
      socket.broadcast.emit("receiveMessageForGroup", data.sender,data.groupIdentity,data.message);
    })
    socket.on('newMessageSentForDark',async (data)=>{
      console.log("message at backend",data.message)
      const encryptedMsg = encrypt(data.message);
      const newmessage = new DarkMsg({
        darkIdentity: data.darkIdentity,
        sender: data.sender,
        message: encryptedMsg.content,
        iv: encryptedMsg.iv,
        time: Date.now()
      });
      await newmessage.save();
      socket.broadcast.emit("receiveMessageForDark", data.darkIdentity,data.message);
    })
    socket.on('newMessageSent', async (data) => {
      const { sender, receiver, message } = data;

      const countOfMessage=await getRateOfMessageOfUserFromRedis(sender);
      if(countOfMessage && countOfMessage>=3){
          console.log(`User ${sender} has exceeded the message rate limit.`);
          return;
      }
      setRateOfMessageOfUserInRedis(sender);
      // encrypt the message
      const encryptedMsg=encrypt(message);
      console.log(`New message from ${sender} to ${receiver}: ${encryptedMsg}`);
      // Update recent chats for both users
      const senderUser = await TFUser.findOne({ username: sender });
      const receiverUser = await TFUser.findOne({ username: receiver });
      const senderId = senderUser._id;
      const receiverId = receiverUser._id;


      await TFUser.findOneAndUpdate({ username: receiver }, {
        $pull: { recentChats: { recentUser: senderId } },
      })
      await TFUser.findOneAndUpdate({ username: sender }, {
        $pull: { recentChats: { recentUser: receiverId } },
      });
      await TFUser.findOneAndUpdate(
        { username: sender },
        {
          $push: {
            recentChats: {
              $each: [{ recentUser: receiverId, lastMessage: encryptedMsg.content,lastIv:encryptedMsg.iv, time: Date.now() }],
              $position: 0 
            }
          }
        }
      );
      await TFUser.findOneAndUpdate(
        { username: receiver },
        {
          $push: {
            recentChats: {
              $each: [{ recentUser: senderId, lastMessage: encryptedMsg.content,lastIv:encryptedMsg.iv, time: Date.now() }],
              $position: 0
            }
          }
        }
      );

      // Save the message to the database (optional, not implemented here)
      const newMessage = new SingleMsg({
        sender,
        receiver,
        message:encryptedMsg.content,
        iv:encryptedMsg.iv,
        time: new Date()
      });
      await newMessage.save();
      // Emit the message to the receiver
      const receiverSocketId = userSocketMap.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('messageReceived', {
          sender,
          message,
          timestamp: new Date()
        });
        console.log(`Message sent to ${receiver} with socket ID: ${receiverSocketId}`);
      } else {
        console.log(`Receiver ${receiver} is not online`);
      }
    }
    );

    // Handle disconnection
    socket.on('disconnect',async () => {
      console.log(`User disconnected: ${socket.id}`);
      // Optionally, remove the socket from the map if needed
      for (const [userId, id] of userSocketMap.entries()) {
        if (id === socket.id) {
          await TFUser.findOneAndUpdate({username:userId},{status:"offline",lastSeen:Date.now()})
          await setActiveUsersInRedis(userId, false);
          userSocketMap.delete(userId);
          groupSocketMap.delete(userId);
          darkSocketMap.delete(userId);
          console.log(`Removed disconnected user ${userId} from map`);
        }
      }
    });
  });
}
export default socketHandler;
export { userSocketMap }; 