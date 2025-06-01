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
exports.User = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../config"));
const shopSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: 0,
    },
    shops: {
        type: [shopSchema],
        required: true,
        validate: {
            validator: function (shops) {
                return shops.length >= 3 && shops.length <= 4;
            },
            message: 'You must provide 3-4 shop names',
        },
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isBlock: {
        type: Boolean,
        default: false,
    },
    refreshTokens: {
        type: [String],
        default: [],
    },
    lastLogin: Date,
    passwordChangedAt: Date,
}, {
    timestamps: true,
});
userSchema.index({ 'shops.name': 1 }, { unique: true });
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified('password')) {
            this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
            if (!this.isNew) {
                this.passwordChangedAt = new Date();
            }
        }
        next();
    });
});
userSchema.post('save', function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        doc.password = '';
        next();
    });
});
userSchema.statics.isUserExistsByUsername = function (username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findOne({ username }).select('+password');
    });
};
userSchema.statics.isUserExistsById = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findOne({ _id: id }).select('+password');
    });
};
userSchema.statics.isPasswordMatched = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
    });
};
userSchema.statics.isShopNameUnique = function (shopName) {
    return __awaiter(this, void 0, void 0, function* () {
        const normalizedShopName = shopName.toLowerCase().trim();
        const existingShop = yield exports.User.findOne({ 'shops.name': normalizedShopName });
        return !existingShop;
    });
};
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (passwordChangedTimestamp, jwtIssuedTimestamp) {
    const passwordChangedTime = parseInt((passwordChangedTimestamp.getTime() / 1000).toString(), 10);
    return passwordChangedTime > jwtIssuedTimestamp;
};
exports.User = (0, mongoose_1.model)('User', userSchema);
