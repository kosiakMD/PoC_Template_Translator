/**
 * Created by WebStorm.
 * Project: Translator
 * User: Anton Kosiak MD
 * Date: 7/19/18
 * Time: 11:45 AM
 */
// import
const fs = require("fs");
const tmp = require('tmp');
const FORMS = require('../static/FORMS');
const excelReaderController = require('../controllers/excelReaderController');
const archiveKeeper = require('../services/keepers/archiveKeeper');
const vocabularyKeeper = require('../services/keepers/vocabularyKeeper');

const noFileException = (res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({
        error: "No files detected.",
        message: "Oops, first select a file?",
    }));
    // res.status(500).send('Required files not found');
};

const checkFiles = (excelVocabularyFile, appZippedFile) => {
    if (!excelVocabularyFile || !appZippedFile) {
        return false;
    }
    console.log(excelVocabularyFile.size, appZippedFile.size);
    if (excelVocabularyFile.size === 0 || appZippedFile.size === 0) {
        return false;
    }
    return true;
};

// TODO: move inside of function
let vocabulary = {};

const receiveFilesController = (req, res, next) => {
    if (req.files) {
        // console.log(util.inspect(req.files));
        const excelVocabularyFile = req.files[FORMS.excel.excelVocabulary];
        const appZippedFile = req.files[FORMS.excel.appZipped];
        if (!checkFiles(excelVocabularyFile, appZippedFile)) {
            noFileException(res);
        } else {
            // console.log(req.files);
            const {data: fileData, name: fileName} = excelVocabularyFile;
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
                    vocabulary = await excelReaderController(fullPath);
                    // console.log('session', req.session);
                    // console.log('sessionID', req.sessionID);
                    const { sessionID: sid } = req;
                    vocabularyKeeper.set(sid, vocabulary);
                    archiveKeeper.save(sid, appZippedFile); // async
                    const languages = Object.keys(vocabulary);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        success: true,
                        languages: languages,
                        count: languages.length,
                    }));
                } catch (e) {
                    return next(new Error(e.message));
                } finally {
                    // Manual cleanup
                    fs.unlinkSync(fullPath);
                    cleanupCallback();
                    console.log('The file was cleared!');
                }
            });
        }
    } else {
        noFileException(res);
    }
};

module.exports = receiveFilesController;