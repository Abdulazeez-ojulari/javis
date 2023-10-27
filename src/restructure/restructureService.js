const { javis } = require("../../openai");

exports.restructureMsg = async (message) => {
    const restructure_instructions = `
    You are a paraphraser.
    Your job is to only correct grammatical errors in the message provided to you
    `;

    const restructureLogic = [
        {
            "role": "system",
            "content": `restructure_instruction: ${restructure_instructions}.`
        },
        {"role": "user", "content": `message: ${message}`},
    ]

    let completion = await javis(restructureLogic, message.length + 10)
    console.log(completion.choices[0], "message")
    return completion.choices[0].message.content
}