const { MoodleService } = require("../services/moodle");
const RedisServer = require('../services/redis');

class CourseControllers {
    constructor() {
        this.moodleservice = new MoodleService();
        this.updateCacheInterval = 900000;
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
            const courses = await this.moodleservice.getCoursesFetch();

            await RedisServer.set(key, JSON.stringify(courses));
            return courses;
        }

    }

    async getCourseInfo(id){
        try {
            const data = await this.moodleservice.getInfoCourse(id);
            return data;

        } catch (error) {
            console.log(error);
            return;
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

    async getCoursesFetch(){
        try {
            const courses = await this.moodleservice.getCoursesFetch();
            return courses;
        } catch (error) {
            console.error('error al acceder a la API: ', error);
        }
    }

}



module.exports = {
    CourseControllers
}