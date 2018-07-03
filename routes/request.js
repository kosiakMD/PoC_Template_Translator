/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/25/18
 * Time: 5:42 PM
 */
const express = require('express');
const router = express.Router();
const FORMS = require('../static/FORMS');
const ROUTES = require('../config/ROUTES');

/* GET home page. */
router
    .post('/', function(req, res, next) {
        res.render('request', {
            uploadRoute: ROUTES.result.sub.upload.path, // '/result/upload',
            downloadRoute: ROUTES.result.sub.download.path, // '/result/download',
            title: 'App Translator',
            excelVocabulary: FORMS.excel.excelVocabulary,
            appZipped: FORMS.excel.appZipped,
            select: FORMS.downloadArchive.select,
        });
    })
    .get('/', function (req, res, next) {
        res.render('request', {
            uploadRoute: ROUTES.result.sub.upload.path, // '/result/upload',
            downloadRoute: ROUTES.result.sub.download.path, // '/result/download',
            title: 'App Translator',
            excelVocabulary: FORMS.excel.excelVocabulary,
            appZipped: FORMS.excel.appZipped,
            select: FORMS.downloadArchive.select,
        });
    });

module.exports = router;
