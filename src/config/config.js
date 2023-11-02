const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    MOODLE_TOKEN: process.env.TOKEN,
    MOODLE_URL: process.env.URL,
    PORT: process.env.PORT,
    HOST: process.env.HOST
}