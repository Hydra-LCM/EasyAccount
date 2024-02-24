import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateTokenAndPersonalKey = async (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role
    };
    const salt = await bcrypt.genSalt(6);
    const secretKey = process.env.JWT_SECRET + salt;
    const token = jwt.sign(payload, secretKey, { expiresIn: process.env.TOKEN_LIFE });
    return {token: token, personalKey: salt};
};

export default generateTokenAndPersonalKey;