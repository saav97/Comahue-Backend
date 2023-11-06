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

router.get('/data', async (req, res)=>{
    try {
        dataPlatform = await courseController.getDataPlatform();
        res.status(200).json({
            dataPlatform
        })
    } catch (error) {
        res.status(500).json({
            msg:'Error obteniendo los datos de la platforma '+error
        })
    }
})

router.get('/course/:id', async (req, res)=>{
    try {
        const id =  req.params.id;
        const data = await courseController.getCourseInfo(id);
        res.status(200).json({
            data
        })
    } catch (error) {
        res.status(500).json({
            msg: 'Error al obtener información del curso: '+error
        })
    }
})

module.exports = router;