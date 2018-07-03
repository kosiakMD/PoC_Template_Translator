/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 7/2/18
 * Time: 11:08 AM
 */
const fs = require("fs");
const path = require("path");

let results = [];
const walk = function(dir, done) {
    console.log('walk dir:', dir)
    // let results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) {
                            console.log('results 1', results)
                            done(results);
                        }
                    });
                } else {
                    console.log('push', file)
                    results.push(file);
                    if (!--pending) {
                        console.log('results 2', results)
                        done(results);
                    }
                }
            });
        });
    });
};

// const fsUtils = {
//     walk,
// };

module.exports = {
    walk,
};