import { IsNumber } from "class-validator";

export class LinkBookQuestionDto {
    @IsNumber()
    bookId: number;
  }