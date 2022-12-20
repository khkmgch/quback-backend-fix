import { HttpService } from "@nestjs/axios";
import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { catchError, firstValueFrom } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";
import { Book_WithRelation } from "types";
import { CreateBookDto } from "./dto/create-book.dto";
import { GoogleBooks } from "./interfaces/book.interface";


@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  //ユーザーの本棚にある本を全て取得する
  getBooks(userId: number): Promise<Book_WithRelation[]> {
    return this.prisma.book.findMany({
      where: {
        userId,
      },
      include: {
        links: true,
      },
      //新しい順に並べて返す
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //ログインしているユーザーの本棚から特定の本を１つ返す
  getBookById(userId: number, bookId: number): Promise<Book_WithRelation> {
    return this.prisma.book.findFirst({
      where: {
        userId,
        id: bookId,
      },
      include: {
        links: true,
      },
    });
  }
  //本をキーワード検索(google books api)
  async searchBooks(keyword: string): Promise<GoogleBooks> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<GoogleBooks>(
          `https://www.googleapis.com/books/v1/volumes?q=${keyword}`,
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }

  //本を本棚に新規追加
  async createBook(
    userId: number,
    dto: CreateBookDto,
  ): Promise<Book_WithRelation> {
    try {
      //googleBooksId, userIdでMy本棚から本を探し、本が存在する場合は新規追加をしない。
      const found = await this.findByGoogleBooksId(dto.googleBooksId, userId);
      if (found) {
        return null;
      }
      const book = await this.prisma.book.create({
        data: {
          userId,
          ...dto,
        },
        include: {
          links: true,
        },
      });
      return book;
    } catch (err) {
      throw err;
    }
  }
  //My本棚からgoogleBooksIdで本を探すメソッド
  async findByGoogleBooksId(
    googleBooksId: string,
    userId: number,
  ): Promise<Book_WithRelation> {
    return this.prisma.book.findFirst({
      where: {
        googleBooksId,
        userId,
      },
      include: {
        links: true,
      },
    });
  }

  //本を本棚から削除する
  async deleteBook(userId: number, bookId: number): Promise<void> {
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });
    if (!book || book.userId !== userId) {
      throw new ForbiddenException('No permission to delete');
    }
    await this.prisma.book.delete({
      where: {
        id: bookId,
      },
    });
  }
}

