/**
 * Created by WebStorm.
 * Project: Translator
 * User: Anton Kosiak MD
 * Date: 7/13/18
 * Time: 12:11 PM
 */

module.exports = function changeDirectionHelper(css) {
    let temp = css.replace(
        /(margin|padding)([ ]*:)[ ]*((-*\d+(px|em|%|cm|in|pc|pt|mm|ex)?|auto|inherit)[ ]*)[ ]*((-*\d+(px|em|%|cm|in|pc|pt|mm|ex)?|auto|inherit)[ ]*)[ ]*((-*\d+(px|em|%|cm|in|pc|pt|mm|ex)?|auto|inherit)[ ]*)[ ]*((-*\d+(px|em|%|cm|in|pc|pt|mm|ex)?|auto|inherit)[ ]*)(!important)*;/g,
        (...args) => {
        return `${args[1]}${args[2]} ${args[3]} ${args[12]} ${args[6]} ${args[9]}${(args[15] ? args[15] : '')};`
    });
    temp = temp.replace(/(left)/g, 'r_i_g_h_t').replace(/(right)/g, 'left').replace(/(r_i_g_h_t)/g, 'right');
    return temp;
};