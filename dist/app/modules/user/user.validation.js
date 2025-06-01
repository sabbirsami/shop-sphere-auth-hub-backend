"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z
            .string({
            required_error: 'Username is required',
        })
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username cannot exceed 30 characters'),
        password: zod_1.z
            .string({
            required_error: 'Password is required',
        })
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/, 'Password must contain at least one number and one special character'),
        shops: zod_1.z
            .array(zod_1.z.string().min(1, 'Shop name cannot be empty'))
            .min(3, 'You must provide at least 3 shop names')
            .max(4, 'You cannot provide more than 4 shop names')
            .refine((shops) => {
            const uniqueShops = new Set(shops.map((shop) => shop.toLowerCase().trim()));
            return uniqueShops.size === shops.length;
        }, 'Shop names must be unique'),
    }),
});
const loginUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string({
            required_error: 'Username is required',
        }),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
        rememberMe: zod_1.z.boolean().optional(),
    }),
});
exports.UserValidation = {
    createUserValidationSchema,
    loginUserValidationSchema,
};
