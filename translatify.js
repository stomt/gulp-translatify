var u = require('underscore'),
    fs = require('fs'),
    walk = require('fs-walk'),
    path = require('path');

// Rules
// 1. Only run this script with minified (removed whitespaces) files
// 2. Extend "generateReplacementPatterns"-function if necessary

var translationsFiles = [
    'app/components/_lang/lang-de.js',
    'app/components/_lang/lang-en.js'
];

// Add local paths or URL
var pathsToOptimize = [
    'dist',
    //'https://cdn.stomt.com/js/scripts-da322ebc3f.js'
];

var supportedExtensions = [
    '.js',
    '.html',
    '.map'
];

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
    return [                                        // Example usage
        ["'" + search + "'", "'" + replace + "'"],    // 'VARIABLENAME' | translate
        ["," + search + ":", "," + replace + ":"],    //
        ["'" + search + "\\", "'" + replace + "\\"],  //
        [">" + search + "<", ">" + replace + "<"],    // <span translate>VARIABLENAME</span>
    ];
}


var notReplaced = [], // translation variables that haven't been replaced
    replaced = [], // translation variables that have been replaced
    variables = getVariablesFromTranslationFiles(translationsFiles);

// Generate shorthands combinations
var variableShorthandCombinations = generateShorthands(variables);

// Walk through files and replace old translation-variables with new onces
u.each(pathsToOptimize, function(optimizePath, variableShorthandCombinations){
    walkThroughDirectory(optimizePath, variableShorthandCombinations)
});

/**
 * Optimize file
 * @param thefile
 */
function optimize(thefile){
    var optimized = false;
    var stream = fs.createReadStream(thefile, 'utf8');

    stream.on('data',function(d){
        // Walk through all variabes to check if something has to be replaced
        for (var key in variableShorthandCombinations) {
            // Check if key really exists
            if (variableShorthandCombinations.hasOwnProperty(key)) {
                // Check if variable is present
                if( (d.split(variableShorthandCombinations[key]).length - 1) > 0 ) {
                    // Generate project specific patterns
                    var patterns = generateReplacementPatterns( variableShorthandCombinations[key], key);

                    for(var pk in patterns){
                        if(Array.isArray(patterns[pk])){
                            var t = d.split(patterns[pk][0]).join(patterns[pk][1]);
                            if(d != t){
                                d = t;
                                optimized = true;
                                replaced.push(variableShorthandCombinations[key]);
                            }
                        }
                    }
                }
            }
        }

        if(optimized){
            var options = { flag : 'w' };
            fs.writeFile(thefile, d, options, function(err) {
                if (err) throw err;
                console.log(thefile + ' has been optimized');
            });
        }
    });
    stream.on('error',function(err){
        console.log("Error 2" + err);
    });
}

/**
 * Walk recursively through directory-structure
 */
function walkThroughDirectory(optimizePath){
    walk.walk(optimizePath, function(basedir, filename, stat) {
        var thefile = basedir+'/'+filename;
        if(stat.isDirectory()){
            walkThroughDirectory(thefile);
        } else {
            if(supportedExtensions.indexOf(path.extname(thefile)) > -1){
                optimize(thefile);
            }
        }
    }, function(err) {
        if (err) console.log("Error 1" + err);
    });
}

/**
 * Get Variables from TranslationFiles
 */
function getVariablesFromTranslationFiles(translationFiles){
    // Get variables from all translation-files
    var vars = [];
    u.each(translationsFiles, function(translationFile) {
        var translationFileString = fs.readFileSync(translationFile, 'utf8');
        var translationVariables = translationFileString.match(/'([0-9A-Z_,.-]*?)'/g);
        vars = vars.concat(translationVariables);
    });
    vars = JSON.parse(JSON.stringify(vars).replace(/\'/g,''));
    vars = vars.filter(function(value, index, self){return self.indexOf(value)===index});
    vars = vars.filter(function(val){return val});
    return vars;
}

/**
 * Create array with shorhandltes as array-keys
 * Allows 62! combinations
 * @param uniqueVariables
 * @returns {Array}
 */
function generateShorthands(uniqueVariables){
    var chars = ['',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    var amountChars = --chars.length;
    var amountUniqueVariables = uniqueVariables.length;
    var char1 = 0, char2 = 0, i, combinations = [];

    for(i=0;i<amountUniqueVariables;++i)
    {
        if (char2 === amountChars) {
            ++char1;
            char2 = 0;
        } else {
            ++char2;
        }

        combinations[ chars[char1] + chars[char2] ] = uniqueVariables[i];
    }

    return combinations;
}

// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) {
    for(var i=0; i < this.length; i++) {
        if(comparer(this[i])) return true;
    }
    return false;
};

// adds an element to the array if it does not already exist using a comparer
// function
Array.prototype.pushIfNotExist = function(element, comparer) {
    if (!this.inArray(comparer)) {
        this.push(element);
    }
};