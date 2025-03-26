const redisService = require('./redis.service');
const { debug } = require('../utils/logger');

class ChatCacheService {
  constructor() {
    this.CACHE_TTL = 3600; // 1 hour
  }

  // Keys
  getParticipantsKey(conversationId) {
    return `conversation:${conversationId}:participants`;
  }

  getOnlineUsersKey(conversationId) {
    return `conversation:${conversationId}:online`;
  }

  getMessagesKey(conversationId) {
    return `conversation:${conversationId}:messages`;
  }

  getTypingKey(conversationId) {
    return `conversation:${conversationId}:typing`;
  }

  // Participants cache
  async cacheParticipants(conversationId, participants) {
    try {
      const key = this.getParticipantsKey(conversationId);
      
      // Delete existing cache
      await redisService.del(key);
      
      // Add each participant
      for (const participant of participants) {
        const userId = participant.user._id || participant.user;
        const userData = {
          userId: userId.toString(),
          role: participant.role,
          name: participant.user.name || '',
          avatar: participant.user.avatar || '',
          email: participant.user.email || ''
        };
        
        await redisService.hSet(key, userId.toString(), JSON.stringify(userData));
      }
      
      await redisService.setExpire(key, this.CACHE_TTL);
      debug(`Cached ${participants.length} participants for conversation ${conversationId}`);
      return true;
    } catch (err) {
      debug(`Error caching participants: ${err}`);
      return false;
    }
  }

  async getParticipantsFromCache(conversationId) {
    try {
      const key = this.getParticipantsKey(conversationId);
      const cachedData = await redisService.hGetAll(key);
      
      if (!cachedData || Object.keys(cachedData).length === 0) {
        return null;
      }
      
      return Object.values(cachedData).map(data => JSON.parse(data));
    } catch (err) {
      debug(`Error getting participants from cache: ${err}`);
      return null;
    }
  }

  async invalidateParticipantsCache(conversationId) {
    try {
      const key = this.getParticipantsKey(conversationId);
      await redisService.del(key);
      debug(`Invalidated participants cache for conversation ${conversationId}`);
      return true;
    } catch (err) {
      debug(`Error invalidating participants cache: ${err}`);
      return false;
    }
  }

  // Online users tracking
  async addOnlineUser(conversationId, userId) {
    try {
      const key = this.getOnlineUsersKey(conversationId);
      await redisService.hSet(key, userId.toString(), Date.now().toString());
      return true;
    } catch (err) {
      debug(`Error adding online user: ${err}`);
      return false;
    }
  }

  async removeOnlineUser(conversationId, userId) {
    try {
      const key = this.getOnlineUsersKey(conversationId);
      await redisService.hDel(key, userId.toString());
      return true;
    } catch (err) {
      debug(`Error removing online user: ${err}`);
      return false;
    }
  }

  async getOnlineUsers(conversationId) {
    try {
      const key = this.getOnlineUsersKey(conversationId);
      const onlineUsers = await redisService.hGetAll(key);
      
      if (!onlineUsers) return [];
      
      return Object.keys(onlineUsers);
    } catch (err) {
      debug(`Error getting online users: ${err}`);
      return [];
    }
  }

  // Typing indicator
  async setUserTyping(conversationId, userId) {
    try {
      const key = this.getTypingKey(conversationId);
      // Set user as typing with 10 second expiry
      await redisService.hSet(key, userId.toString(), Date.now().toString());
      await redisService.setExpire(key, 10); // Expire after 10 seconds
      return true;
    } catch (err) {
      debug(`Error setting user typing: ${err}`);
      return false;
    }
  }

  async getUsersTyping(conversationId) {
    try {
      const key = this.getTypingKey(conversationId);
      const typing = await redisService.hGetAll(key);
      
      if (!typing) return [];
      
      return Object.keys(typing);
    } catch (err) {
      debug(`Error getting users typing: ${err}`);
      return [];
    }
  }

  async stopUserTyping(conversationId, userId) {
    try {
      const key = this.getTypingKey(conversationId);
      await redisService.hDel(key, userId.toString());
      return true;
    } catch (err) {
      debug(`Error stopping user typing: ${err}`);
      return false;
    }
  }

  // Recent messages cache
  async cacheMessages(conversationId, messages, limit = 20) {
    try {
      const key = this.getMessagesKey(conversationId);
      
      // Only keep the most recent messages
      const recentMessages = messages.slice(-limit);
      
      // Delete existing cache
      await redisService.del(key);
      
      // Cache each message
      for (let i = 0; i < recentMessages.length; i++) {
        const message = recentMessages[i];
        await redisService.hSet(key, i.toString(), JSON.stringify(message));
      }
      
      await redisService.setExpire(key, this.CACHE_TTL);
      return true;
    } catch (err) {
      debug(`Error caching messages: ${err}`);
      return false;
    }
  }

  async getMessagesFromCache(conversationId) {
    try {
      const key = this.getMessagesKey(conversationId);
      const cachedData = await redisService.hGetAll(key);
      
      if (!cachedData || Object.keys(cachedData).length === 0) {
        return null;
      }
      
      // Sort by index
      const messages = Object.entries(cachedData)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(([_, value]) => JSON.parse(value));
      
      return messages;
    } catch (err) {
      debug(`Error getting messages from cache: ${err}`);
      return null;
    }
  }

  async invalidateMessagesCache(conversationId) {
    try {
      const key = this.getMessagesKey(conversationId);
      await redisService.del(key);
      return true;
    } catch (err) {
      debug(`Error invalidating messages cache: ${err}`);
      return false;
    }
  }
}

module.exports = new ChatCacheService(); 