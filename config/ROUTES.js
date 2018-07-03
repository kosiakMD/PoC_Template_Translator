/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/25/18
 * Time: 9:30 PM
 */

const indexHandler = /*require(*/__dirname + '/../routes/index'/*)*/;
const usersHandler = /*require(*/__dirname + '/../routes/users'/*)*/;
const requestHandler = /*require(*/__dirname + '/../routes/request'/*)*/;
const resultHandler = /*require(*/__dirname + '/../routes/result'/*)*/;
const readerRequestHandler = /*require(*/__dirname + '/../routes/readerRequest'/*)*/;
const resultReaderHandler = /*require(*/__dirname + '/../routes/resultReader'/*)*/;

const ROUTES = {
    error: {
        template: 'error',
    },
    index: {
        template: 'index',
        path: '/',
        handler: indexHandler,
    },
    users: {
        template: 'users',
        path: '/users',
        handler: usersHandler,
    },
    request: {
        template: 'request',
        path: '/request',
        handler: requestHandler,
    },
    result: {
        path: '/result',
        handler: resultHandler,
        sub: {
            upload: {
                path: '/result/upload',
                method: 'post',
            },
            download: {
                path: '/result/download',
                method: 'get',
            }
        },
    },
    readerRequest: {
        template: 'readerRequest',
        path: '/reader',
        handler: readerRequestHandler,
    },
    resultReader: {
        template: 'resultReader',
        path: '/upload',
        handler: resultReaderHandler,
    },
};

module.exports = ROUTES;