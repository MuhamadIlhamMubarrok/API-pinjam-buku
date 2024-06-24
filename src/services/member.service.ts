import { Inject, Injectable, Scope } from '@nestjs/common';
import { Model, PipelineStage } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MongooseConfigService } from '../db/db.config';
import { IMember } from 'schemas';
import { MemberSchema } from '../models/member.model';
import { CreateMemberDTO } from '../dto/member.dto';

@Injectable({ scope: Scope.REQUEST })
export class MemberService {
  private memberModel: Model<IMember>;
  constructor(
    @Inject(MongooseConfigService)
    private connectionManager: MongooseConfigService,
    @Inject(REQUEST)
    private req: Request,
  ) {
    this.setConnection();
  }
  public setConnection = async () => {
    this.memberModel = (await this.connectionManager.getModel(
      `mongodb://127.0.0.1:27017/00000_perpustakaan`,
      'member',
      MemberSchema,
    )) as Model<IMember>;
  };

  async aggregateMember(pipeline: PipelineStage[]): Promise<any[]> {
    return await this.memberModel.aggregate(pipeline);
  }

  async createMember(body: CreateMemberDTO) {
    return await this.memberModel.create({
      name: body.name,
      isPunishment: false,
      expiredPunishment: null,
    });
  }
}
