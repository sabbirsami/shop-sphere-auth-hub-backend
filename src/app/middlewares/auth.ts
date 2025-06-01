import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../error/AppError';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import { catchAsync } from '../utils/catchAsync';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Check for token in Authorization header or Bearer format
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        `Invalid or expired token ${error}`
      );
    }

    const { role, userId } = decoded;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    }

    if (user?.isBlock) {
      throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked!');
    }

    // Check if JWT was issued before password change
    if (
      user.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        user.passwordChangedAt,
        decoded.iat!
      )
    ) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decoded as JwtPayload;
    next();
  });
};

export default auth;
