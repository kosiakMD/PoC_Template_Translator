/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/29/18
 * Time: 8:33 PM
 */
const tmp = require('tmp');
const fs = require('fs');

class ArchiveHelper {

    constructor() {
        this.__filePath = '';
        this.__cleanupCallback = () => {};
        this.__tmpobj = '';
    }

    save(archiveFile) {
        return new Promise((resolve, reject) => {
            const tmpobj = tmp.dirSync();
            const folderPath = tmpobj.name;
            // tmp.dir( async (err, path, cleanupCallback) => {
            //     if (err) reject(err);
            //     this.__cleanupCallback = cleanupCallback;
                console.log('archiveHelper Dir: ', folderPath);

                const {data: fileData, name: fileName} = archiveFile;
                const fullPath = `${folderPath}/${fileName}`;
                console.log('archiveHelper fullPath: ', fullPath);

                this.__filePath = fullPath;
                this.__tmpobj = tmpobj;

            fs.writeFileSync(fullPath, fileData, (err) => {
                if (err) {
                    reject(err);
                }
                console.log('The file has been saved!');
            });

                resolve(fullPath);
            // })
        });
    }

    getFile() {
        return this.__filePath;
    }

    clean() {
        // this.__cleanupCallback();
        this.__tmpobj.removeCallback();
    }
}

module.exports = ArchiveHelper;