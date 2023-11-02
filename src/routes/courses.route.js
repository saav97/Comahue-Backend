const express = require('express');
const {CourseControllers} = require('../controllers/courses.controller');

const courseController = new CourseControllers();

const router = express.Router();

router.get('/courses', async (req, res) => {
    try {
        courses = await courseController.getCourses();
        console.log('No espera!!');
        res.status(200).json({
            courses
        })

    } catch (error) {
        res.status(500).json({
            msg:'Error obteniendo los cursos'+error
        })
    }
})

module.exports = router;