"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.createToken = void 0;
// user.utils.ts - Alternative approach
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (jwtPayload, secret, expiresIn) => {
    // Convert common time strings to seconds if needed
    let expiry = expiresIn;
    if (typeof expiresIn === 'string') {
        // Ensure the string format is valid for JWT
        const validFormats = ['15m', '30m', '1h', '7d', '24h'];
        if (!validFormats.some((format) => expiresIn.includes(format.slice(-1)))) {
            throw new Error(`Invalid expiresIn format: ${expiresIn}`);
        }
        expiry = expiresIn;
    }
    return jsonwebtoken_1.default.sign(jwtPayload, secret, {
        expiresIn: expiry,
    });
};
exports.createToken = createToken;
const validatePassword = (password) => {
    // At least 8 characters, one number, one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
