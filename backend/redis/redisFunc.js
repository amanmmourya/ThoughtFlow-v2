import redis from './client.js';
export async function setRecentChatsFromRedis(userId, recentChats) {
    await redis.set(`recentChats:${userId}`, JSON.stringify(recentChats),'EX', 300); // Cache for 1 hour
}
export async function getRecentChatsFromRedis(userId) {
    return await redis.get(`recentChats:${userId}`);
}
export async function setActiveUsersInRedis(userId, isActive) {
    if (isActive) {
        await redis.sadd('activeUsers', userId);
        console.log(`Added ${userId} to active users in Redis`);
    } else {
        await redis.srem('activeUsers', userId);
        console.log(`Removed ${userId} from active users in Redis`);
    }
}
export async function getActiveUsersFromRedis() {
    return await redis.smembers('activeUsers');
    
}

export async function getRateOfMessageOfUserFromRedis(userId) {
    return await redis.get(`messageRate:${userId}`);
}
export async function setRateOfMessageOfUserInRedis(userId) {
    const count=await redis.incr(`messageRate:${userId}`);
    if(count===1){
        await redis.expire(`messageRate:${userId}`, 10); // Set expiration time to 10 seconds
    }
}
