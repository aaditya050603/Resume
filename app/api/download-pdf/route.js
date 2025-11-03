import puppeteer from 'puppeteer';

/**
 * A helper function to create an HTML string from the resume text.
 * This adds basic styling for the PDF output.
 */
const createResumeHtml = (text) => {
  // Convert the plain text to HTML, preserving line breaks
  const content = text.replace(/\n/g, '<br />');
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Resume</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
        </div>
      </body>
    </html>
  `;
};

export async function POST(req) {
  const { resumeText } = await req.json();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(createResumeHtml(resumeText), { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
    },
  });
}