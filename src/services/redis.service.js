const { createClient } = require('redis');
const { info, error } = require('../utils/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initialize();
  }

  async initialize() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      this.client.on('error', (err) => {
        error(`Redis Error: ${err}`);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        info('Redis connected successfully');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (err) {
      error(`Redis connection failed: ${err}`);
      // Fallback - app should still work without Redis
      this.isConnected = false;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected || !this.client) return null;
      return await this.client.get(key);
    } catch (err) {
      error(`Redis get error: ${err}`);
      return null;
    }
  }

  async set(key, value, expireSeconds = 3600) {
    try {
      if (!this.isConnected || !this.client) return false;
      await this.client.set(key, value);
      if (expireSeconds > 0) {
        await this.client.expire(key, expireSeconds);
      }
      return true;
    } catch (err) {
      error(`Redis set error: ${err}`);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected || !this.client) return false;
      await this.client.del(key);
      return true;
    } catch (err) {
      error(`Redis del error: ${err}`);
      return false;
    }
  }

  async hSet(key, field, value) {
    try {
      if (!this.isConnected || !this.client) return false;
      await this.client.hSet(key, field, value);
      return true;
    } catch (err) {
      error(`Redis hSet error: ${err}`);
      return false;
    }
  }

  async hGetAll(key) {
    try {
      if (!this.isConnected || !this.client) return null;
      return await this.client.hGetAll(key);
    } catch (err) {
      error(`Redis hGetAll error: ${err}`);
      return null;
    }
  }

  async hDel(key, field) {
    try {
      if (!this.isConnected || !this.client) return false;
      await this.client.hDel(key, field);
      return true;
    } catch (err) {
      error(`Redis hDel error: ${err}`);
      return false;
    }
  }

  async setExpire(key, expireSeconds) {
    try {
      if (!this.isConnected || !this.client) return false;
      await this.client.expire(key, expireSeconds);
      return true;
    } catch (err) {
      error(`Redis expire error: ${err}`);
      return false; 
    }
  }
}

module.exports = new RedisService(); 