import jwt from "jsonwebtoken"
import bcrypt from "bcrypt" //https://www.npmjs.com/package/bcrypt

const jwtKey = process.env.JWT_SECRET!;
const jwtExpiry = "1h";

export const createJwtToken = (body: Object) => {
    return jwt.sign(
        { body },
        jwtKey,
        { expiresIn: jwtExpiry }
    );
}

export const verifyJwtToken = (token: string) => {
    return jwt.verify(token, jwtKey);
}

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

//Ref: https://github.com/auth0/node-jsonwebtoken/blob/master/README.md