import { Schema } from 'mongoose';

const securityQuestionSchema = new Schema({
    questionId: {
        type: Number,
        required: true,
    },
    answerHash: {
        type: String,
        required: true,
    }
});

export default securityQuestionSchema;