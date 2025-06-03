"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Parsers
app.use(express_1.default.json());
// Enhanced CORS configuration for subdomains
const corsConfig = {
    origin: [
        // Development URLs
        'http://localhost:5173',
        'http://*.localhost:5173',
        'https://localhost:5173',
        'https://*.localhost:5173',
        'http://localhost:3000',
        // Production URLs
        'https://shop-sphere-auth-hub.vercel.app',
        'http://shop-sphere-auth-hub.vercel.app',
        'http://shop-sphere-auth-hub.vercel.app/',
        'https://shop-sphere-auth-hub.vercel.app/',
        'https://*.shop-sphere-auth-hub.vercel.app',
        'http://*.shop-sphere-auth-hub.vercel.app',
        'https://*.shop-sphere-auth-hub.vercel.app/',
        'http://*.shop-sphere-auth-hub.vercel.app/',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours in seconds
};
app.use((0, cors_1.default)(corsConfig));
app.use((0, cookie_parser_1.default)());
// In your Express app configuration
app.use((req, res, next) => {
    const originalCookie = res.cookie.bind(res);
    res.cookie = function (name, val, options = {}) {
        const defaultOptions = {
            domain: process.env.NODE_ENV === 'production'
                ? 'shop-sphere-auth-hub.vercel.app'
                : 'localhost',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        };
        return originalCookie(name, val, Object.assign(Object.assign({}, defaultOptions), options));
    };
    next();
});
// Application routes
app.use('/api', routes_1.default);
// Health check
app.get('/', (req, res) => {
    res.send('Working');
});
// Error handling
app.use(globalErrorHandler_1.default);
// Not Found
app.all('*', (req, res, next) => {
    const error = new Error(`Can't find ${req.originalUrl} route on the server`);
    error.status = 404;
    next(error);
});
exports.default = app;
