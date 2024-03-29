/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/26/18
 * Time: 3:00 PM
 */
const Mustache = require('mustache');
const Languages = require('../static/Languages');

const templateRenderController = (template, vocabularies, lang) => {
    console.log('templateRenderController', 'lang:', lang);
    // console.log(vocabularies);
    const vocabulary = vocabularies[lang];
    vocabulary['LANG'] = Languages[lang] || 'en';
    // vocabulary['LANG'] = `lang="${Languages[lang] || 'en'}"`;
    // console.log('vocabulary', vocabulary);
    return Mustache.render(template, vocabulary);
};

module.exports = templateRenderController;