async function getEmailTemplate(name, variables) {
    const filePath = path.join(process.cwd(), "emails", name);
    let html = await fs.readFile(filePath, "utf-8");

    for (const [key, value] of Object.entries(variables)) {
        html = html.replaceAll(`{{${key}}}`, value);
    }

    return html;
}