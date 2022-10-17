exports.logMessage = (message, logChannel) => {
    if(message.attachments.array().length > 0)
    {
        let attachments = message.attachments;
        if(message.content == '' || message.content == undefined)
        {
            logChannel.send(codeBlock(`[${message.channel.name}] Attachment sent by  ${message.author.username}:`), attachments.first());
        }
        else
        {
            logChannel.send(codeBlock(`[${message.channel.name}] Message by ${message.author.username}: ${message.content}`), attachments.first());
        }
    }
    else
    {
        logChannel.send(codeBlock(`[${message.channel.name}] Message by ${message.author.username}: ${message.content}`));
    }
}

const codeBlock = (text) =>
{
    return "```" + '\n' + text + "\n```";
}