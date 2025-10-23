
declare namespace Express {
  export interface Request {
    /** injected by authMiddleware */
    user?: { id: string };
  }
}
