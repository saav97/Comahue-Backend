const express = require('express');
const { CacheControllers } = require('../controllers/cache.controllers');

const cacheController = new CacheControllers();

const router = express.Router();

router.get('/actualizar-cache', async (req, res) => {
    try {
        await cacheController.actualizarCacheCursos();
        res.status(200).json({
            msg: 'Cache actualizada'
        })
    } catch (error) {
        res.status(500).json({
            msg: 'Error actualizando la cache: ', error
        })
    }
});

module.exports = router;