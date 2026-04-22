const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function takeScreenshot(subdomain) {
    const screenshotsDir = './src/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const url = `http://${subdomain}`;
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    const year = date.getFullYear();
    // Pad with leading zeros
    day = day < 10 ? `0${day}` : `${day}`;
    month = month < 10 ? `0${month}` : `${month}`;
    const filePath = path.join("./src/screenshots", `${subdomain}-${year}-${month}-${day}.png`);

    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    try {
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 10000
        });

        await page.setViewport({ width: 640, height: 480 });

        await page.screenshot({
            path: filePath,
            fullPage: false
        });

    } catch (err) {
        console.error("Screenshot failed:", err.message);
    }

    await browser.close();

    return `/screenshots/${subdomain}-${year}-${month}-${day}.png`;
}

module.exports = { takeScreenshot };