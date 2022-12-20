import { Prisma } from '@prisma/client';

const userWithRelation = Prisma.validator<Prisma.UserArgs>()({
  include: {
    questions: true,
    books: true,
    likeQuestions: true,
    followedBy: true,
    following: true,
  },
});
export type User_WithRelation = Prisma.UserGetPayload<typeof userWithRelation>;

const questionWithRelation = Prisma.validator<Prisma.QuestionArgs>()({
  include: { likes: true, books: true },
});
export type Question_WithRelation = Prisma.QuestionGetPayload<
  typeof questionWithRelation
>;

const bookWithRelation = Prisma.validator<Prisma.BookArgs>()({
  include: { links: true },
});
export type Book_WithRelation = Prisma.BookGetPayload<typeof bookWithRelation>;
