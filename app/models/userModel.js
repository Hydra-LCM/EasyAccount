import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

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

const userSchema = new Schema({
    username: { //email
        type: String,
        unique: true,
        required: true
    },
    secondaryEmail: {
        type: String,
        unique: true,
    },
    isSecondaryEmailConfirmed: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'mod', 'client'],
        default: 'client'
    },
    personalKey: {
        type: String,
        required: true,
        default: '-',
    },
    isActive: {
        type: Boolean,
        default: false
    },
    confirmationCode: {
        type: String,
    },
    confirmationCodeTimestamp: {
        type: Date,
    },
    recoveryCode: {
        type: String,
    },
    recoveryCodeTimestamp: {
        type: Date,
    },
    isPassChangeAllowed: {
        type: Boolean,
        default: false
    },
    isEmailChangeAllowed: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        enum: ['pt', 'en', 'es'],
        default: 'pt'
    },
    securityQuestions: [securityQuestionSchema],
});

userSchema.pre('save', function (next) {
    if (this.isModified('confirmationCode')) {
        this.confirmationCodeTimestamp = new Date();
    }
    next();
});

userSchema.pre('save', function (next) {
    if (this.isModified('recoveryCode')) {
        this.recoveryCodeTimestamp = new Date();
    }
    next();
});

userSchema.methods.isConfirmationCodeRecent = function () {
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime.getTime() - (5 * 60000)); // 5 minutes ago
    return this.confirmationCodeTimestamp && this.confirmationCodeTimestamp > fiveMinutesAgo;
};

userSchema.methods.isRecoveryCodeRecent = function () {
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime.getTime() - (5 * 60000)); // 5 minutes ago
    return this.recoveryCodeTimestamp && this.recoveryCodeTimestamp > fiveMinutesAgo;
};

userSchema.methods.addSecurityQuestion = function(questionId, answer) {
    const answerHash = bcrypt.hashSync(answer, 12);
    const existingQuestion = this.securityQuestions.find(question => question.questionId === questionId);

    if (existingQuestion) {
        existingQuestion.answerHash = answerHash;
    } else {
        this.securityQuestions.push({ questionId, answerHash });
    }

    return true;
};

userSchema.methods.checkSecurityAnswer = function(questionId, answer) {
    const questionObj = this.securityQuestions.find(q => q.questionId == questionId);
    if (!questionObj) return false;
    return bcrypt.compareSync(answer, questionObj.answerHash);
};

const User = model('user', userSchema);

export default User;