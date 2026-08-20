'use strict'

const { Router } = require('express')
const filesController = require('../controllers/files.controller')
const asyncHandler = require('../middlewares/asyncHandler')

const router = Router()

// GET /files/data?fileName=<opcional>
router.get('/data', asyncHandler(filesController.getData))

// Punto opcional: GET /files/list
router.get('/list', asyncHandler(filesController.getList))

module.exports = router