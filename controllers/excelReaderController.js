/**
 * Created by WebStorm.
 * Project: ml
 * User: Anton Kosiak MD
 * Date: 6/26/18
 * Time: 10:55 AM
 */

const Excel = require('exceljs');

const createVocabulary = (worksheet) => {
    const vocabulary = {};
    worksheet.eachRow((row, rowNumber) => {
        let keyWord = row.getCell(1).value;
        let translation = row.getCell(2).value;
        vocabulary[keyWord] = translation;
    });
    return vocabulary;
};

const excelReaderController = async (pathToFile) => {
    // console.log(pathToFile);
    try {
        let workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(pathToFile);
        const vocabularies = {}; // [];
        workbook.eachSheet((worksheet, sheetId) => {
            const {name: language} = worksheet;
            console.log('sheetId', sheetId);
            // console.log('worksheet', worksheet)
            const vocabulary = createVocabulary(worksheet, language);
            // console.log(vocabulary);
            vocabularies[language] = vocabulary;
        });
        return vocabularies;
    } catch (error) {
        //     console.log(3)
        //     console.log(Object.getOwnPropertyDescriptors(error));
        throw error;
        // new Error(error);
    }
};

module.exports = excelReaderController;