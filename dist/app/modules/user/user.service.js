"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_constant_1 = require("./user.constant");
const user_model_1 = require("./user.model");
const user_utils_1 = require("./user.utils");
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, shops } = payload;
    // Validate password strength
    if (!(0, user_utils_1.validatePassword)(password)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password must be at least 8 characters long and contain at least one number and one special character');
    }
    // Check if username already exists
    const existingUser = yield user_model_1.User.findOne({ username });
    if (existingUser) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Username already exists');
    }
    // Validate shop names uniqueness
    for (const shopName of shops) {
        const isUnique = yield user_model_1.User.isShopNameUnique(shopName);
        if (!isUnique) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.CONFLICT, `Shop name "${shopName}" is already taken`);
        }
    }
    // Create shop objects
    const shopObjects = shops.map((shopName) => ({
        name: shopName.toLowerCase().trim(),
        displayName: shopName.trim(),
    }));
    const userData = {
        username,
        password,
        shops: shopObjects,
        role: 'user',
        isBlock: false,
    };
    const result = yield user_model_1.User.create(userData);
    return result;
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.isUserExistsByUsername(payload === null || payload === void 0 ? void 0 : payload.username);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found!');
    }
    if (user === null || user === void 0 ? void 0 : user.isBlock) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'This user is blocked!');
    }
    if (!(yield user_model_1.User.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.password, user === null || user === void 0 ? void 0 : user.password))) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Incorrect password');
    }
    const jwtPayload = {
        userId: user._id,
        username: user.username,
        role: user.role,
    };
    // Determine token expiry based on rememberMe
    const accessTokenExpiry = payload.rememberMe ? '1h' : '15m';
    const refreshTokenExpiry = payload.rememberMe
        ? user_constant_1.SESSION_DURATION.REMEMBER_ME
        : user_constant_1.SESSION_DURATION.DEFAULT;
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, accessTokenExpiry);
    const refreshToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, refreshTokenExpiry);
    // Store refresh token in user document
    yield user_model_1.User.findByIdAndUpdate(user._id, {
        $push: { refreshTokens: refreshToken },
        lastLogin: new Date(),
    });
    return {
        accessToken,
        refreshToken,
        user,
    };
});
const logoutUser = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Refresh token is required');
    }
    // Remove refresh token from user document
    yield user_model_1.User.updateOne({ refreshTokens: refreshToken }, { $pull: { refreshTokens: refreshToken } });
    return { message: 'Logged out successfully' };
});
const refreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Refresh token is required');
    }
    const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwt_refresh_secret);
    const user = yield user_model_1.User.findById(decoded.userId);
    if (!user || !((_a = user.refreshTokens) === null || _a === void 0 ? void 0 : _a.includes(refreshToken))) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
    }
    const jwtPayload = {
        userId: user._id,
        username: user.username,
        role: user.role,
    };
    const newAccessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, '15m');
    return { accessToken: newAccessToken };
});
const getUserProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('-password -refreshTokens');
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
});
const getShopData = (userId, shopName) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('shops');
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    const shop = user.shops.find((s) => s.name === shopName.toLowerCase());
    if (!shop) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Shop not found');
    }
    return {
        shopName: shop.name,
        displayName: shop.displayName,
        message: `This is ${shop.displayName} shop`,
    };
});
exports.UserService = {
    createUserIntoDB,
    loginUser,
    logoutUser,
    refreshToken,
    getUserProfile,
    getShopData,
};
