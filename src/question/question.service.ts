import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Question_WithRelation } from 'types';
import { CreateQuestionDto } from './dto/create-question.dto';
import { LinkBookQuestionDto } from './dto/linkBook_question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Msg } from './interfaces/question.interface';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  //ログインしているユーザーのクエスチョンを全て取得する
  async getQuestions(userId: number): Promise<Question_WithRelation[]> {
    return await this.prisma.question.findMany({
      where: {
        userId,
      },
      include: {
        likes: true,
        books: true,
      },
      //新しい順に並べて返す
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  //ログインしているユーザーのタイムラインに表示するクエスチョンを全て取得
  async getTimelineQuestions(userId: number): Promise<Question_WithRelation[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          questions: true,
          likeQuestions: true,
          books: true,
          followedBy: true,
          following: true,
        },
      });
      //userのQuestionを全て取得する
      const userQuestions = await this.prisma.question.findMany({
        where: {
          userId,
        },
        include: {
          likes: true,
          books: true,
        },
        //新しい順に並べて返す
        orderBy: {
          createdAt: 'desc',
        },
      });
      // 自分がフォローしている友達のQuestionを全て取得する
      // 非同期処理のuserを使っているため、Promise.allを用意して待っておく。
      const friendQuestions = await Promise.all(
        user.following.map((follow) => {
          return this.prisma.question.findMany({
            where: {
              userId: follow.followingId,
            },
            include: {
              likes: true,
              books: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
        }),
      );
      console.log('friendQuestions: ', friendQuestions);
      //friendQuestions(friendのQuestionオブジェクト{}の配列[{}, {}, {}]の配列)
      //[ [{}, {}, {}], [{}, {}, {}] ]
      //スプレッド構文で全ての要素を展開してconcatする
      return userQuestions.concat(...friendQuestions);
    } catch (err) {
      throw err;
    }
  }

  //全てのQuestionを配列で返す
  async getAllQuestions(): Promise<Question_WithRelation[]> {
    return await this.prisma.question.findMany({
      where: {
        isPrivate: false,
      },
      include: {
        likes: true,
        books: true,
      },
      //新しい順に並べて返す
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //ログインしているユーザーの特定のクエスチョンを１つ返す
  getQuestionById(
    userId: number,
    questionId: number,
  ): Promise<Question_WithRelation> {
    return this.prisma.question.findFirst({
      where: {
        userId,
        id: questionId,
      },
      include: {
        likes: true,
        books: true,
      },
    });
  }

  //クエスチョンを新規作成
  async createQuestion(
    userId: number,
    dto: CreateQuestionDto,
  ): Promise<Question_WithRelation> {
    const question = await this.prisma.question.create({
      data: {
        userId,
        ...dto,
      },
      include: {
        likes: true,
        books: true,
      },
    });
    return question;
  }

  //クエスチョンを更新する
  async updateQuestionById(
    userId: number,
    questionId: number,
    dto: UpdateQuestionDto,
  ): Promise<Question_WithRelation> {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });
    if (!question || question.userId !== userId) {
      throw new ForbiddenException('No permission to update');
    }
    return this.prisma.question.update({
      where: {
        id: questionId,
      },
      include: {
        likes: true,
        books: true,
      },
      data: {
        ...dto,
      },
    });
  }

  //クエスチョンにいいねを押す
  async likeQuestionById(userId: number, questionId: number): Promise<Msg> {
    try {
      const question = await this.prisma.question.findUnique({
        where: {
          id: questionId,
        },
        include: {
          likes: true,
          books: true,
        },
      });
      //既にいいねしているかどうかで、いいねを押すかいいねを外すかを判断する
      let isLiked = false;
      for (let i = 0; i < question.likes.length; i++) {
        if (question.likes[i].userId === userId) isLiked = true;
      }
      if (!isLiked) {
        //Like(relation)を作成
        await this.prisma.like.create({
          data: {
            userId: userId,
            questionId: questionId,
          },
        });
        return {
          message: 'いいねを押しました',
        };
      } else
        await this.prisma.like.delete({
          where: {
            userId_questionId: {
              userId: userId,
              questionId: questionId,
            },
          },
        });
      return {
        message: 'いいねを外しました',
      };
    } catch (err) {
      throw err;
    }
  }

  //特定のQuestionと本を紐づけする
  async linkBook_QuestionById(
    userId: number,
    questionId: number,
    dto: LinkBookQuestionDto,
  ): Promise<Msg> {
    try {
      const question = await this.prisma.question.findFirst({
        where: {
          userId,
          id: questionId,
        },
        include: {
          likes: true,
          books: true,
        },
      });
      const book = await this.prisma.book.findFirst({
        where: {
          userId,
          id: dto.bookId,
        },
      });
      if (question && book) {
        let isLinked = false;
        for (let i = 0; i < question.books.length; i++) {
          if (question.books[i].bookId === book.id) {
            isLinked = true;
            break;
          }
        }
        //紐づけされていなければLinkを作成する
        if (!isLinked) {
          await this.prisma.link.create({
            data: {
              questionId,
              bookId: book.id,
            },
          });
          return {
            message: '紐づけに成功しました',
          };
        } else {
          return {
            message: 'すでに紐づけされています',
          };
        }
      }

      return { message: 'QuesionまたはBookが見つかりません' };
    } catch (err) {
      throw err;
    }
  }
  // 特定のQuestionと本の紐づけを解除する
  async unLinkBook_QuestionById(
    userId: number,
    questionId: number,
    dto: LinkBookQuestionDto,
  ): Promise<Msg> {
    try {
      const question = await this.prisma.question.findFirst({
        where: {
          userId,
          id: questionId,
        },
        include: {
          likes: true,
          books: true,
        },
      });
      const book = await this.prisma.book.findFirst({
        where: {
          userId,
          id: dto.bookId,
        },
      });
      if (question && book) {
        console.log(book.id);
        let isLinked = false;
        for (let i = 0; i < question.books.length; i++) {
          if (question.books[i].bookId === book.id) {
            isLinked = true;
            break;
          }
        }
        //紐づけされていればLinkを削除する
        if (isLinked) {
          //Linkを削除する
          await this.prisma.link.delete({
            where: {
              questionId_bookId: {
                questionId,
                bookId: book.id,
              },
            },
          });
          return { message: '紐づけを解除しました' };
        } else {
          return {
            message: '紐づけされていないので解除できません',
          };
        }
      }
    } catch (err) {
      throw err;
    }
  }

  //クエスチョンを削除する
  async deleteQuestion(userId: number, questionId: number): Promise<void> {
    try {
      const question = await this.prisma.question.findUnique({
        where: {
          id: questionId,
        },
      });
      if (!question || question.userId !== userId) {
        throw new ForbiddenException('No permission to delete');
      } else
        await this.prisma.question.delete({
          where: {
            id: questionId,
          },
        });
    } catch (err) {
      throw err;
    }
  }
}
