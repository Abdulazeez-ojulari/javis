const errorMiddleware = require('../middlewares/error');
const { Order } = require('./orderModel');

module.exports.getOrders = errorMiddleware(async (req, res) => {
    let { businessId } = req.params;

    const orders = await Order.find({businessId: businessId})
    if(!orders){
        return res.status(404).send({message: "Order doesn't exists"});
    }

    return res.send(orders)
})