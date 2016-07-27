var u = require('underscore'),
    fs = require('fs');

// Test
// var translationFiles = [
//     'app/components/_lang/lang-de.js',
//     'app/components/_lang/lang-en.js'
// ];
//
// var fileContent = "$translate(['STOMT_BECAUSE', 'STOMT_WOULD']).then(function(translation) {stomtBecause = translation.STOMT_BECAUSE;stomtWould = translation.STOMT_WOULD;replaceText = ['', stomtWould, stomtWould + ' ', stomtWould + '&nbsp;', stomtBecause, stomtBecause + ' ', stomtBecause + '&nbsp;'];});";
//
// translatify = new Translatify(translationFiles);
//
// console.log(translatify.optimize(fileContent));


/**
 * translatify.optimize(fileContent) with optimized translationFiles
 * 1. Only run this script with minified (removed whitespaces) files
 * 2. Extend "generateReplacementPatterns"-function if necessary
 * 3. Use at least 3 chars long translation variable and starts with an alphabetic character
 * @param translationFiles
 * @constructor
 */
function Translatify(translationFiles){

    var optimizedVariables = getOptimizedVariables(translationFiles);

    /**
     * Optimize fileContent
     * @param fileContent
     */
    this.optimize = function(fileContent){
        var optimized = false, t, patterns, re;
        // Walk through all variabes to check if something has to be replaced
        for (var key in optimizedVariables) {
            // Check if key really exists
            if (optimizedVariables.hasOwnProperty(key)) {
                // Check if variable is present
                if( (fileContent.split(optimizedVariables[key]).length - 1) > 0 ) {
                    // Generate project specific patterns
                    patterns = generateReplacementPatterns( optimizedVariables[key], key);

                    for(var pk in patterns){
                        if(Array.isArray(patterns[pk])){

                            re = new RegExp(patterns[pk][0], 'g');
                            t = fileContent.replace(re, patterns[pk][1]);

                            // Check if file was optimized
                            if(fileContent != t){
                                fileContent = t;
                                optimized = true;
                            }
                        }
                    }
                }
            }
        }

        if(optimized){
            console.log('File has been optimized');
        }

        return fileContent;
    }

    /**
     * Generate replacement patterns
     *
     * It is important to extend those patterns as needed
     * which depends on the way translation varables are used
     *
     *
     * @param search
     * @param replace
     * @returns {*[]}
     */
    function generateReplacementPatterns(search, replace){
        return [                                                      // Example usage
            ["\'" + search + "\'", "'" + replace + "'"],              // 'VARIABLENAME' | translate
            ["\," + search + "\:", "," + replace + ":"],              // ,INFOPAGE_PRIVACYPOLICY_TITLE:"
            ["\,\n" + search + "\:", "," + replace + ":"],            // [new line],INFOPAGE_PRIVACYPOLICY_TITLE:"
            ["\\\\'" + search + "\\\\'", "\\'" + replace + "\\'"],    // {{::\'STOMT_FROM_GIPHY_CAPS\'| translate}}
            ["\>" + search + "\<", ">" + replace + "<"],              // <span translate>VARIABLENAME</span>
            ["translation\." + search , "translation." + replace],    // var stomtBecause = translation.STOMT_BECAUSE;
        ];
    }

    /**
     * Get all variables and generate shorthands
     * @param translationFiles
     * @returns {Array}
     */
    function getOptimizedVariables(translationFiles){
        var variables = getVariablesFromTranslationFiles(translationFiles);
        return generateShorthands(variables);
    }

    /**
     * Get Variables from TranslationFiles
     */
    function getVariablesFromTranslationFiles(translationFiles){
        // Get variables from all translation-files
        var vars = [];
        u.each(translationFiles, function(translationFile) {
            var translationFileString = fs.readFileSync(translationFile, 'utf8'),
                translationVariables = translationFileString.match(/'([0-9A-Z_,.-]*?)'/g);
            vars = vars.concat(translationVariables);
        });
        // Remove enclosing single-quotes
        vars = JSON.parse(JSON.stringify(vars).replace(/\'/g,''));
        // Flatten array
        vars = u.flatten(vars);
        // Only uniques
        vars = vars.filter(function(value, index, self){return self.indexOf(value)===index});
        // Reindex
        vars = vars.filter(function(val){return val});
        // Filter out rules
        vars = vars.filter(onlyUseSecureVariables);
        return vars;
    }

    /**
     * Check if variables passes security checks
     * @param variable
     * @returns {boolean}
     */
    function onlyUseSecureVariables(variable){
        // At least 3 chars long
        if(variable.length < 3){
            return false;
        }
        // Does not start with num
        if (variable[0].match(/^[a-zA-Z]/) == null) {
            return false;
        }

        return true;
    }

    /**
     * Create array with shorhandltes as array-keys
     * Allows 52^2 = 2704 combinations
     * @param uniqueVariables
     * @returns {Array}
     */
    function generateShorthands(uniqueVariables){
        var chars = ['',
                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
            amountChars = chars.length - 1,
            amountUniqueVariables = uniqueVariables.length,
            char1 = 0, char2 = 0, i, combinations = {};

        for(i=0;i<amountUniqueVariables;++i)
        {
            if (char2 === amountChars) {
                ++char1;
                char2 = 1;
            } else {
                ++char2;
            }

            combinations[chars[char1] + chars[char2]] = uniqueVariables[i];
        }

        return combinations;
    }

}

// exporting the plugin
module.exports = Translatify;