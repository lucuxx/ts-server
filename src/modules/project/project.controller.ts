/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataObj } from 'src/common/class/data-obj.class';
import {
  ApiDataResponse,
  typeEnum,
} from 'src/common/decorators/api-data-response.decorator';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Keep } from 'src/common/decorators/keep.decorator';
import { BusinessTypeEnum, Log } from 'src/common/decorators/log.decorator';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { User, UserEnum } from 'src/common/decorators/user.decorator';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { UserInfoPipe } from 'src/common/pipes/user-info.pipe';
import { ExcelService } from 'src/modules/common/excel/excel.service';
import { User as UserEntity } from 'src/modules/system/user/entities/user.entity';
import { ApiException } from 'src/common/exceptions/api.exception';

import {
  ReqAddProjectDto,
  ReqAllocatedListDto,
  ReqCancelAllDto,
  ReqCancelDto,
  // ReqChangeStatusDto,
  // ReqDataScopeDto,
  ReqProjectListDto,
  ReqUpdateProjectDto,
} from './dto/req-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@ApiTags('项目管理')
@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly excelService: ExcelService,
  ) {}

  /* 新增项目 */
  @RepeatSubmit()
  @Post('create')
  // @RequiresPermissions('project:manage:add')
  @Log({
    title: '项目管理',
    businessType: BusinessTypeEnum.insert,
  })
  async add(
    @Body() reqAddProjectDto: ReqAddProjectDto,
    @User(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    const user = await this.projectService.findOneByProjectNameState(
      reqAddProjectDto.projectName,
    );
    if (user) throw new ApiException('该项目名称已存在，请更换');
    reqAddProjectDto.createBy = reqAddProjectDto.updateBy = userName;
    await this.projectService.addOrUpdate(reqAddProjectDto);
  }

  /* 分页查询项目列表 */
  @Get('list')
  @RequiresPermissions('project:manage:query')
  @ApiPaginatedResponse(Project)
  async list(@Query(PaginationPipe) reqProjectListDto: ReqProjectListDto) {
    return this.projectService.list(reqProjectListDto);
  }

  /* 通过Id 查询项目 */
  @Get(':projectId')
  @RequiresPermissions('project:manage:query')
  @ApiDataResponse(typeEnum.object, Project)
  async one(@Param('projectId') projectId: number) {
    const project = await this.projectService.findById(projectId);
    return DataObj.create(project);
  }

  /* 编辑项目 */
  @RepeatSubmit()
  @Put('update')
  @RequiresPermissions('project:manage:edit')
  @Log({
    title: '项目管理',
    businessType: BusinessTypeEnum.update,
  })
  async update(
    @Body() reqUpdateProjectDto: ReqUpdateProjectDto,
    @User(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    reqUpdateProjectDto.updateBy = userName;
    await this.projectService.addOrUpdate(reqUpdateProjectDto);
  }

  /* 删除项目 */
  @Delete(':projectIds')
  @RequiresPermissions('system:project:remove')
  @Log({
    title: '项目管理',
    businessType: BusinessTypeEnum.delete,
  })
  async delete(
    @Param('projectIds') projectIds: string,
    @User(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    await this.projectService.delete(projectIds.split(','), userName);
  }

  /* 导出项目列表 */
  @RepeatSubmit()
  @Post('export')
  @Keep()
  @Log({
    title: '项目管理',
    businessType: BusinessTypeEnum.export,
    isSaveResponseData: false,
  })
  async export(@Body(PaginationPipe) reqProjectListDto: ReqProjectListDto) {
    const { rows } = await this.projectService.list(reqProjectListDto);
    const file = await this.excelService.export(Project, rows);
    return new StreamableFile(file);
  }

  /* 分页获取项目下的用户列表 */
  @Post('allocatedList')
  @ApiPaginatedResponse(UserEntity)
  async allocatedList(@Body() reqAllocatedListDto: ReqAllocatedListDto) {
    return this.projectService.allocatedListByProjectId(reqAllocatedListDto);
  }

  /* 分页获取该项目下不存在的用户列表 */
  @Post('unallocatedList')
  async unallocatedList(@Body() reqAllocatedListDto: ReqAllocatedListDto) {
    return this.projectService.allocatedListByProjectId(
      reqAllocatedListDto,
      true,
    );
  }

  /* 单个取消用户角色授权 */
  @RepeatSubmit()
  @Put('cancel')
  async cancel(@Body() reqCancelDto: ReqCancelDto) {
    const userIdArr = [reqCancelDto.userId];
    await this.projectService.cancel(reqCancelDto.projectId, userIdArr);
  }

  /* 批量取消用户项目授权 */
  @RepeatSubmit()
  @Post('cancelAll')
  async cancelAll(@Body() reqCancelAllDto: ReqCancelAllDto) {
    const userIdArr = reqCancelAllDto.userIds.split(',');
    await this.projectService.cancel(reqCancelAllDto.projectId, userIdArr);
  }

  /* 给项目分配用户 */
  @RepeatSubmit()
  @Post('selectUser')
  async selectAll(@Body() reqCancelAllDto: ReqCancelAllDto) {
    const userIdArr = reqCancelAllDto.userIds.split(',');
    await this.projectService.selectAll(reqCancelAllDto.projectId, userIdArr);
  }
}
