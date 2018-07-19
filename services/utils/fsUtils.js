/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 7/2/18
 * Time: 11:08 AM
 */
const fs = require("fs");
const path = require("path");

const walk = function(dir, done, dirInclude = false) {
    let results = [];
    results.errors = []; // for some Executable errors, e.g. file/dir does not exist
    recursiveDeepWalk(dir, done, dirInclude);

    function recursiveDeepWalk(dir, done, dirInclude) {
        // console.log('walk dir:', dir);
        fs.readdir(dir, function(err, list) {
            if (err) return done(err); // e.g. file/dir does not exist
            let pending = list.length;
            if (!pending) return done(null, results);
            list.forEach(function(file) {
                file = path.resolve(dir, file);
                // check does file/dir exist
                fs.stat(file, function(err, stat) {
                    if (err) results.errors.push(err);
                    // if path is a Folder(Dir), execute a recursive call
                    if (stat && stat.isDirectory()) {
                        let directory = file;
                        // Add directory to array if TRUE; FALSE by default
                        dirInclude && results.push(directory);
                        // a recursive call
                        recursiveDeepWalk(directory, function(err, res) {
                            if (err) results.errors.push(err); // e.g. dir does not exist
                            // results = results.concat(res);
                            if (!--pending) {
                                done(null, results);
                            }
                        });
                    } else { // if path is a File
                        results.push(file);
                        if (!--pending) {
                            done(null, results);
                        }
                    }
                });
            });
        });
    }
};

// const fsUtils = {
//     walk,
// };

module.exports = {
    walk,
};