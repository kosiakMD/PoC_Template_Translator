/**
 * Created by WebStorm.
 * Project: Translator
 * User: Anton Kosiak MD
 * Date: 7/19/18
 * Time: 12:24 PM
 */

// TODO: should be based and deleted on the Session life and expiration appropriately
class VocabularyKeeper {
    constructor() {
        this.__map = new Map();
    }

    get size() {
        return this.__map.size
    }

    clear() {
        return this.__map.clear()
    }

    has(key) {
        return this.__map.has(key)
    }

    get(key) {
        return this.__map.get(key)
    }

    set(key, value) {
        return this.__map.set(key, value)
    }

    delete(key) {
        return this.__map.delete(key)
    }

    getAllVocabularies() {
        return this.__map.values()
    }

    getAllSID() {
        return this.__map.keys()
    }

    getAll() {
        return this.__map.entries()
    }

    forEach(callback, ...args) {
        return this.__map.forEach(callback, ...args)
    }

    // works only as method call not just property
    [Symbol.iterator]() {
        return this.__map[Symbol.iterator]();
    }
}

const vocabularyKeeper = new VocabularyKeeper();

module.exports = vocabularyKeeper;