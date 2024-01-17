// Import necessary modules and services
const gmail = require("./config/gmailService");  // Import Gmail service configuration
const { createReplyRaw, createLabelIfNeeded } = require("./controllers/replyService");  // Import functions from replyService controller

// Set to keep track of users who have already received a reply
const repliedUsers = new Set();

// Function to periodically check emails and send replies
async function checkEmailsAndSendReplies() {
    try {
        // Fetch unread messages from Gmail API
        const res = await gmail.users.messages.list({
            userId: "me",
            q: "is:unread",
        });

        const messages = res.data.messages;

        // If there are unread messages, process each one
        if (messages && messages.length > 0) {

            // perform operations on every message
            for (const message of messages) {

                // Retrieve details of the email
                const email = await gmail.users.messages.get({
                    userId: "me",
                    id: message.id,
                });

                // Extract relevant headers from the email
                const from = email.data.payload.headers.find(
                    (header) => header.name === "From"
                );
                const toHeader = email.data.payload.headers.find(
                    (header) => header.name === "To"
                );
                const Subject = email.data.payload.headers.find(
                    (header) => header.name === "Subject"
                );

                
                // Extract values from headers
                const From = from.value;
                const toEmail = toHeader.value;
                const subject = Subject.value;

                // console.log("Email from:", From);
                // console.log("To email:", toEmail);

                // Check if the user has already been replied to
                if (repliedUsers.has(From)) {
                    console.log("replied to:", From);
                    continue;
                }

                // Fetch the thread of the email to check for existing replies
                const thread = await gmail.users.threads.get({
                    userId: "me",
                    id: message.threadId,
                });

                const replies = thread.data.messages.slice(1);

                // If there are no existing replies, send a new reply
                if (replies.length === 0) {
                    await gmail.users.messages.send({
                        userId: "me",
                        requestBody: {
                            raw: await createReplyRaw(toEmail, From, subject),
                        },
                    });

                    // Add a custom label to the email
                    const labelName = "CustomLabel";
                    await gmail.users.messages.modify({
                        userId: "me",
                        id: message.id,
                        requestBody: {
                            addLabelIds: [ await createLabelIfNeeded(labelName) ],
                        },
                    });

                    console.log("Sent reply to email:", From);
                    // Add the user to the set of replied users
                    repliedUsers.add(From);
                }
            }
        }
    } catch (error) {
        // Log any errors that occur during email checking and replying
        console.error("Error checking emails:", error.message);
    }
}

// Function to generate a random interval between min and max values
function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Set an interval to periodically call the main email checking function
setInterval(checkEmailsAndSendReplies, getRandomInterval(45, 120) * 1000);
