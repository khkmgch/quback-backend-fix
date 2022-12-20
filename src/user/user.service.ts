import { ForbiddenException, Injectable } from "@nestjs/common";
import { Msg } from "src/auth/interfaces/auth.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { User_WithRelation } from "types";
import { UpdateUserDto } from "./dto/update-user.dto";


@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //ユーザーをuserIdで取得
  async getUserById(
    userId: number,
  ): Promise<Omit<User_WithRelation, 'hashedPassword'>> {
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
      return user;
    } catch (err) {
      throw err;
    }
  }

  //ユーザ情報を更新
  async updateUser(
    userId: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User_WithRelation, 'hashedPassword'>> {
    const user = await this.prisma.user.update({
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
      data: {
        ...dto,
      },
    });
    //updateメソッドは変更後のuserオブジェクトを返す。
    //ハッシュ化されたパスワードも返してしまうため、delete user.hashedPasswordで除いてから返す。
    delete user.hashedPassword;
    return user;
  }

  //ユーザー削除
  async deleteUser(userId: number, targetId: number): Promise<Msg> {
    if (userId === targetId) {
      try {
        const user = await this.prisma.user.delete({
          where: {
            id: targetId,
          },
        });
        return {
          message: 'アカウントが削除されました',
        };
      } catch (err) {
        throw err;
      }
    } else {
      throw new ForbiddenException('No permission to delete');
    }
  }

  //ユーザーをフォロー
  async followUser(userId: number, targetUserId: number): Promise<Msg> {
    //フォロー対象が自分自身でない場合、フォローできる
    if (userId !== targetUserId) {
      try {
        //フォロー対象のユーザー
        const targetUser = await this.prisma.user.findFirst({
          where: {
            id: targetUserId,
          },
          include: {
            followedBy: true,
            following: true,
          },
        });
        //既にフォローしているかどうか
        let isFollowed = false;
        for (let i = 0; i < targetUser.followedBy.length; i++) {
          if (targetUser.followedBy[i].followerId === userId) {
            isFollowed = true;
            break;
          }
        }
        //フォローしていなげればフォローできる
        if (!isFollowed) {
          //Follow(relation)を作成
          await this.prisma.follow.create({
            data: {
              followerId: userId,
              followingId: targetUserId,
            },
          });
          return {
            message: 'フォローに成功しました',
          };
        } else {
          return {
            message: '既にフォローしています',
          };
        }
      } catch (err) {
        throw err;
      }
    } else
      return {
        message: '自分自身をフォローできません',
      };
  }

  //フォロー解除
  async unfollowUser(userId: number, targetUserId: number): Promise<Msg> {
    //フォローを外す対象が自分自身でない場合、フォローを外すことができる
    if (userId !== targetUserId) {
      try {
        //フォローを外す対象のユーザー
        const targetUser = await this.prisma.user.findFirst({
          where: {
            id: targetUserId,
          },
          include: {
            followedBy: true,
            following: true,
          },
        });
        //フォローをはずず対象のユーザーのfollowedByの中に自分がいた場合、フォローを外せる
        //既にフォローしているかどうか
        let isFollowed = false;
        for (let i = 0; i < targetUser.followedBy.length; i++) {
          if (targetUser.followedBy[i].followerId === userId) {
            isFollowed = true;
            break;
          }
        }
        //フォローしていれば外すことができる
        if (isFollowed) {
          //Follow(relation)を削除
          await this.prisma.follow.delete({
            where: {
              followerId_followingId: {
                followerId: userId,
                followingId: targetUserId,
              },
            },
          });
          return {
            message: 'フォロー解除に成功しました',
          };
        } else {
          return {
            message: 'フォローしていないのでフォロー解除できません',
          };
        }
      } catch (err) {
        throw err;
      }
    } else
      return {
        message: '自分自身をフォロー解除できません',
      };
  }
}

