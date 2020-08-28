const {
	TurnContext,
	MessageFactory,
	TeamsActivityHandler,
	CardFactory,
	ActionTypes
} = require("botbuilder");
const randomId = require("random-id");
const axios = require("axios");
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const TextEncoder = require("util").TextEncoder;

class DisposableEmailBot extends TeamsActivityHandler {
	constructor(conversationReferences) {
		super();
		this.conversationReferences = conversationReferences;
		this.onConversationUpdate(async (context, next) => {
			await next();
		});
		this.onMessage(async context => {
			TurnContext.removeRecipientMention(context.activity);
			const text = context.activity.text.trim().toLocaleLowerCase();
			if (text.includes("mention")) {
				await this.mentionActivityAsync(context);
			} else if (text.toLowerCase() === "create") {
				await this.createEmail(context);
			} else if (text.toLowerCase() === "status") {
				await this.checkStatus(context);
			} else {
				await this.cardActivityAsync(context, false);
			}
		});
	}

	async cardActivityAsync(context, isUpdate) {
		const cardActions = [
			{
				type: ActionTypes.MessageBack,
				title: "Create Email",
				value: null,
				text: "Create"
			},
			{
				type: ActionTypes.MessageBack,
				title: "Check Status",
				value: null,
				text: "Status"
			}
		];

		if (isUpdate) {
			await this.sendUpdateCard(context, cardActions);
		} else {
			await this.sendWelcomeCard(context, cardActions);
		}
	}

	async sendUpdateCard(context, cardActions) {
		const data = context.activity.value;
		data.count += 1;
		cardActions.push({
			type: ActionTypes.MessageBack,
			title: "Update Card",
			value: data,
			text: "UpdateCardAction"
		});
		const card = CardFactory.heroCard(
			"Updated card",
			`Update count: ${data.count}`,
			null,
			cardActions
		);
		card.id = context.activity.replyToId;
		const message = MessageFactory.attachment(card);
		message.id = context.activity.replyToId;
		await context.updateActivity(message);
	}

	async sendWelcomeCard(context, cardActions) {
		const card = CardFactory.heroCard("Please select the action", "", null, cardActions);
		await context.sendActivity(MessageFactory.attachment(card));
	}

	async checkStatus(context) {
		const activity = context["_activity"];
		const { from } = activity;
		const { id: requestId } = from;
		const res = await axios.get(
			` https://6ygy03pctd.execute-api.us-east-1.amazonaws.com/dev/email/status/${requestId}`
		);

		const { data } = res;
		console.log(JSON.stringify(data));
		let message;
		if (data.message === "email address already exists") {
			message = MessageFactory.text(
				`You have a valid email: ${data.address} will be expired in ${data.expiredIn} minutes`
			);
		} else {
			message = MessageFactory.text(data.message);
		}
		await context.sendActivity(message);
	}

	async createEmail(context) {
		const { activity } = context;
		const { from } = activity;
		const len = 8;
		const id = randomId(len);
		const emailAddress = `${id}@happyeme.com`;
		const activityId = from.id;
		//console.log(`ActivityId: ${activityId}`)
		const res = await this.createEmailPost(emailAddress, activityId, context);
		const { data } = res;
		console.log(JSON.stringify(data));
		let message;
		if (data.message === "email address already exists") {
			message = MessageFactory.text(
				`You have a valid email: ${data.address} will be expired in ${data.expiredIn} minutes`
			);
		} else {
			message = MessageFactory.text(`email: ${emailAddress} is created successfully`);
		}
		await context.sendActivity(message);
	}

	async createEmailPost(emailAddress, activityId, context) {
		const newEmail = {
			emailAddress,
			activityId,
			context
		};
		return axios.post(
			"https://6ygy03pctd.execute-api.us-east-1.amazonaws.com/dev/email",
			newEmail
		);
	}

	async mentionActivityAsync(context) {
		const mention = {
			mentioned: context.activity.from,
			text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
			type: "mention"
		};

		const replyActivity = MessageFactory.text(`Hi ${mention.text}`);
		replyActivity.entities = [mention];
		await context.sendActivity(replyActivity);
	}

	async deleteCardActivityAsync(context) {
		await context.deleteActivity(context.activity.replyToId);
	}
}

module.exports.DisposableEmailBot = DisposableEmailBot;
