exports.logMessage = (message, logChannel) => {
    let logMessage = '';
    const attachmentArray = [];
    message.attachments.forEach((attachment) => attachmentArray.push(attachment));

    if(attachmentArray.length > 0)
    {
        if(message.content == '' || message.content == undefined)
            logMessage += `[${message.channel.name}] Attachment sent by  ${message.author.username}:`;
        else
            logMessage += `[${message.channel.name}] Message by ${message.author.username}: ${message.content}`;

        if(message.mentions.everyone)
            logMessage += '\nMentioned everyone';
        else if(message.mentions.members.first()) {
            const array = [];
            message.mentions.members.forEach((member) = array.push(member));
            logMessage += mentionsMessage(array, 10);
        }
        logChannel.send(codeBlock(logMessage), attachmentArray[0]);
        return;
    }

    logMessage += `[${message.channel.name}] Message by ${message.author.username}: ${message.content}`;
    if(message.mentions.everyone) logMessage += '\nMentioned everyone';
    else if(message.mentions.members.first()) {
        const array = [];
        message.mentions.members.forEach((member) = array.push(member));
        logMessage += mentionsMessage(array, 10);
    }

    logChannel.send(codeBlock(logMessage));
}

const codeBlock = (text) =>
{
    return "```" + '\n' + text + "\n```";
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