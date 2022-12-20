import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  googleBooksId: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsArray()
  @IsOptional()
  authors?: string[];

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsString()
  @IsOptional()
  publishedDate?: string;

  @IsString()
  @IsOptional()
  pageCount?: string;

  @IsString()
  @IsOptional()
  imgLink?: string;

  @IsString()
  @IsOptional()
  previewLink?: string;
}
