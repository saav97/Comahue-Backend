// Importamos modulos necesarios
const config = require('../src/config/config.js');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Configurar la aplicación
const app = express();
app.use(cors());
app.use(morgan());
app.use(express.json());
app.use(express.static(path.join(__dirname,'..','src','public')));
let dire = path.join(__dirname,'..','src','public')

app.use('/api/data',require('../src/routes/courses.route'));
app.use('/api/email',require('../src/routes/email.route'));
app.use('/api/cache', require('../src/routes/cache.route'));
app.listen(config.PORT, ()=>{
    console.log(`App corriendo en http://${config.HOST}:${config.PORT}`);
})