'use strict'

const { Router } = require('express')
const filesController = require('../controllers/files.controller')

const router = Router()

// GET /files/data?fileName=<opcional>
router.get('/data', filesController.getData)

// Punto opcional: GET /files/list
router.get('/list', filesController.getList)

module.exports = router
