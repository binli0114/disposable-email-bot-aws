const { BotFrameworkAdapter } = require("botbuilder");
const express = require("express");
const { DisposableEmailBot } = require("../service/teamsConversationBot");
const app = express();
const port = process.env.port || process.env.PORT || 3978;

const serverlessExpress = require("aws-serverless-express");
const server = serverlessExpress.createServer(app);
exports.handler = (event, context) => serverlessExpress.proxy(server, event, context);
const adapter = new BotFrameworkAdapter({
	appId: process.env.MicrosoftAppId,
	appPassword: process.env.MicrosoftAppPassword
});
adapter.onTurnError = async (context, error) => {
	console.error(`\n [onTurnError] unhandled error: ${error}`);

	await context.sendTraceActivity(
		"OnTurnError Trace",
		`${error}`,
		"https://www.botframework.com/schemas/error",
		"TurnError"
	);
	await context.sendActivity("The bot encountered an error or bug.");
	await context.sendActivity("To continue to run this bot, please fix the bot source code.");
};
const conversationReferences = {};

const bot = new DisposableEmailBot(conversationReferences);
app.post("/api/messages", (req, res) => {
	adapter.processActivity(req, res, async context => {
		await bot.run(context);
	});
});
app.listen(port);
