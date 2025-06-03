"use strict";
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
//parsers
app.use(express_1.default.json());
const corsConfig = {
    origin: ['http://localhost:5173/', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use((0, cors_1.default)(corsConfig));
app.use((0, cookie_parser_1.default)());
// application routes
app.use('/api/', routes_1.default);
app.get('/', (req, res) => {
    res.send('Working');
});
app.use(globalErrorHandler_1.default);
// Not Found
app.all('*', (req, res, next) => {
    const error = new Error(`Can't find ${req.originalUrl} route on the server`);
    error.status = 404;
    next(error);
});
exports.default = app;
