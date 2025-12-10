import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare const createSession: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSessions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=sessionController.d.ts.map