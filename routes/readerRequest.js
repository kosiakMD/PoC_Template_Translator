/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/25/18
 * Time: 5:42 PM
 */
var ROUTES = require('../config/ROUTES');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('readerRequest', { title: 'Excel Reader' });
});

module.exports = router;
