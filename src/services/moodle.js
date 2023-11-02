const moodle_client = require("moodle-client");
const config = require('../config/config.js');

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
        console.log(config.URL);
        console.log(wwwroot);
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

                    /*let regex = /(https?:\/\/[^\s]+\.pdf)/g;
                    let newUrl = 'https://plena.uncoma.edu.ar/webservice/pluginfile.php/$1/course/summary/$1?token=6bb5994be3e1ae3783ec0405b83e12b6';
                    descripcion = descripcion.replace(regex, newUrl);*/

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
            return courses;
        } catch (error) {
            // Manejar el error de la llamada a la API aquí
            console.error("Error en la llamada a la API:", error);
        }

    }

    async getCategories() {
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
    }

    async getImageCourse(courseId) {
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
    }

    async getDataPlatform(courseId) {

        try {
            const client = await this.moodle;
            const users = await client.call({
                wsfunction: 'core_enrol_get_enrolled_users',
                args: {
                    courseid: courseId
                }
            });

            users.forEach(u => {
                if (!(this.dataPlatform.estudiantes.includes(u.fullname)) || u.roles.some(role => role.shortname === 'estudiante')) {
                    this.dataPlatform.estudiantes.push(u.fullname);
                }
                if (!(this.dataPlatform.profesores.includes(u.fullname)) || u.roles.some(role => role.shortname === 'editorprofesor')) {
                    this.dataPlatform.profesores.push(u.fullname);
                }
            });

            return '';
        } catch (error) {
            throw error;
        }
    }
}


module.exports = {
    MoodleService
}