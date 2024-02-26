import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    username: { //email
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        required: true
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
    }
});


const User = model('user', userSchema);

export default User;