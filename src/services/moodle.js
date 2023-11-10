const moodle_client = require("moodle-client");
const config = require('../config/config.js');
const RedisServer = require('../services/redis');


const wwwroot = config.MOODLE_URL;
const token = config.MOODLE_TOKEN;



class MoodleService {

    moodle = moodle_client.init({
        wwwroot,
        token
    });
    dataPlatform = {
        estudiantes: [],
        profesores: []
    }

    constructor() {

    }

    async getCourses() {
        return new Promise((resolve, reject) => {
            this.moodle.then((client) => {
                let courses = this.getCourseMoodle(client);
                resolve(courses);
            })
        })
    }

    async getCourseMoodle(client) {
        const fechaActual = new Date();
        const courses = [];
        const categories = await this.getCategories();

        try {
            const resp = await client.call({
                wsfunction: 'core_course_get_courses'
            });

            for (let i = 0; i < resp.length; i++) {

                const course = resp[i];
                const courseStartDate = new Date(course.startdate * 1000).toISOString().split('T')[0];
                const courseEndDate = new Date(course.enddate * 1000).toISOString().split('T')[0];

                if (
                    course.visible === 1 && course.id !== 0 && course.categoryid !== 0) {
                    const img = await this.getImageCourse(course.id);
                    await this.getDataPlatform(course.id);
                    const categoria = require('../helpers/search.js').searchCategorieParent(course.categoryid, categories);

                    let descripcion = course.summary.replace(/<img([^>]+)src="https:\/\/plena.uncoma.edu.ar\/webservice\/pluginfile.php\/(\d+)\/course\/summary\/\d+\/([^"]+)"/gi, function (match, p1, p2, p3) {
                        return '<img' + p1 + `src="${config.MOODLE_URL}/pluginfile.php/` + p2 + '/course/summary/' + p3 + '"';
                    });

                    descripcion = descripcion.replace(/<a([^>]+)href="https:\/\/plena.uncoma.edu.ar\/webservice\/pluginfile.php\/(\d+)\/course\/summary\/\d+\/([^"]+)"/gi, function (match, p1, p2, p3) {
                        return '<a' + p1 + `href="${config.MOODLE_URL}/pluginfile.php/` + p2 + '/course/summary/' + p3 + '"';
                    });



                    if (img) {
                        courses.push({
                            id: course.id,
                            nombre: course.fullname,
                            descripcion,
                            categoria,
                            url: `${wwwroot}/course/view.php?id=${course.id}`,
                            img,
                            fechaInicio: courseStartDate,
                        });
                    }

                }
            }
            const data = {
                cantProfesores: this.dataPlatform.profesores.length,
                cantEstudiantes: this.dataPlatform.estudiantes.length,
                cursosDisponibles: courses.length
            }
            const key = 'dataPlatform';
            await RedisServer.set(key, JSON.stringify(data));
            return courses;
        } catch (error) {
            // Manejar el error de la llamada a la API aquí
            console.error("Error en la llamada a la API:", error);
        }

    }

    /*async getCategories() {
        try {
            return new Promise((resolve, reject) => {
                this.moodle.then((client) => {
                    client.call({
                        wsfunction: 'core_course_get_categories',
                    }).then(async (info) => {
                        const categorias = [];
                        info.forEach((categoria) => {
                            if (categoria.visible == 1) {
                                let aux = (categoria.path).split("/");
                                let catPadre = info.find((cat) => cat.id == aux[1])
                                categorias.push({
                                    idParent: catPadre.id,
                                    idCategory: categoria.id,
                                    name: categoria.name,
                                    nameParent: catPadre.name
                                })
                            }

                        })
                        resolve(categorias)
                    })
                })

            })
        } catch (error) {
            throw error;
        }
    }*/



    /*async getImageCourse(courseId) {

        try {
            const client = await this.moodle;
            const info = await client.call({
                wsfunction: 'core_course_get_courses_by_field',
                args: {
                    field: 'id',
                    value: courseId,
                },
            });

            if (info.courses[0]?.overviewfiles[0]?.fileurl) {
                const imgUrl = `${info.courses[0].overviewfiles[0].fileurl}?token=${token}` || fallbackImageUrl;
                return imgUrl;
            } else {
                return '';
            }
        } catch (error) {
            throw error;
        }
    }*/



    async getDataPlatform(courseId) {

        const url = `${config.MOODLE_URL}/webservice/rest/server.php`;
        const data = {
            wstoken: config.MOODLE_TOKEN,
            wsfunction: 'core_enrol_get_enrolled_users',
            moodlewsrestformat: 'json',
            courseid: courseId
        };

        const response = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        const users = await response.json();
        users.forEach(u => {
            if (!(this.dataPlatform.estudiantes.includes(u.fullname)) || u.roles.some(role => role.shortname === 'student')) {
                this.dataPlatform.estudiantes.push(u.fullname);
            }
            if (!(this.dataPlatform.profesores.includes(u.fullname)) || u.roles.some(role => role.shortname === 'editingteacher')) {
                this.dataPlatform.profesores.push(u.fullname);
            }
        });

        return '';
    }

    async getCourseTheme(courseId) {
        try {
            const client = await this.moodle;
            const theme = await client.call({
                wsfunction: 'core_course_get_contents',
                args: {
                    courseid: courseId
                }
            });

            const temas = [];
            if (typeof (theme)) {
                theme.forEach((contenido) => {
                    temas.push(contenido.name)
                })
            }

            return temas;

        } catch (error) {
            console.log(error);
            return
        }
    }

    async getEnrrolledCourse(courseId) {
        try {
            const client = await this.moodle;
            const users = await client.call({
                wsfunction: 'core_enrol_get_enrolled_users',
                args: {
                    courseid: courseId
                }
            })

            const teacher = users.filter(user => user.roles.some(role => role.shortname == 'editingteacher'));
            //const students = users.filter(user => user.roles.some(role => role.shortname == 'students'));
            teacher.forEach(t => {
                if (!(this.dataPlatform.profesores.includes(t.fullname))) {
                    this.dataPlatform.profesores.push(t.fullname);
                }
            });

            return teacher;

        } catch (error) {
            console.log(error);
            return
        }
    }

    async getInfoCourse(courseId) {
        let temas = await this.getCourseTheme(courseId)
        let profesores = await this.getEnrrolledCourse(courseId);

        const data = {
            //cant,
            temas,
            profesores
        }
        return data;
    }


    /**
     * ################ OBTENCIÓN DE CURSOS ###################### 
     *      Obtenemos todos los cursos visibles en moodle
     * ###########################################################
     */

    async getCoursesFetch() {
        const url = `${config.MOODLE_URL}/webservice/rest/server.php`;
        const data = {
            wstoken: config.MOODLE_TOKEN,
            wsfunction: 'core_course_get_courses',
            moodlewsrestformat: 'json'
        };

        const response = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        const courses = await response.json();
        //Obtenemos todas las categorias, id y fullname
        const categories = await this.getCategories();

        const collectionCourse = [];

        for (const course of courses) {
            let processedCourse = await this.processCourse(course, categories);
            if (processedCourse) {
                collectionCourse.push(processedCourse);
            }
        }

        return collectionCourse;


    }

    /**
     * ################ OBTENCIÓN DE CATEGORIAS ###################### 
     *      Obtenemos todas las categorias visibles
     * ###########################################################
     */

    async getCategories() {
        const url = `${config.MOODLE_URL}/webservice/rest/server.php`;
        const data = {
            wstoken: config.MOODLE_TOKEN,
            wsfunction: 'core_course_get_categories',
            moodlewsrestformat: 'json'
        };

        const response = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        const categories = await response.json();
        const categoriesCollection = [];
        categories.forEach(category => {
            if (category.visible == 1) {
                let aux = (category.path).split("/");
                let catParent = categories.find((cat) => cat.id == aux[1])
                categoriesCollection.push({
                    idParent: catParent.id,
                    idCategory: category.id,
                    name: category.name,
                    nameParent: catParent.name
                })
            }
        })

        return categoriesCollection;
    }

    /**
    * ####################### OBTENCIÓN DE LOS DATOS DE LOS CURSPS ######################### 
    *      Obtenemos toda la información de los cursos, descripción, categoria, imagen, etc.
    * ######################################################################################
    */

    async processCourse(course, categories) {
        const courseStartDate = new Date(course.startdate * 1000).toISOString().split('T')[0];

        if (course.visible === 1 && course.categoryid !== 0) {
            const imgCourse = await this.getImageCourse(course.id);
            await this.getDataPlatform(course.id);
            const categoria = require('../helpers/search.js').searchCategorieParent(course.categoryid, categories);

            let descriptionCourse = await this.processSummary(course.summary);

            let descripcion = descriptionCourse == "" ? ' Curso sin descripción ' : descriptionCourse;

            let img = imgCourse ? imgCourse : 'http://localhost:3500/images/cover.jpg';

            return {
                id: course.id,
                nombre: course.fullname,
                descripcion,
                categoria,
                url: `${wwwroot}/course/view.php?id=${course.id}`,
                img,
            };
        }

    }

    /**
    * ################## OBTENCIÓN DE IMAGEN DEL CURSO ###################### 
    *      Obtenemos la imagen del curso por id
    * #######################################################################
    */

    async getImageCourse(courseId) {
        const url = `${config.MOODLE_URL}/webservice/rest/server.php`;
        const data = {
            wstoken: config.MOODLE_TOKEN,
            wsfunction: 'core_course_get_courses_by_field',
            moodlewsrestformat: 'json',
            field: 'id',
            value: courseId
        };

        const response = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        const info = await response.json();

        if (info.courses[0].overviewfiles[0]) {
            const imgUrl = `${info.courses[0].overviewfiles[0].fileurl}?token=${token}` || fallbackImageUrl;
            return imgUrl;
        }
        else {
            return '';
        }
    }

    async processSummary(summary) {
        let descripcion = summary.replace(/<img([^>]+)src="https:\/\/plena.uncoma.edu.ar\/webservice\/pluginfile.php\/(\d+)\/course\/summary\/\d+\/([^"]+)"/gi, function (match, p1, p2, p3) {
            return '<img' + p1 + `src="${config.MOODLE_URL}/pluginfile.php/` + p2 + '/course/summary/' + p3 + '"';
        });

        descripcion = descripcion.replace(/<a([^>]+)href="https:\/\/plena.uncoma.edu.ar\/webservice\/pluginfile.php\/(\d+)\/course\/summary\/\d+\/([^"]+)"/gi, function (match, p1, p2, p3) {
            return '<a' + p1 + `href="${config.MOODLE_URL}/pluginfile.php/` + p2 + '/course/summary/' + p3 + '"';
        });
        return descripcion;
    }

}

module.exports = {
    MoodleService
}