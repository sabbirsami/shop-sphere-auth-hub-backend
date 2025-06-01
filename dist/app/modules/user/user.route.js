"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validateRequest_1.validateRequest)(user_validation_1.UserValidation.createUserValidationSchema), user_controller_1.UserController.createUser);
router.post('/login', (0, validateRequest_1.validateRequest)(user_validation_1.UserValidation.loginUserValidationSchema), user_controller_1.UserController.loginUser);
router.post('/logout', user_controller_1.UserController.logoutUser);
router.post('/refresh-token', user_controller_1.UserController.refreshToken);
// Protected routes
router.get('/profile', (0, auth_1.default)('user', 'admin'), user_controller_1.UserController.getProfile);
router.get('/shop/:shopName', (0, auth_1.default)('user', 'admin'), user_controller_1.UserController.getShopData);
exports.UserRoute = router;
