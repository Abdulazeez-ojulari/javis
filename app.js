const express = require("express");
require("dotenv").config();
const app = express ();
require('./src/db/connection')();

const cors = require('cors');

app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// const response = await openai.listEngines();gpt-3.5-turbo-16k
// const response = await openai.createFile(
//     fs.createReadStream("mydata.jsonl"),
//     "fine-tune"
// );

var business = require('./src/business/businessRoute');
var chat = require('./src/chat/chatRoute');
var knowledgeBase = require('./src/knowledgeBase/knowledgeBaseRoute');

app.use('/ai/business', business);
app.use('/ai/chat', chat);
app.use('/ai/knowledge-base', knowledgeBase);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});