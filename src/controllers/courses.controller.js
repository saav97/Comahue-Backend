const { MoodleService } = require("../services/moodle");

class CourseControllers{
    constructor(){
        this.moodleservice = new MoodleService();
    }

    async getCourses(){
        const courses = await this.moodleservice.getCourses();
        console.log('esperar tu debes')

        return courses;
    }
}


module.exports = {
    CourseControllers
}