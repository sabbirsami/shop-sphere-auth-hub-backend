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
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../config"));
const catchAsync_1 = require("../../utils/catchAsync");
const user_service_1 = require("./user.service");
const createUser = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.createUserIntoDB(req.body);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        success: true,
        message: 'User created successfully',
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        data: {
            _id: result._id,
            username: result.username,
            shops: result.shops.map((shop) => ({
                name: shop.name,
                displayName: shop.displayName,
            })),
        },
    });
}));
const loginUser = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserService.loginUser(req.body);
    const { refreshToken, accessToken, user } = result;
    // Set refresh token as httpOnly cookie with subdomain support
    res.cookie('refreshToken', refreshToken, {
        secure: config_1.default.NODE_ENV === 'production',
        httpOnly: true,
        domain: config_1.default.NODE_ENV === 'production' ? '.yourdomain.com' : '.localhost',
        sameSite: 'lax',
        maxAge: req.body.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000, // 7 days or 30 minutes
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'User logged in successfully',
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: {
            accessToken,
            user: {
                _id: user._id,
                username: user.username,
                shops: user.shops.map((shop) => ({
                    name: shop.name,
                    displayName: shop.displayName,
                })),
                role: user.role,
            },
        },
    });
}));
const logoutUser = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const result = yield user_service_1.UserService.logoutUser(refreshToken);
    res.clearCookie('refreshToken', {
        domain: config_1.default.NODE_ENV === 'production' ? '.yourdomain.com' : '.localhost',
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'User logged out successfully',
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
const refreshToken = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const result = yield user_service_1.UserService.refreshToken(refreshToken);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
const getProfile = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = req.user.userId;
    const result = yield user_service_1.UserService.getUserProfile(userId);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Profile retrieved successfully',
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
const getShopData = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { shopName } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = req.user.userId;
    const result = yield user_service_1.UserService.getShopData(userId, shopName);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Shop data retrieved successfully',
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
}));
exports.UserController = {
    createUser,
    loginUser,
    logoutUser,
    refreshToken,
    getProfile,
    getShopData,
};
