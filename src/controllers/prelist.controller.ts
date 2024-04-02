import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { Success, errorResponse, sendResponse } from 'utils';
import { Response } from 'express';
import { PrelistService } from '../services/prelist.service';
import {
  ArrayOfIdDTO,
  CreatePrelistDTO,
  GetPrelistDTO,
  GetPrelistDTOPipe,
  GetPrelistOptionDTO,
  GetPrelistOptionsDTOPipe,
  GetPrelistRequestDTO,
  GetPrelistRequestDTOPipe,
  GetPrelistRequestOptionDTO,
  GetPrelistRequestOptionsDTOPipe,
} from '../dto/prelist.dto';
import getPrelistOptionPipeline from '../pipeline/getPrelistOption.pipeline';
import getPrelistPipeline from '../pipeline/getPrelist.pipeline';
import getPrelistRequestPipeline from '../pipeline/getPrelistRequest.pipeline';
import getPrelistRequestOptionPipeline from '../pipeline/getPrelistRequestOption.pipeline';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('/v2/prelist')
export class PrelistController {
  constructor(private prelistService: PrelistService) {}

  @Get()
  @ApiOperation({
    summary: 'get prelist list',
  })
  @ApiQuery({
    name: 'Query Params',
    type: GetPrelistDTO,
  })
  @ApiQuery({
    type: String,
    name: 'search',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'sortBy',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'sortOrder',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'group',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'user',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get assignment prelist data',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get assignment prelist data',
        },
        data: {
          type: 'object',
          properties: {
            totalRecords: { type: 'integer', example: 3 },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '6603e10ad07e13b634630f1a' },
                  totalAssets: { type: 'number', example: 3 },
                  user: { type: 'string', example: 'Mr. Good' },
                  group: { type: 'string', example: 'Ruang Workshop' },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignment prelist data
  async getPrelistList(
    @Res() res: Response,
    @Query(GetPrelistDTOPipe) query: GetPrelistDTO,
  ) {
    try {
      const list = await this.prelistService.aggregatePrelist(
        getPrelistPipeline(query),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }

      await sendResponse(
        res,
        new Success('Successfully get assignment prelist data', response),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get('options')
  @ApiOperation({ summary: 'Get prelist Options' })
  @ApiQuery({ name: 'Query params', type: GetPrelistOptionDTO })
  @ApiQuery({
    name: 'userOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'groupOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get assignment prelist options',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get assignment prelist options',
        },
        data: {
          type: 'object',
          properties: {
            groupOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Group 1' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            userOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Mr. Good' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignment prelist options
  async getPrelistOption(
    @Res() res: Response,
    @Query(GetPrelistOptionsDTOPipe)
    query: GetPrelistOptionDTO,
  ) {
    try {
      const optionPipeline = getPrelistOptionPipeline(query);

      const optionsList =
        await this.prelistService.aggregatePrelist(optionPipeline);

      let result = {};
      if (optionsList.length > 0) {
        result = optionsList[0];
      }

      await sendResponse(
        res,
        new Success('Successfully get assignment prelist options', result),
      );
    } catch (error) {
      console.log(error);
      errorResponse(error);
    }
  }
  @Get('request/:id')
  @ApiOperation({ summary: 'Get assignment prelist request Data' })
  @ApiQuery({ name: 'Query params', type: GetPrelistRequestDTO })
  @ApiQuery({
    type: String,
    name: 'search',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'sortBy',
    required: false,
  })
  @ApiQuery({
    type: Number,
    name: 'sortOrder',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'asset',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'brand',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'model',
    required: false,
  })
  @ApiQuery({
    type: [Number],
    name: 'group',
    required: false,
  })
  @ApiQuery({
    type: [String],
    name: 'tag',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get assignment prelist request data',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get assignment prelist request data',
        },
        data: {
          type: 'object',
          properties: {
            totalRecords: { type: 'integer', example: 3 },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '6603e10ad07e13b634630f1d' },
                  assetQr: { type: 'boolean', example: true },
                  assetRfid: { type: 'boolean', example: true },
                  name: { type: 'string', example: 'asset name' },
                  brand: {
                    type: 'string',
                    example: 'brand name',
                  },
                  model: {
                    type: 'string',
                    example: 'model name',
                  },
                  group: {
                    type: 'string',
                    example: 'group name',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignment prelist request data per assignment prelist id
  async getPrelistRequestList(
    @Res() res: Response,
    @Param('id') id: string,
    @Query(GetPrelistRequestDTOPipe) query: GetPrelistRequestDTO,
  ) {
    try {
      const list = await this.prelistService.aggregatePrelistRequest(
        getPrelistRequestPipeline(query, id),
      );

      let response = { totalRecords: 0, data: [] };
      if (list.length > 0) {
        response = list[0];
      }

      await sendResponse(
        res,
        new Success(
          'Successfully get assignment prelist request data',
          response,
        ),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Get('request/options')
  @ApiOperation({ summary: 'Get assignment prelist request Options' })
  @ApiQuery({ name: 'Query params', type: GetPrelistRequestOptionDTO })
  @ApiQuery({
    name: 'assetOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'brandOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'modelOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'tagOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiQuery({
    name: 'groupOptions',
    type: String,
    example: true,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get assignment prelist request options',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully get assignment prelist request options',
        },
        data: {
          type: 'object',
          properties: {
            groupOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'first Reader' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            brandOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'brand name' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            modelOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'model name' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
            tagOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Non TAG' },
                  value: { type: 'integer', example: 'Non TAG' },
                },
              },
            },
            assetOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'asset name' },
                  value: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
      },
    },
  })
  // get assignment prelist request options
  async getPrelistRequestOption(
    @Res() res: Response,
    @Query(GetPrelistRequestOptionsDTOPipe)
    query: GetPrelistRequestOptionDTO,
  ) {
    try {
      const optionPipeline = getPrelistRequestOptionPipeline(query);

      const optionsList =
        await this.prelistService.aggregatePrelistRequest(optionPipeline);

      let result = {};
      if (optionsList.length > 0) {
        result = optionsList[0];
      }

      await sendResponse(
        res,
        new Success(
          'Successfully get assignment prelist request options',
          result,
        ),
      );
    } catch (error) {
      console.log(error);
      errorResponse(error);
    }
  }
  @Post()
  @ApiOperation({
    summary: 'Create assignment prelist',
  })
  @ApiBody({
    description: 'body request',
    required: true,
    type: CreatePrelistDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully create  prelist',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Successfully create  prelist' },
      },
    },
  })
  // craete assignment prelist and assignment prelist request
  async createPrelist(@Res() res: Response, @Body() body: CreatePrelistDTO) {
    try {
      await this.prelistService.createPrelist(body);
      await sendResponse(res, new Success('Successfully create  prelist'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete prelist data',
  })
  @ApiBody({
    description: 'Request Body',
    type: ArrayOfIdDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully delete prelist',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Successfully delete prelist' },
      },
    },
  })
  // delete assignment prelist and related assignment prelist request
  async removePrelists(@Res() res: Response, @Body() body: ArrayOfIdDTO) {
    try {
      await this.prelistService.removePrelists(body.id);

      await sendResponse(res, new Success('Successfully delete prelist'));
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }

  @Delete('request')
  @ApiOperation({
    summary: 'delete assignment prelist requests',
  })
  @ApiBody({
    description: 'Request Body',
    type: ArrayOfIdDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully delete prelist request',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully delete prelist request',
        },
      },
    },
  })
  // delete assignment prelist request data
  async removePrelistRequests(
    @Res() res: Response,
    @Body() body: ArrayOfIdDTO,
  ) {
    try {
      await this.prelistService.removePrelistReqests(body.id);

      await sendResponse(
        res,
        new Success('Successfully delete prelist request'),
      );
    } catch (error) {
      console.error(error);
      errorResponse(error);
    }
  }
}
