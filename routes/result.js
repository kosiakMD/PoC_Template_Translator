/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/25/18
 * Time: 5:42 PM
 */
const express = require('express');
const router = express.Router();
const util = require("util");
const fs = require("fs");
// const fstream = require("fstream");
const path = require("path");
const tmp = require('tmp');
// const unzip = require('unzip');
// const unzip = require('yauzl');
var extract = require('extract-zip')
const archiver = require('archiver');
const ArchiveHelper = require('../helpers/ArchiveHelper');
const FORMS = require('../static/FORMS');
const excelReaderController = require('../controllers/excelReaderController');
const templateRenderController = require('../controllers/templateRenderController');
const walk = require('../utils/fsUtils').walk;
const detectCharacterEncoding = require('detect-character-encoding');

const noFileException = (res) => {
    // throw new Error('no files');
    // return next(new Error("Oops, first would you select a file?"));
    // res.statusMessage = "Required files not found";
    // res.status(400).end();
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({
        error: "No files detected.",
        message: "Oops, first would you select a file?",
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

const archiveHelper = new ArchiveHelper();
let vocabulary = {};

const handler = (req, res, next, result) => {
    // console.log('request', req);
    try {
        const language = req.body[FORMS.downloadArchive.select];
        console.log('language', language);
        if (!language) {
            throw new Error('No Language selected');
        }
        const {name: tempFolderUnpackedName, removeCallback} = tmp.dirSync();
        // const tempFolderUnpackedName = tmp.tmpNameSync();
        // console.log('pathName', pathName);
        console.log('getFile', archiveHelper.getFile());
        // fs.copyFileSync(archiveHelper.getFile(), `${pathName}/${language}.zip`);

        const inputArchive = archiveHelper.getFile();
        const extname = path.extname(inputArchive);
        const inputArchiveName = path.basename(inputArchive, extname);
        console.log('get inputArchive path:', inputArchiveName);

        // const unpackedArchiveFolder = tempFolderUnpackedName;
        // const unpackedArchiveFolder = __dirname + '/../__trash/' + inputArchiveName + '_' + language;
        const unpackedArchiveFolder = '__temp/' + inputArchiveName + '_' + language;
        const unpackedArchiveAbsolutePath = __dirname + '/../public/' + unpackedArchiveFolder;
        console.log('tempFolderUnpackedName', tempFolderUnpackedName);
        const unpackedArchivePath = unpackedArchiveAbsolutePath + '/' + inputArchiveName;
        // const dist = distPath;

        // const stream = fs.createReadStream(inputArchive)
        //     .pipe(unzip.Extract({ path: unpackedArchiveFolder }));
        extract(inputArchive, {dir: unpackedArchiveAbsolutePath}, function (err) {
            // extraction is complete. make sure to handle the err
            console.error(err)
            // })

            // stream.on('close', () => {
            const templates = ['.html', '.htm'] // , '.js', '.css'];
            walk(unpackedArchiveAbsolutePath, (files) => {
                console.log('files', files);
                files.forEach((file) => {
                    if (!file) return;
                    // console.log('file', file);
                    let ext = path.extname(file);
                    if (templates.includes(ext)) {
                        console.log('ext', ext, 'file', file);
                        let fileBuffer = fs.readFileSync(file);
                        const charsetMatch = detectCharacterEncoding(fileBuffer);
                        console.log('charsetMatch', charsetMatch);
                        let fileAsText = fs.readFileSync(file,
                            charsetMatch && charsetMatch.encoding && charsetMatch.encoding >= 50 ?
                                charsetMatch.encoding
                                : 'utf-8');
                        // console.log('fileAsText', fileAsText);
                        let translatedText = templateRenderController(fileAsText, vocabulary, language);
                        // console.log('translatedText', translatedText);
                        fs.writeFileSync(file, translatedText)
                    }
                });

                const downloadFileName = `${inputArchiveName}_${language}.zip`;
                const downloadPath = `${__dirname}/../public/__temp/${downloadFileName}`;
                const outputArchiveStream = fs.createWriteStream(downloadPath);
                const zipArchive = archiver('zip');
                outputArchiveStream.on('close', function () {
                    console.log(zipArchive.pointer() + ' total bytes');
                    console.log('archiver has been finalized and the output file descriptor has closed.');

                    console.log('exist:', fs.existsSync(downloadPath), downloadPath);

                    console.log('Result return as:', result)
                    if (result === 'download') {
                        res.download(downloadPath, downloadFileName, (err) => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log('downloading successful');
                            }
                        });
                    } else {
                        fs.readdir(unpackedArchiveAbsolutePath, (err, files) => {
                            if (err) {
                                console.error(err);
                                next(new Error(err));
                            }
                            let path = '';
                            console.log('check files', files)
                            if (files.length > 1) {
                                path = unpackedArchiveFolder;
                                console.log('RESULT: files');
                            } else {
                                const filePath = files[0];
                                const stat = fs.statSync(unpackedArchiveAbsolutePath+ '/' + filePath);
                                if(stat && stat.isDirectory()) {
                                    // const fileName = path.basename(filePath);
                                    path = unpackedArchiveFolder + '/' + filePath;
                                    console.log('RESULT: folder', path);
                                } else {
                                    path = unpackedArchiveFolder;
                                    console.log('RESULT: 1 file');
                                }
                            }
                            res.setHeader('Content-Type', 'application/json');
                            res.send(
                                JSON.stringify({
                                    success: true,
                                    path: path,
                                })
                            )
                        });
                    }


                });
                zipArchive.on('error', function(err){
                    throw err;
                });
                zipArchive.pipe(outputArchiveStream);
                // zipArchive.bulk([
                //     { expand: true, cwd: 'source', src: ['**'], dest: 'source'}
                // ]);
                zipArchive.directory(unpackedArchiveAbsolutePath, false);
                zipArchive.finalize();
                // res.setHeader('Content-Type', 'application/json')
                //     .send(JSON.stringify({
                //         success: true,
                //         fileName: downloadFileName,
                //     }));});
            });
        });

        // removeCallback();
    } catch (e) {
        next(new Error(e));
    }
}

/* GET home page. */
router
    .post('/upload/', async function(req, res, next) {
        console.log('post');
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
                        archiveHelper.save(appZippedFile); // async
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
    })
    .post('/download/', async (req, res, next) => {
        handler(req, res, next, 'download');
    })
    .post('/preview/', async (req, res, next) => {
        handler(req, res, next, 'preview');
    })
    .get('/download/', (req, res, next) => {
        const downloadFileName = req.query.fileName;
        res.download(`${__dirname}/../public/__temp/${downloadFileName}`)
    })
    .post('/finish/', async () => {
        archiveHelper.clean();
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({success: true}));
    });

module.exports = router;
