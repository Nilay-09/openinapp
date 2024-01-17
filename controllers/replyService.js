// replyService.js
const gmail = require("../config/gmailService");

async function createReplyRaw(to, subject) {
    const emailContent = `To: ${to}\nSubject: ${subject}\n\nAutoMatic generated message.`;
    const base64EncodedEmail = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    return base64EncodedEmail;
}

async function createLabelIfNeeded(labelName) {
    try {
        const res = await gmail.users.labels.list({ userId: "me" });
        const labels = res.data.labels;

        const existingLabel = labels.find((label) => label.name === labelName);
        if (existingLabel) {
            return existingLabel.id;
        }

        const newLabel = await gmail.users.labels.create({
            userId: "me",
            requestBody: {
                name: labelName,
                labelListVisibility: "labelShow",
                messageListVisibility: "show",
            },
        });

        return newLabel.data.id;
    } catch (error) {
        console.error("Error creating label:", error.message);
        throw error;
    }
}

module.exports = { createReplyRaw, createLabelIfNeeded };
