<<<<<<< HEAD:src/controllers/role.controller.ts
import { Controller, Get, Post, Res, Query, Req, Body } from '@nestjs/common';
import { RoleService } from '../services/role.service';
=======
import { Controller, Get, Post, Body, Res, Query, Req } from '@nestjs/common';
import { GroupService } from '../services/group.service';
>>>>>>> parent of f638c27 (feat: add request scoped service with connection):src/controllers/group.controller.ts
import { Created, errorResponse, Success, sendResponse } from 'utils';
import { CreateGroupDTO, GetRolesDTO, GetRolesDTOPipe } from '../dto/role.dto';
import { Request, Response } from 'express';
import getGroupPipeline from '../pipeline/getGroupList.pipeline';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Role')
@ApiBearerAuth('access-token')
@Controller('/v2/')
export class RoleController {
  constructor(private groupService: RoleService) {}

  @Get('/')
  @ApiQuery({ name: 'Query params', type: GetRolesDTO })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'brands',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'models',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sortOrder',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get device name',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        description: {
          type: 'string',
          example: 'Successfully get device name',
        },
        data: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 8 },
            modelOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'BOGO' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            brandOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'BOG' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            names: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  category: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      key: { type: 'integer' },
                    },
                  },
                  key: { type: 'integer' },
                  brands: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        key: { type: 'integer' },
                        name: { type: 'string' },
                      },
                    },
                  },
                  models: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        key: { type: 'integer' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  //Get role list for table
  async getRoleList(
    @Req() req: Request,
    @Res() res: Response,
<<<<<<< HEAD:src/controllers/role.controller.ts
    @Query(GetRolesDTOPipe) query: GetRolesDTO,
=======
    @Query(GetGroupDTOPipe) query: GetGroupDTO,
    @Req() req: Request,
>>>>>>> parent of f638c27 (feat: add request scoped service with connection):src/controllers/group.controller.ts
  ) {
    try {
      console.log(req.user);
      const list = await this.groupService.aggregateGroups(
        getGroupPipeline(query),
      );

      let result = { total: 0, groups: [] };
      if (list.length > 0) {
        result = list[0];
      }

      await sendResponse(
        res,
        new Success('Successfully get group list', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Post('/')
  @ApiBody({
    description: 'Request body',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Example Name' },
        category: { type: 'number (key)', example: 1 },
        measurement: { type: '_id', example: '65c1d1ac1e3b9c60644a3b62' },
      },
    },
  })
  //Create one group data
  async createGroup(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateGroupDTO,
  ) {
    try {
      const result = await this.groupService.createGroup(body);

      // await this.groupService.createGroupChangelog(result, req.user.id);

      await sendResponse(
        res,
        new Created('Successfully created group', result),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
}
