import mongoose from 'mongoose';

const ConfirmationAttemptSchema = new mongoose.Schema({
    username: String,
    action: String,
    timestamp: { type: Date, default: Date.now }
});

const ConfirmationAttempt = mongoose.model('ConfirmationAttempt', ConfirmationAttemptSchema);

export default ConfirmationAttempt;
