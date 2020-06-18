const path = require('path');
const LOCAL_IDENT_NAME = require('../config').webpack.cssLocalIdent;

module.exports = (localIdentName, localName, filePath) => {
    const directories = path.dirname(filePath).split('/');
    const dir = directories[directories.length - 1];
    const basename = path.basename(filePath).replace(/(\.module|\.global)?\.s?css$/i, '');
    const name = dir !== 'styles' ? `${dir}-${basename}` : basename;
    return (localIdentName || LOCAL_IDENT_NAME).replace(/\[\s*name\s*\]/gi, name)
        .replace(/\[\s*local\s*\]/gi, localName);
};
