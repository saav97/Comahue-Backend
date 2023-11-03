const config = require('../config/config');

const Redis = require('ioredis');
const redis = new Redis({
    host:config.REDIS_HOST,
    port:config.REDIS_PORT
})

class RedisServer{

    static async set(key, value){
        return await redis.set(key, value);
    }

    static async get(key){
        return await redis.get(key);
    }

    static async del(key){
        return await redis.del(key);
    }
}


module.exports = RedisServer;