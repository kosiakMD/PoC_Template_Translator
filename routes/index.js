var ROUTES = require('../config/ROUTES');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(ROUTES);
  res.render('index', { title: 'Express' });
});

module.exports = router;
