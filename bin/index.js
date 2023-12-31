// Importamos modulos necesarios
const config = require('../src/config/config.js');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Configurar la aplicación
const app = express();
app.use(cors());
app.use(morgan());
app.use(express.json());



app.use('/api/data',require('../src/routes/courses.route'));
app.use('/api/email',require('../src/routes/email.route'));
app.use('/api/cache', require('../src/routes/cache.route'));
app.listen(config.PORT, ()=>{
    console.log(`App corriendo en http://${config.HOST}:${config.PORT}`);
})