//DTO (Data Transfer Object) : クライアントからサーバーに送られてくるデータオブジェクト
//class-validatorを使って、クライアントから送られてくるデータのバリデーションを行う

import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";



export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsOptional()
  // @MaxLength(50)
  // userName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}