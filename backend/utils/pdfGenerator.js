const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Generate PDF from HTML content
 */
const generatePDF = async (html, businessName) => {
    let browser;
    
    try {
        // Launch headless browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set content
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });
        
        // Generate safe filename
        const safeFilename = businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeFilename}_brochure_${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, '../uploads', filename);
        
        // Generate PDF
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });
        
        await browser.close();
        
        return {
            success: true,
            filename: filename,
            path: outputPath
        };
        
    } catch (error) {
        if (browser) await browser.close();
        console.error('PDF Generation Error:', error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
};

module.exports = { generatePDF };