import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateQuestionDto {
    @IsString()
    @IsNotEmpty()
    title: string;
  
    //任意の値は@IsOptionalを付ける
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsBoolean()
    isPrivate: boolean;
  
  //   @IsArray()
  //   @IsOptional()
  //   likes?: Like[];
  //   @IsArray()
  //   @IsOptional()
    // books?: Book[];
  }