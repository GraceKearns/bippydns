const path = require("path");
const fs = require("fs").promises;
async function getEmailTemplate(name, variables) {
    const filePath = path.join(process.cwd(), "src", "emails", name);
    let html = await fs.readFile(filePath, "utf-8");

    for (const [key, value] of Object.entries(variables)) {
        console.log(`Replacing {{${key}}} with ${value}`);
        html = html.replaceAll(`{{${key}}}`, value);
    }

    return html;
}

module.exports = {getEmailTemplate}