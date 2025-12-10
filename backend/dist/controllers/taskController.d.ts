import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare const getTasks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTaskStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=taskController.d.ts.map