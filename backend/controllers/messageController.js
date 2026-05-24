import SingleMsg from '../models/singlemsg.js';
import TFUser from '../models/users.js';
import { encrypt, decrypt } from '../utils/encrypt.js';
import { setRecentChatsFromRedis, getRecentChatsFromRedis } from '../redis/redisFunc.js';

export const getMessages = async (req, res) => {
    const { sender, receiver } = req.body;

    console.log('getMessages called with:', { sender, receiver });

    // Validate input
    if (!sender || !receiver) {
        return res.status(400).json({ message: 'Sender and receiver are required' });
    }

    try {
        // Fetch messages from the database
        console.log('Fetching messages for sender:', sender, 'and receiver:', receiver);
        const messages = await SingleMsg.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ time: 1 });

        const decryptedMessages = messages.map(msg => ({
            _id: msg._id,
            sender: msg.sender,
            receiver: msg.receiver,
            message: decrypt({ iv: msg.iv, content: msg.message }),
            time: msg.time
        }));

        console.log('Fetched messages:', decryptedMessages);

        return res.status(200).json(decryptedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
export const getRecentChats = async (req, res) => {
    const { userId } = req.body;

    console.log('getRecentChats called with userId:', userId);

    // Validate input
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Fetch recent chats from the database

        const cachedRecentChats = await getRecentChatsFromRedis(userId);
        if (cachedRecentChats) {
            console.log('Recent chats found in Redis cache for user:', userId);
            return res.status(200).json(JSON.parse(cachedRecentChats));
        }

        const user = await TFUser.findOne({ username: userId })
            .populate('recentChats.recentUser', 'username fullName _id') // only necessary fields
            .select('recentChats');

        const decryptedRecentChats = user.recentChats.map(chat => ({
            id:chat._id,
            username:chat.recentUser.username,
            time:chat.time,
            fullName:chat.recentUser.fullName,
            title:chat.recentUser.fullName||chat.recentUser.username,
            lastMessage: decrypt({ iv: chat.lastIv, content: chat.lastMessage })
        }));

        await setRecentChatsFromRedis(userId, decryptedRecentChats);
        console.log('Fetched recent chats:', decryptedRecentChats);

        return res.status(200).json(decryptedRecentChats || []);
    } catch (error) {
        console.error('Error fetching recent chats:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}