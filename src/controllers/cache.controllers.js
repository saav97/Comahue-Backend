const { MoodleService } = require("../services/moodle");
const RedisServer = require('../services/redis');

class CacheControllers {
    constructor() {
        this.moodleservice = new MoodleService();
    }

    async actualizarCacheCursos() {
        try {
            const courses = await this.moodleservice.getCourses();
            await RedisServer.set(key, JSON.stringify(courses));
            console.log('Cache actualizada');
        } catch (error) {
            console.error('Error al actualizar la caché', error);
        }
    }
}

module.exports = {
    CacheControllers
}