const mongoose = require('mongoose');
// import { IFaq, IFaqDocument, IFaqModel } from "./interface/IFaq";

const FaqSchema = new mongoose.Schema({
    knowledgeBaseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'KnowledgeBase',
        minlength: 1,
    },
    question: {
        type: String,
        required: true,
        minlength: 1,
    },
    response: {
        type: String,
        required: false,
    },
    embeddings: {
        type: Object,
        // required: true,
    },
    id: {}
    
},  {timestamps: true});

FaqSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

// FaqSchema.statics.buildFaq = (args: IFaq) => {
//     return new Faq(args)
// }

FaqSchema.index(
    {
      "knowledgeBaseId": 1,
      "embeddings": 1
    }
)

const Faq = mongoose.model("Faq", FaqSchema);

Faq.syncIndexes();

exports.Faq = Faq;
