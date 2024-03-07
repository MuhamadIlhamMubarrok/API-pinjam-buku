import { Request, Response } from 'express';
import { Controller, Get, Post, Body, Res, Query, Req } from '@nestjs/common';
import {
  GetReaderDTO,
  GetReaderDTOPipe,
  GetReaderOptionsDTO,
  GetReaderOptionsDTOPipe,
} from 'src/dto/reader.dto';
import { Success, errorResponse, sendResponse } from 'utils';
import { ReaderService } from 'src/services/reader.service';
import getReaderListPipeline from 'src/pipeline/getReaderList.pipeline';
import getReaderOptionsPipeline from 'src/pipeline/getReaderOptions.pipeline';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Reader')
@ApiBearerAuth('access-token')
@Controller('/v2/reader')
export class ReaderController {
  constructor(private readerService: ReaderService) {}

  @Get()
  @ApiOperation({ summary: 'Get Reader Data' })
  @ApiQuery({ name: 'Query params', type: GetReaderDTO })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
  })
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
    name: 'sortBy',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sortOrder',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'deviceName',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'group',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get readers',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: { type: 'string', example: 'Successfully get reader data' },
        data: {
          type: 'object',
          properties: {
            totalRecords: { type: 'integer', example: 3 },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '65e596c897047bf28f96d997' },
                  imageSmall: { type: 'string', example: 'small' },
                  imageBig: { type: 'string', example: 'big' },
                  status: { type: 'string', example: 'Available' },
                  name: { type: 'string', example: 'first Reader' },
                  group: { type: 'string', example: 'group name' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getReaderList(
    @Req() req: Request,
    @Res() res: Response,
    @Query(GetReaderDTOPipe) query: GetReaderDTO,
  ) {
    try {
      const list = await this.readerService.aggregateReaders(
        getReaderListPipeline(query),
      );

      let result = { totalRecords: 0, groups: [] };
      if (list.length > 0) {
        result = list[0];
      }

      await sendResponse(
        res,
        new Success('Successfully get reader data', result),
      );
    } catch (error) {
      console.log(error);
      errorResponse(error);
    }
  }

  @Get('options')
  @ApiOperation({ summary: 'Get Reader Options' })
  @ApiQuery({ name: 'Query params', type: GetReaderOptionsDTO })
  @ApiQuery({
    name: 'deviceNameOptions',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'groupOptions',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully get reader options',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: { type: 'string', example: 'Successfully get reader options' },
        data: {
          type: 'object',
          properties: {
            deviceNameOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'first Reader' },
                  value: { type: 'string', example: 'first Reader' },
                },
              },
            },
            groupOptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'group name' },
                  value: { type: 'string', example: 'group name' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getReaderOptions(
    @Req() req: Request,
    @Res() res: Response,
    @Query(GetReaderOptionsDTOPipe) query: GetReaderOptionsDTO,
  ) {
    try {
      const optionPipeline = getReaderOptionsPipeline(query);

      const optionsList =
        await this.readerService.aggregateReaders(optionPipeline);

      let result = {};
      if (optionsList.length > 0) {
        result = optionsList[0];
      }

      await sendResponse(
        res,
        new Success('Successfully get reader options', result),
      );
    } catch (error) {
      console.log(error);
      errorResponse(error);
    }
  }

  // @Get('dummy')
  // async createReaderData() {
  //   this.readerService.createReader({
  //     imageBig: 'big3',
  //     imageMedium: 'medium3',
  //     imageSmall: 'small3',
  //     serialNumber: '12323',
  //     name: {
  //       _id: '645f199a413acc55bfe6c439',
  //       name: 'third Reader',
  //       nameWithSequence: 'third Reader - 3',
  //       key: 3,
  //     },
  //     group: {
  //       _id: '6458b5d09baf734db2b39419',
  //       name: 'group Name two',
  //       key: 1,
  //     },
  //     manager: {
  //       _id: '6454c4253dd1017f28689572',
  //       fullName: 'manager fullname three',
  //       key: 2,
  //     },
  //     status: 'Missing',
  //     lastReportReason: 'Damaged',
  //     lastReportDate: '2024-02-27T06:31:39.081+00:00',
  //     createdAt: '2024-02-27T06:31:39.081+00:00',
  //     updatedAt: '2024-02-27T06:31:39.081+00:00',
  //   });
  // }
}
