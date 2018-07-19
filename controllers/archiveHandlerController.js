/**
 * Created by WebStorm.
 * Project: Translator
 * User: Anton Kosiak MD
 * Date: 7/19/18
 * Time: 11:42 AM
 */
// import
const fs = require("fs");
const path = require("path");
const extract = require('extract-zip');
const tmp = require('tmp');
const archiver = require('archiver');
const detectCharacterEncoding = require('detect-character-encoding');
const FORMS = require('../static/FORMS');
const walk = require('../services/utils/fsUtils').walk;
const templateRenderController = require('../controllers/templateRenderController');
const changeDirectionHelper = require('../services/helpers/changeDirectionHelper');
const Languages = require('../static/Languages');
const vocabularyKeeper = require('../services/keepers/vocabularyKeeper');
const archiveKeeper = require('../services/keepers/archiveKeeper');

const getEncoding = function(fileBuffer) {
    const charsetMatch = detectCharacterEncoding(fileBuffer);
    // console.log('charset', charsetMatch);
    let encoding = (charsetMatch && charsetMatch.encoding &&
        charsetMatch.encoding) >= 60 ? charsetMatch.encoding : 'UTF-8';
    return encoding;
}

const archiveHandlerController = (req, res, next, result) => {
    const { sessionID: sid } = req;
    const vocabulary = vocabularyKeeper.get(sid);
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
        const pathToTempArchive = archiveKeeper.getFile(sid);
        // console.log('getFile', pathToTempArchive);
        // fs.copyFileSync(archiveHelper.getFile(), `${pathName}/${language}.zip`);

        const inputArchive = pathToTempArchive;
        const extname = path.extname(inputArchive);
        const inputArchiveName = path.basename(inputArchive, extname);
        // console.log('get inputArchive path:', inputArchiveName);

        // const unpackedArchiveFolder = tempFolderUnpackedName;
        // const unpackedArchiveFolder = __dirname + '/../__trash/' + inputArchiveName + '_' + language;
        const unpackedArchiveFolder = '__temp/' + inputArchiveName + '_' + language;
        const unpackedArchiveAbsolutePath = __dirname + '/../public/' + unpackedArchiveFolder;
        // console.log('tempFolderUnpackedName', tempFolderUnpackedName);
        const unpackedArchivePath = unpackedArchiveAbsolutePath + '/' + inputArchiveName;
        // const dist = distPath;

        // const stream = fs.createReadStream(inputArchive)
        //     .pipe(unzip.Extract({ path: unpackedArchiveFolder }));
        extract(inputArchive, {dir: unpackedArchiveAbsolutePath}, function (err) {
            // extraction is complete. make sure to handle the err
            console.error('extract Error:', err);
            // })

            // stream.on('close', () => {
            const templates = ['.html', '.htm', '.css']; // , '.js', '.css'];
            // let count = 0;
            let indexFilePath;
            walk(unpackedArchiveAbsolutePath, (err, files) => {
                // console.log('start to run WALK CALLBACK', count++);
                if (err) {
                    throw err;
                }
                // console.log('files', files);
                files.forEach((file) => {
                    if (!file) return;
                    // console.log('file', file);
                    let ext = path.extname(file);
                    // console.log('ext', ext);
                    if (templates.includes(ext)) {
                        // console.log('ext', ext, 'file', file);
                        // TODO: improve
                        const fileBuffer = fs.readFileSync(file);

                        const encoding = getEncoding(fileBuffer);

                        // console.log('encoding', encoding);
                        let fileAsText = fs.readFileSync(file, encoding);
                        // console.log('fileAsText', fileAsText);
                        let translatedText;
                        if (ext === '.css') {
                            if (typeof Languages[language] === 'object' && Languages[language].direction === 'rtl' ) {
                                // console.log('process CSS', file);
                                translatedText = changeDirectionHelper(fileAsText);
                                fs.writeFileSync(file, translatedText)
                            }
                        } else {
                            // console.log('process HTM[L]', file);
                            if (!!file.match(/index\.htm/i)) {
                                indexFilePath = path.dirname(file) + '/';
                                console.log('indexFilePath', indexFilePath)
                            }
                            translatedText = templateRenderController(fileAsText, vocabulary, language);
                            // console.log('translatedText', translatedText);
                            fs.writeFileSync(file, translatedText)
                        }
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
                        if (indexFilePath) {
                            res.setHeader('Content-Type', 'application/json');
                            res.send(
                                JSON.stringify({
                                    success: true,
                                    path: indexFilePath.split(/public\//)[1],
                                })
                            )
                        } else {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(404).send(JSON.stringify({
                                error: "index.htm(l) file not found",
                                message: "ndex.htm(l) file not found",
                            }));
                        }
                        /*fs.readdir(unpackedArchiveAbsolutePath, (err, files) => {
                            let exception = false;
                            if (err) {
                                console.error(err);
                                exception = true;
                                next(new Error(err));
                            }
                            let root = false;
                            let path = '';
                            // console.log('check PATH', files);
                            if (files.length > 1) {
                                for (let i = files.length - 1; i >= 0; i--) {
                                    let file = files[i];
                                    console.log('file', file);
                                    if (!!file.match(/index/)) {
                                        root = true;
                                        break;
                                    }
                                }
                            }
                            if (root) {
                                path = unpackedArchiveFolder;
                                console.log('RESULT: ROOT FILES', path);
                            } else {
                                const filePath = files[0];
                                let stat;
                                try {
                                    stat = fs.statSync(unpackedArchiveAbsolutePath + '/' + filePath);
                                } catch (readDirError) {
                                    exception = true;
                                    next(new Error('The archive does not exist'));
                                }
                                if (stat && stat.isDirectory()) {
                                    // const fileName = path.basename(filePath);
                                    path = unpackedArchiveFolder + '/' + filePath;
                                    console.log('RESULT: FOLDER', path);
                                } else {
                                    path = unpackedArchiveFolder;
                                    console.log('RESULT: 1 FILE', path);
                                }
                            }
                            if (!exception) {
                                res.setHeader('Content-Type', 'application/json');
                                res.send(
                                    JSON.stringify({
                                        success: true,
                                        path: path,
                                    })
                                )
                            }
                        });*/
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
};

module.exports = archiveHandlerController;