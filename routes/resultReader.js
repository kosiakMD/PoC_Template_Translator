/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/25/18
 * Time: 9:25 PM
 */
const express = require('express');
const router = express.Router();
const util = require("util");
const fs = require("fs");
const tmp = require('tmp');
const FORMS = require('../static/FORMS');
const excelReaderController = require('../controllers/excelReaderController');
const templateRenderController = require('../controllers/templateRenderController');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//     res.send('respond with a resource');
// });
router.post("/", async (req, res, next) => {
    // console.log(req.files);
    // console.log(req.files.fileUploaded.name);
    if (req.files) {
        // console.log('req', req);
        console.log(util.inspect(req.files));
        let file = req.files.fileUploaded;
        if (file.size === 0) {
            // res.send('respond with a resource');
            return next(new Error("Hey, first would you select a file?"));
        }
        const {data: fileData, name: fileName} = file;
        console.log('typeof data', fileData.constructor.name);

        tmp.dir( async function _tempDirCreated(err, path, cleanupCallback) {
            if (err) throw err;
            console.log('Dir: ', path);

            const fullPath = `${path}/${fileName}`;
            console.log('fullPath: ', fullPath);

            fs.writeFileSync(fullPath, fileData, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });

            try {
                const templateString = req.body[FORMS.excel.textarea];
                const vocabulary = await excelReaderController(fullPath);
                // console.log(vocabulary);
                // console.log(templateString);
                /*res.end("Got your file! \n" + file.name + '\n' +
                    JSON.stringify(vocabulary) + '\n' +
                    templateString
                );*/
                const lang = 'it';
                const renderString = templateRenderController(templateString, vocabulary, lang);
                // console.log(renderString);
                // res.end(renderString);
                res.render('resultReader', {
                    title: 'Render Result',
                    lang: lang,
                    template: renderString,
                })
            } catch (e) {
                return next(new Error(e.message));
                // res.end(e);
            } finally {
                // Manual cleanup
                fs.unlinkSync(fullPath);
                cleanupCallback();
                console.log('The file was cleared!');
            }
        });

    }
});

module.exports = router;