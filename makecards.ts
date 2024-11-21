import sharp from "sharp";
import { PDFDocument, PDFImage, PDFPage, rgb } from "pdf-lib";
import fs, { readFileSync } from "fs";
import { chunk } from "lodash";
import { basename, extname } from "path";

const args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
    console.error("Usage: flashcards words.txt [label]");
    process.exit(1);
}

const textFile = args[0];
const label = args[1] || "";

function escapeForSVG(input: string) {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// Function to create an image
async function createImage(
    line: string,
    width: number,
    height: number
): Promise<Buffer> {
    const words = chunk(line.split(" "), 2).map((pair) => pair.join(" "));
    const lineHeightPercent = 11;
    const offset = ((words.length - 1) / 2) * -lineHeightPercent;

    const wordLines = words
        .map(
            (word, i) =>
                `<text x="50%" y="${53 + offset + lineHeightPercent * i}%" dominant-baseline="middle" text-anchor="middle" font-size="70" fill="black">${escapeForSVG(word)}</text>`
        )
        .join("");

    const svg = `<svg width="${width}" height="${height}">
                    <rect width="100%" height="100%" fill="white"  stroke="black" stroke-width="1" />
                    <text x="85%" y="120px" text-anchor="end" font-size="70" fill="black">${label}</text>
                    ${wordLines}</svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

// Configuration
const pageWidthInch = 11;
const pageHeightInch = 8.5;
const dpi = 300;
const pageWidthPx = pageWidthInch * dpi;
const pageHeightPx = pageHeightInch * dpi;
const gridCols = 4;
const gridRows = 4;
const cardWidthPx = pageWidthPx / gridCols;
const cardHeightPx = pageHeightPx / gridRows;

(async () => {
    const pdfDoc = await PDFDocument.create();
    const pdfImages: PDFImage[] = [];

    const words = readFileSync(textFile, "utf-8")
        .split("\n")
        .map((w) => w.trim())
        .filter((w) => w.length > 0);

    for (const word of words) {
        const imageBuffer = await createImage(word, cardWidthPx, cardHeightPx);
        const pdfImage = await pdfDoc.embedPng(imageBuffer);
        pdfImages.push(pdfImage);
    }

    let page: PDFPage;
    // Placing images in grid
    words.forEach((_, i) => {
        if (i % 16 === 0) {
            page = pdfDoc.addPage([pageWidthPx, pageHeightPx]);
        }
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);
        const x = col * cardWidthPx;
        const y = (row * cardHeightPx) % pageHeightPx;
        page.drawImage(pdfImages[i], {
            x,
            y,
            width: cardWidthPx,
            height: cardHeightPx,
        });
    });

    const originalExtension = extname(textFile);

    const outputFilename =
        originalExtension[0] === "."
            ? textFile.slice(0, -originalExtension.length) + ".pdf"
            : textFile + ".pdf";

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFilename, pdfBytes);
    console.log(`PDF saved as ${outputFilename}`);
})();
