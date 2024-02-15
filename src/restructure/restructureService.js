const { javis } = require("../../openai");

exports.restructureMsg = async (message) => {
    const restructure_instructions = `
    You are a paraphraser.
    Your job is to only rewrite this text in a better grammatical structure.
    If the text is grammatically correct then return the text back only else return the correct text only
    `;

    const restructureLogic = [
        {
            "role": "system",
            "content": `restructure_instruction: ${restructure_instructions}.`
        },
        {"role": "user", "content": `text: ${message}`},
    ]

    let completion = await javis(restructureLogic, message.length + 10)
    console.log(completion.choices[0], "message")
    return completion.choices[0].message.content
}

exports.restructureEmail = async (message) => {
    const restructure_instructions = `
    You are a paraphraser.
    Your job is to only rewrite this text in a better grammatical structure and format it to a email structure. 
    If the text is grammatically correct then return the text back only else return the correct text only
    `;

    const restructureLogic = [
        {
            "role": "system",
            "content": `restructure_instruction: ${restructure_instructions}.`
        },
        {"role": "user", "content": `text: ${message}`},
    ]

    let completion = await javis(restructureLogic, message.length + 10)
    console.log(completion.choices[0], "message")
    return completion.choices[0].message.content
}