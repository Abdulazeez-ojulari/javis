const axios = require('axios');

module.exports.axiosClient = axios.create({
  baseURL: `https://backend.preciselighting.ng/graphql`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});

module.exports.paystackClient = axios.create({
  baseURL: `https://api.paystack.co/transaction`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Authorization': 'Bearer sk_test_3de898aa3e18d22f446825eb0be3b693da76bb80'
  }
})
// export default axiosClientt;