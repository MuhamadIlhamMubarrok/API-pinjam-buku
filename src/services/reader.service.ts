import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, PipelineStage } from 'mongoose';
import { IReader } from 'schemas';
import { MongooseConfigService } from 'src/db/db.config';
import { CreateReaderDTO } from 'src/dto/reader.dto';
import { ReaderSchema } from 'src/models/reader.model';

@Injectable({ scope: Scope.REQUEST })
export class ReaderService {
  private readerModel: Model<IReader>;

  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,

    @Inject(REQUEST)
    private req: Request,
  ) {
    this.setConnection();
  }

  public setConnection = async () => {
    this.readerModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/${this.req?.user?.companyCode || 'error'}_tagsamurai`,
      'readers',
      ReaderSchema,
    )) as Model<IReader>;
  };

  async aggregateReaders(pipeline: PipelineStage[]): Promise<any[]> {
    return await this.readerModel.aggregate(pipeline);
  }

  async createReader(data: CreateReaderDTO): Promise<IReader> {
    console.log(data);
    return await this.readerModel.create(data);
  }
}
