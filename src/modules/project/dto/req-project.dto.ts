import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ParamsDto } from 'src/common/dto/params.dto';
import { Project } from '../entities/project.entity';

/* 新增项目 */
export class ReqAddProjectDto extends OmitType(Project, [
  'projectId',
] as const) {
  /* 菜单id数组 */
  // @IsArray()
  // menuIds: number[]

  /* 部门Id */
  @IsOptional()
  @Type()
  @IsNumber()
  deptId?: number;
}

/* 编辑角色 */
export class ReqUpdateProjectDto extends ReqAddProjectDto {
  @Type()
  @IsNumber()
  projectId: number;
}

// /* 分配数据权限 */
// export class ReqDataScopeDto extends Role {
//   /* 部门id数组 */
//   @IsArray()
//   deptIds: number[];
// }

/* 分页查询 */
export class ReqProjectListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type()
  @IsNumber()
  deptId?: number;

  @IsOptional()
  @IsObject()
  params: ParamsDto;
}

// /* 改变角色状态 */
// export class ReqChangeStatusDto {
//   /* 角色id */
//   @Type()
//   @IsNumber()
//   roleId: number;

//   /* 状态值 */
//   @Type()
//   @IsString()
//   status: string;
// }

export class ReqAllocatedListDto extends PaginationDto {
  /* 项目Id */
  @Type()
  @IsNumber()
  projectId: number;

  /* 用户名 */
  @IsOptional()
  @IsString()
  userName?: string;

  /* 手机号 */
  @IsOptional()
  @IsString()
  phonenumber?: string;
}

/* 单个取消用户项目授权 */
export class ReqCancelDto {
  /* 项目ID */
  @Type()
  @IsNumber()
  projectId: number;

  /* 用户ID */
  @Type()
  @IsNumber()
  userId: number;
}

/* 批量 取消/授权 项目授权 */
export class ReqCancelAllDto {
  /* 项目Id */
  @Type()
  @IsNumber()
  projectId: number;

  /* 用户ID字符串拼接如 1,2,3 */
  @Type()
  @IsString()
  userIds: string;
}
