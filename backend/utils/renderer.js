const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const renderTemplate = (templateName, data) => {
    try {
        const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        
        const template = handlebars.compile(templateSource);
        
        const html = template(data);
        
        return html;
    } catch (error) {
        throw new Error(`Template rendering failed: ${error.message}`);
    }
};

module.exports = {renderTemplate} ;