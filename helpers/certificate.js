const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateCertificate(
    userName,
    courseTitle,
    certId,
    duration = "2 HRS",
    completionDate = "NOV 23, 2025"
) {
    const filePath = path.join(__dirname, `../certificates/${certId}.pdf`);

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });

    doc.pipe(fs.createWriteStream(filePath));

    const width = doc.page.width;
    const height = doc.page.height;
    const panelWidth = width * 0.28;

    // LEFT DARK PANEL
    doc.rect(0, 0, panelWidth, height).fill("#0A1128");

    // NEON GREEN LOGO SYMBOL
    doc.save()
        .fill("#00FF7F")
        .fontSize(100)
        .font("Helvetica-Bold")
        .text("λ", panelWidth / 2 - 30, height / 2 - 60);
    doc.restore();

    // BACKGROUND LIGHT PATTERN
    doc.save();
    doc.opacity(0.07);
    doc.fillColor("#000000");
    doc.circle(width * 0.62, height * 0.55, 180).fill();
    doc.circle(width * 0.77, height * 0.35, 90).fill();
    doc.restore();

    // TITLE
    doc.fillColor("#0A1128")
        .font("Helvetica-Bold")
        .fontSize(33)
        .text("STATEMENT OF ACCOMPLISHMENT", panelWidth + 60, 60);


    // AWARDED TO
    doc.font("Helvetica")
        .fontSize(14)
        .fillColor("#7C3AED")
        .text("HAS BEEN AWARDED TO", panelWidth + 60, 150);

    doc.font("Helvetica-Bold")
        .fontSize(32)
        .fillColor("#0A1128")
        .text(userName, panelWidth + 60, 180);

    // COURSE TITLE
    doc.font("Helvetica")
        .fontSize(14)
        .fillColor("#7C3AED")
        .text("FOR SUCCESSFULLY COMPLETING", panelWidth + 60, 240);

    doc.font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#0A1128")
        .text(courseTitle, panelWidth + 60, 270);

    // LENGTH
    doc.font("Helvetica")
        .fontSize(13)
        .fillColor("#7C3AED")
        .text("LENGTH", panelWidth + 60, 330);

    doc.font("Helvetica-Bold")
        .fontSize(20)
        .fillColor("#0A1128")
        .text(duration, panelWidth + 60, 350);

    // COMPLETION DATE
    doc.font("Helvetica")
        .fontSize(13)
        .fillColor("#7C3AED")
        .text("COMPLETED ON", panelWidth + 60, 400);

    doc.font("Helvetica-Bold")
        .fontSize(20)
        .fillColor("#0A1128")
        .text(completionDate, panelWidth + 60, 420);

    // AUTO-DRAWN SIGNATURE
    const sigX = width - 280;
    const sigY = height - 190;

    doc.save();
    doc.lineWidth(2);
    doc.strokeColor("#000000");

    doc.moveTo(sigX, sigY)
        .bezierCurveTo(sigX + 50, sigY - 40, sigX + 120, sigY + 40, sigX + 170, sigY - 10)
        .stroke();

    doc.moveTo(sigX + 25, sigY + 25)
        .bezierCurveTo(sigX + 70, sigY + 10, sigX + 140, sigY + 55, sigX + 190, sigY + 15)
        .stroke();

    doc.restore();

    // CEO TEXT
    doc.font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#0A1128")
        .text("SUST CSE\nCEO, LMS ORG", width - 220, height - 90);

    doc.end();

    return `/certificates/${certId}.pdf`;
}

module.exports = { generateCertificate };
