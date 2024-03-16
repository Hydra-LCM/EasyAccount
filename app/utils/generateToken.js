import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateTokenAndPersonalKey = async (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
    };
    const salt = await bcrypt.genSalt(6);
    const secretKey = process.env.JWT_SECRET + salt;
    const token = jwt.sign(payload, secretKey, { expiresIn: process.env.TOKEN_LIFE });
    const tokenBearer = 'Bearer ' + token;
    return {token: tokenBearer, personalKey: salt};
};

export default generateTokenAndPersonalKey;