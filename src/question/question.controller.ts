import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Question_WithRelation } from 'types';
import { CreateQuestionDto } from './dto/create-question.dto';
import { LinkBookQuestionDto } from './dto/linkBook_question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Msg } from './interfaces/question.interface';
import { QuestionService } from './question.service';

@UseGuards(AuthGuard('jwt'))
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  //ログインしているユーザーのクエスチョンを全て取得
  @Get('all/profile')
  getLoginQuestions(@Req() req: Request): Promise<Question_WithRelation[]> {
    return this.questionService.getQuestions(req.user.id);
  }

  //ユーザーのクエスチョンを全て取得
  @Get('all/profile/:id')
  getQuestionsByUserId(
    @Req() req: Request,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<Question_WithRelation[]> {
    return this.questionService.getQuestions(userId);
  }

  //ユーザーのタイムラインに表示するクエスチョンを全て取得
  @Get('all/timeline')
  getTimelineQuestions(@Req() req: Request): Promise<Question_WithRelation[]> {
    return this.questionService.getTimelineQuestions(req.user.id);
  }

  @Get('all/allusers')
  getAllQuestions(): Promise<Question_WithRelation[]> {
    return this.questionService.getAllQuestions();
  }

  //ログインしているユーザーの特定のクエスチョンを１つ取得
  // :idでパスを変数化して@Paramで読み取る
  // ParseIntPipeでInt型に変換してquestionIdに格納する
  @Get(':id')
  getQuestionById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) questionId: number,
  ): Promise<Question_WithRelation> {
    return this.questionService.getQuestionById(req.user.id, questionId);
  }
  //クエスチョンを新規作成
  @Post()
  createQuestion(
    @Req() req: Request,
    @Body() dto: CreateQuestionDto,
  ): Promise<Question_WithRelation> {
    return this.questionService.createQuestion(req.user.id, dto);
  }
  //クエスチョンを更新
  @Patch(':id')
  updateQuestionById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) questionId: number,
    @Body() dto: UpdateQuestionDto,
  ): Promise<Question_WithRelation> {
    return this.questionService.updateQuestionById(
      req.user.id,
      questionId,
      dto,
    );
  }
  // 特定のQuestionにいいねを押す
  @Patch(':id/like')
  likeQuestionById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) questionId: number,
  ): Promise<Msg> {
    return this.questionService.likeQuestionById(req.user.id, questionId);
  }

  // 特定のQuestionに本を紐づけする
  @Patch(':id/link')
  linkBook_QuestionById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) questionId: number,
    @Body() dto: LinkBookQuestionDto,
  ): Promise<Msg> {
    console.log(typeof dto.bookId);
    return this.questionService.linkBook_QuestionById(
      req.user.id,
      questionId,
      dto,
    );
  }

  // 特定のQuestionと本の紐づけを解除する
  @Patch(':id/unlink')
  unLinkBook_QuestionById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) questionId: number,
    @Body() dto: LinkBookQuestionDto,
  ): Promise<Msg> {
    return this.questionService.unLinkBook_QuestionById(
      req.user.id,
      questionId,
      dto,
    );
  }

  //クエスチョンを削除する
  //削除に成功した場合のステータスをNO_CONTENTに設定
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteQuestionById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) questionId: number,
  ): Promise<void> {
    return this.questionService.deleteQuestion(req.user.id, questionId);
  }
}
