const express = require("express");
require("dotenv").config();
const app = express();
require("./src/db/connection")();
const path = require("node:path");

const cors = require("cors");

// const response = await openai.listEngines();gpt-3.5-turbo-16k
// const response = await openai.createFile(
//     fs.createReadStream("mydata.jsonl"),
//     "fine-tune"
// );

var business = require("./src/business/businessRoute");
var chat = require("./src/chat/chatRoute");
var knowledgeBase = require("./src/knowledgeBase/knowledgeBaseRoute");
var user = require("./src/user/userRoute");
var order = require("./src/order/orderRoute");

let data = [
  {
    name: "Xiaomi Redmi Note 12",
    display: '6.67" FHD+ AMOLED display',
    ram: "4GB",
    rom: "128GB",
    processor: "Qualcomm Snapdragon 695",
    camera: "50MP quad-camera system",
    battery: "5000mAh battery with 67W fast charging",
    price: "₦119,500",
    availability: "Available",
    category: "Phones",
    attributes: ["4G", "5G", "NFC", "Fast charging"],
    color: "Onyx Gray",
    size: "6.67 inches",
    brand: "Xiaomi",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/50/0158722/1.jpg?7371",
  },
  {
    name: "Samsung Galaxy A14",
    display: '6.6" FHD+ TFT display',
    ram: "4GB",
    rom: "128GB",
    processor: "MediaTek Helio G80",
    camera: "50MP triple-camera system",
    battery: "5000mAh battery with 15W fast charging",
    price: "₦120,000",
    availability: "Available",
    category: "Phones",
    attributes: ["4G", "NFC"],
    color: "Black",
    size: "6.6 inches",
    brand: "Samsung",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/82/8440622/1.jpg?2300",
  },
  {
    name: "Tecno Spark 10c",
    display: '6.6" HD+ IPS display',
    ram: "4GB",
    rom: "128GB",
    processor: "MediaTek Helio G35",
    camera: "13MP triple-camera system",
    battery: "5000mAh battery with 10W fast charging",
    price: "₦82,500",
    availability: "Available",
    category: "Phones",
    attributes: ["4G"],
    color: "Blue",
    size: "6.6 inches",
    brand: "Tecno",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/43/6203722/1.jpg?3605",
  },
  {
    name: "Infinix Hot 12",
    display: '6.82" FHD+ IPS display',
    ram: "4GB",
    rom: "128GB",
    processor: "MediaTek Helio G85",
    camera: "50MP triple-camera system",
    battery: "5000mAh battery with 18W fast charging",
    price: "₦108,900",
    availability: "Available",
    category: "Phones",
    attributes: ["4G", "NFC"],
    color: "Black",
    size: "6.82 inches",
    brand: "Infinix",
    image: "https://ng.jumia.is/unsafe/fit-in/500x500/product/58/9353532/1.jpg",
  },
  {
    name: "Samsung Galaxy A04s",
    display: '6.5" HD+ TFT display',
    ram: "4GB",
    rom: "128GB",
    processor: "MediaTek Helio G35",
    camera: "50MP triple-camera system",
    battery: "5000mAh battery with 15W fast charging",
    price: "₦101,900",
    availability: "Available",
    category: "Phones",
    attributes: ["4G"],
    color: "Copper",
    size: "6.5 inches",
    brand: "Samsung",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/14/4289691/1.jpg?1002",
  },
  {
    name: "Tecno Pop 5",
    display: '6.5" HD+ IPS display',
    ram: "2GB",
    rom: "32GB",
    processor: "Spreadtrum SC9863A",
    camera: "8MP dual-camera system",
    battery: "5000mAh battery with 10W fast charging",
    price: "₦63,990",
    availability: "Available",
    category: "Phones",
    attributes: ["4G"],
    color: "Blue",
    size: "6.5 inches",
    brand: "Tecno",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/89/1051931/1.jpg?4930",
  },
  {
    name: "Infinix Hot 12 Play",
    display: '6.82" HD+ IPS display',
    ram: "4GB",
    rom: "64GB",
    processor: "MediaTek Helio G85",
    camera: "13MP triple-camera system",
    battery: "5000mAh battery with 18W fast charging",
    price: "₦92,900",
    availability: "Available",
    category: "Phones",
    attributes: ["4G"],
    color: "Green",
    size: "6.82 inches",
    brand: "Infinix",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/19/0631702/1.jpg?7078",
  },
  {
    name: "Nokia G11 Plus",
    display: '6.5" HD+ IPS display',
    ram: "4GB",
    rom: "64GB",
    processor: "Unisoc T606",
    camera: "50MP triple-camera system",
    battery: "5000mAh battery with 10W fast charging",
    price: "₦75,990",
    availability: "Available",
    category: "Phones",
    attributes: ["4G"],
    color: "Glacier",
    size: "6.5 inches",
    brand: "Nokia",
    image:
      "https://gadgetstripe.com/wp-content/uploads/2022/02/nokia-g11-gadgetstripe-696x415.jpg",
  },
  {
    name: "Tecno Camon 19",
    display: '6.8" FHD+ IPS display',
    ram: "4GB",
    rom: "128GB",
    processor: "MediaTek Helio G88",
    camera: "64MP quad-camera system",
    battery: "5000mAh battery with 18W fast charging",
    price: "₦109,900",
    availability: "Available",
    category: "Phones",
    attributes: ["4G"],
    color: "Meteorite Gray",
    size: "6.8 inches",
    brand: "Tecno",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/43/2638171/1.jpg?2801",
  },
  {
    name: "Infinix Note 12 VIP",
    display: '6.7" AMOLED display',
    ram: "8GB",
    rom: "128GB",
    processor: "MediaTek Dimensity 1200",
    camera: "108MP triple-camera system",
    battery: "5000mAh battery with 120W fast charging",
    price: "₦219,900",
    availability: "Available",
    category: "Phones",
    attributes: ["4G", "NFC"],
    color: "Cayenne",
    size: "6.7 inches",
    brand: "Infinix",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/00/3771631/1.jpg?6191",
  },
  {
    name: "POCO M4 Pro 5G",
    display: '6.6" FHD+ IPS display',
    ram: "6GB",
    rom: "128GB",
    processor: "MediaTek Dimensity 810",
    camera: "50MP dual-camera system",
    battery: "5000mAh battery with 33W fast charging",
    price: "₦109,900",
    availability: "Available",
    category: "Phones",
    attributes: ["4G", "5G"],
    color: "Cool Blue",
    size: "6.6 inches",
    brand: "POCO",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/29/9680261/1.jpg?6511",
  },
  {
    name: "Samsung Galaxy A53 5G",
    display: '6.5" FHD+ Super AMOLED display',
    ram: "6GB",
    rom: "128GB",
    processor: "Snapdragon 778G",
    camera: "64MP quad-camera system",
    battery: "5000mAh battery with 25W fast charging",
    price: "₦149,900",
    availability: "Available",
    category: "Phones",
    attributes: ["4G", "5G"],
    color: "Peach",
    size: "6.5 inches",
    brand: "Samsung",
    image:
      "https://ng.jumia.is/unsafe/fit-in/500x500/product/86/8956901/1.jpg?3913",
  },
];

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/ai/business", business);
app.use("/ai/chat", chat);
app.use("/ai/knowledge-base", knowledgeBase);
app.use("/ai/user", user);
app.use("/ai/order", order);
require("./src/admin/admin.routes")(app);
require("./src/payment/payment.routes")(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
