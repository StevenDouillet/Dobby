require("dotenv").config();

const config = require("./config.json");
const credentials = JSON.parse(JSON.stringify(config));

const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const { Client, Intents, TextChannel} = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const sessionId = uuid.v4()

async function replyMsg(textMsg) {
    console.log('textMsg' , textMsg);

    const sessionClient = new dialogflow.SessionsClient({
        projectId: process.env.PROJECT_ID,
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
        }
    });
    const sessionPath = sessionClient.projectAgentSessionPath(process.env.PROJECT_ID, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: textMsg,
                languageCode: "en-EN",
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    return result.fulfillmentText;
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
    if (msg.content === "ping") {
        msg.reply(String("Pong!"));
    }

    if (!msg.author.bot) {
        if(msg.content !== null && msg.content !== undefined) {
            replyMsg(msg.content).then((res) => {
                msg.reply(String(res));
            });
        } else {
            console.log('msg is null');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
