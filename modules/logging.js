let ChatLog = require('../models/chatLog');

exports.logMessage = (message, logChannel) => {
    let logMessage = '';
	const users = message.mentions.parsedUsers.map((user) => user);
    const attachmentArray = [];
    message.attachments.forEach((attachment) => attachmentArray.push(attachment));

    if(attachmentArray.length > 0)
    {
        if(message.content == '' || message.content == undefined)
            logMessage += `[${message.channel.name}] Attachment sent by  ${message.author.username}: ${message.attachments.first().url}`;
        else
            logMessage += `[${message.channel.name}] Message by ${message.author.username}: ${message.content}`;

        if(message.mentions.everyone)
            logMessage += '\nMentioned everyone';
        else if(message.mentions.repliedUser)
            logMessage += `\nReplied to ${message.mentions.repliedUser.username}`;
        else if(users.length > 0)
            logMessage += mentionsMessage(users, 10);
        logChannel.send(codeBlock(logMessage), attachmentArray[0].url);
        return;
    }

    logMessage += `[${message.channel.name}] Message by ${message.author.username}: ${message.content}`;
    if(message.mentions.everyone) logMessage += '\nMentioned everyone';
    else if(message.mentions.repliedUser)
        logMessage += `\nReplied to ${message.mentions.repliedUser.username}`;
    else if(users.length > 0)
        logMessage += mentionsMessage(users, 10);

    logChannel.send(codeBlock(logMessage));

	ChatLog.create({
		channelId: message.channel.id,
		channelName: message.channel.name,
		authorId: message.author.id,
		authorName: message.author.username,
		chatMessage: message.content,
		attachments: attachmentArray
	}).catch((err) => console.log(err));
}

exports.logLargeMessages = async (message, logChannel) => {
    let messageArray = [];
    const users = message.mentions.users.map((user) => user);
    const attachmentArray = [];
    message.attachments.forEach((attachment) => attachmentArray.push(attachment));

    if(attachmentArray.length > 0) {
        if(message.content == '' || message.content == undefined) {
            messageArray.push(codeBlock(`[${message.channel.name}] Attachment sent by  ${message.author.username}: ${message.attachments.first().url}`));
            const promises = messageArray.map((message) => logChannel.send(message));
            await Promise.all(promises);
            return;
        }
        
        contentToMessageArray(message, users).forEach((message) => messageArray.push(message));
        const promises = messageArray.map((message) => logChannel.send(message));
        await Promise.all(promises);
        return;
    }

    contentToMessageArray(message, users).forEach((message) => messageArray.push(message));
    const promises = messageArray.map((message) => logChannel.send(message));
    await Promise.all(promises);

	ChatLog.create({
		channelId: message.channel.id,
		channelName: message.channel.name,
		authorId: message.author.id,
		authorName: message.author.username,
		chatMessage: message.content,
		attachments: attachmentArray
	}).catch((err) => console.log(err));
}

const contentToMessageArray = (message, users) => {
    let messageArray = [];
    const headerText = `[${message.channel.name}] Message by ${message.author.username} - ID ${message.id}:`;
    const headerTextLength = headerText.length + codeBlock('').length;
    const messageChunks = chunkString(message.content, 1990 - headerTextLength);
    for(let i = 0; i < messageChunks.length; i++) {
        messageArray.push(codeBlock(`[${message.channel.name}] Message by ${message.author.username} - ID ${message.id}: ${messageChunks[i]}`));
    }

    // Create a mentions end message if required
    let endMessage = '';
    if(message.mentions.everyone) {
        endMessage += '\nMentioned everyone';
        messageArray.push(codeBlock(endMessage));
    } else if(message.mentions.repliedUser) {
        endMessage += `\nReplied to ${message.mentions.repliedUser.username}`;
        messageArray.push(codeBlock(endMessage));
    } else if(users.length > 0) {
        endMessage += mentionsMessage(users, 10);
        messageArray.push(codeBlock(endMessage));
    }

    return messageArray;
}

const codeBlock = (text) =>
{
    return "```" + '\n' + text + "\n```";
}

function chunkString(str, size) {
	const numChunks = Math.ceil(str.length / size);
	const chunks = new Array(numChunks);

	for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
		chunks[i] = str.substr(o, size);
	}

	return chunks;
    //return str.match(new RegExp('(.|[\r\n]){1,' + size + '}', 'g'));
}

function mentionsMessage(members, limit) {
    let mentions = '\n\nMentions: ';
    const iters = members.length < limit ? members.length : limit;
    for(let i = 0; i < iters; i++) {
        if(i == 0 && members[i])
            mentions += `${members[i].nickname ?? members[i].displayName}`;
        else if(members[i])
            mentions += `, ${members[i].nickname ?? members[i].displayName}`;
    }
    return mentions;
}
