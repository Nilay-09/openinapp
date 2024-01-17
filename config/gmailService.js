
const { google } = require("googleapis");
const oAuth2Client = require("../auth/auth");

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

module.exports = gmail;
