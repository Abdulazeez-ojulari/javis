const { restructureMsg } = require("./restructureService");

module.exports.restructureMessage = async (req, res) => {
    let { message } = req.body;
  
    let result = await restructureMsg(message)
  
    res.send({"result": result})
    return;
};