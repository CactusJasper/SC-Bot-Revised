const { Configuration, OpenAIApi } = require("openai");
const { codeBlock } = require("./logging");
const removeMd = require('remove-markdown');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_SECRET,
});
const openai = new OpenAIApi(configuration);

exports.clasifyMessage = async (message) => {
    if(!message.content) return;
    const response = await openai.createModeration({ input: removeMd(message.content), model: 'text-moderation-stable' });
    const results = response.data.results[0];
    if(Number(results.category_scores.hate).toFixed(2) >= 0.9) results.categories.hate = true;
    if(Number(results.category_scores["hate/threatening"]).toFixed(2) >= 0.9) results.categories["hate/threatening"] = true;
    if(Number(results.category_scores["self-harm"]).toFixed(2) >= 0.9) results.categories["self-harm"] = true;
    if(Number(results.category_scores.sexual).toFixed(2) >= 0.9) results.categories.sexual = true;
    if(Number(results.category_scores["sexual/minors"]).toFixed(2) >= 0.9) results.categories["sexual/minors"] = true;
    if(Number(results.category_scores.violence).toFixed(2) >= 0.9) results.categories.violence = true;
    if(Number(results.category_scores["violence/graphic"]).toFixed(2) >= 0.9) results.categories["violence/graphic"] = true;

    console.log(JSON.stringify({
        message: removeMd(message.content),
        openaiResults: response.data.results,
        newResults: results
    }, null, 4));
    if(results.categories.hate || results.categories["hate/threatening"] || 
        results.categories["self-harm"] || results.categories.sexual || 
        results.categories["sexual/minors"] || results.categories.violence || 
        results.categories["violence/graphic"]
    ) {
        message.react('<:sadge:851788592221126656>');
    }
}

exports.dmModeration = async (message, channel) => {
    if(!message.content) return;
    const response = await openai.createModeration({ input: message.content, model: 'text-moderation-stable' });
    const reply = JSON.stringify({
        message: message.content,
        results: response.data.results
    }, null, 4);
    console.log(reply);
    channel.send("```" + '\n' + reply + "\n```");
}