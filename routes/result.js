/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/25/18
 * Time: 5:42 PM
 */
const express = require('express');
const router = express.Router();
const archiveHandlerController = require('../controllers/archiveHandlerController');
const receiveFilesController = require('../controllers/receiveFilesController');
// const ArchiveHelper = require('../helpers/archiveHelper');

// const archiveHelper = new ArchiveHelper();

router
    .post('/upload/', async (req, res, next) => {
        receiveFilesController(req, res, next);
    })
    .post('/download/', async (req, res, next) => {
        archiveHandlerController(req, res, next, 'download');
    })
    .post('/preview/', async (req, res, next) => {
        archiveHandlerController(req, res, next, 'preview');
    })
    .get('/download/', (req, res, next) => {
        try {
            const downloadFileName = req.query.fileName;
            res.download(`${__dirname}/../public/__temp/${downloadFileName}`)
        } catch (e) {
            next(new Error(e));
        }
    });
    // .post('/finish/', async () => {
    //     archiveHelper.clean();
    //     res.setHeader('Content-Type', 'application/json');
    //     res.send(JSON.stringify({success: true}));
    // });

module.exports = router;
