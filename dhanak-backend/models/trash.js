const express = require('express');
const router = express.Router();
const { getTrash } = require('../controllers/trashcontroller');

router.get('/', getTrash);

module.exports = router;
