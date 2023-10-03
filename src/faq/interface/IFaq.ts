import { Document, Model } from "mongoose"

export interface IFaq {
    knowledgeBaseId: string;
    question: string,
    response: string,
}

export interface IFaqDocument extends IFaq, Document {}

export interface IFaqModel extends Model<IFaqDocument> {
    buildFaq(args: IFaq) : IFaqDocument;
}