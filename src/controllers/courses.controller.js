const { MoodleService } = require("../services/moodle");
const RedisServer = require('../services/redis');

class CourseControllers {
    constructor() {
        this.moodleservice = new MoodleService();
    }

    async getCourses() {

        const key = 'courses'
        const cacheData = await RedisServer.get(key);

        if (cacheData) {
            console.log('Datos recuperados desde la cache de redis');
            return (JSON.parse(cacheData));
        }
        else {
            // si no hay datos en la cache, realiza una operación costosa
            const courses = await this.moodleservice.getCourses();

            await RedisServer.set(key, JSON.stringify(courses));
            return courses;
        }

    }

    async getDataPlatform() {

        const key = 'dataPlatform';

        let cacheData = await RedisServer.get(key);

        if (!cacheData) {
            await this.getCourses();
            cacheData = await RedisServer.get(key);
        }

        return (JSON.parse(cacheData));

    }
}



module.exports = {
    CourseControllers
}