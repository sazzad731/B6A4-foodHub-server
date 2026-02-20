import { JwtPayload } from "jsonwebtoken";

export type TUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  iat: number;
  exp: number;
} & JwtPayload;

declare global {
  namespace Express {
    interface Request {
      user?: TUser;
    }
  }
}
