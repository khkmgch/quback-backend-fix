import { User_WithRelation } from 'types';

declare module 'express-serve-static-core' {
  //標準のExpressのRequest型に対して、userというフィールドを追加。
  //User_WithRelationからhashedPasswordを除いた型を指定
  interface Request {
    user?: Omit<User_WithRelation, 'hashedPassword'>;
  }
}
