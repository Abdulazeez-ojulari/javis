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

const Faq = mongoose.model("Faq", FaqSchema);

exports.Faq = Faq;
