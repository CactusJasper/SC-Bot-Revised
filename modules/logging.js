exports.logMessage = (message, logChannel) => {
    let logMessage = '';

    if(message.attachments.array().length > 0)
    {
        let attachments = message.attachments;
        if(message.content == '' || message.content == undefined)
            logMessage += `[${message.channel.name}] Attachment sent by  ${message.author.username}:`;
        else
            logMessage += `[${message.channel.name}] Message by ${message.author.username}: ${message.content}`;

        if(message.mentions.everyone)
            logMessage += '\nMentioned everyone';
        else if(message.mentions.members.first())
            logMessage += mentionsMessage(message.mentions.members.array(), 10);

        logChannel.send(codeBlock(logMessage), attachments.first());
        return;
    }

    logMessage += `[${message.channel.name}] Message by ${message.author.username}: ${message.content}`;
    if(message.mentions.everyone) logMessage += '\nMentioned everyone';
    else if(message.mentions.members.first()) logMessage += mentionsMessage(message.mentions.members.array(), 10);

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