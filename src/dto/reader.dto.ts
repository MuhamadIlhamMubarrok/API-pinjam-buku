import { Injectable, PipeTransform } from '@nestjs/common';
import { IsOptional } from 'class-validator';

export class GetReaderDTO {
  @IsOptional()
  search?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: string | number;

  @IsOptional()
  deviceName?: string[] | string;

  @IsOptional()
  status?: string[] | string;

  @IsOptional()
  group?: string[] | string;
}

@Injectable()
export class GetReaderDTOPipe implements PipeTransform {
  transform(query: GetReaderDTO): GetReaderDTO {
    const { page, limit, sortOrder, deviceName, status, group } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (group) {
      query.group = JSON.parse(group as string);
    }

    if (deviceName) {
      query.deviceName = JSON.parse(deviceName as string);
    }

    if (status) {
      query.status = JSON.parse(status as string);
    }

    return query;
  }
}

export class GetReaderOptionsDTO extends GetReaderDTO {
  @IsOptional()
  deviceNameOptions?: boolean | string;

  @IsOptional()
  groupOptions?: boolean | string;
}

@Injectable()
export class GetReaderOptionsDTOPipe implements PipeTransform {
  transform(query: GetReaderOptionsDTO): GetReaderDTO {
    const { deviceNameOptions, groupOptions } = query;

    if (deviceNameOptions) {
      if (deviceNameOptions == 'true') {
        query.deviceNameOptions = true;
      } else if (deviceNameOptions == 'false') {
        query.deviceNameOptions = false;
      } else {
        query.deviceNameOptions = undefined;
      }
    }
    if (groupOptions) {
      if (groupOptions == 'true') {
        query.groupOptions = true;
      } else if (groupOptions == 'false') {
        query.groupOptions = false;
      } else {
        query.groupOptions = undefined;
      }
    }

    return query;
  }
}

export class CreateReaderDTO {
  imageBig?: string;
  imageMedium?: string;
  imageSmall?: string;
  serialNumber?: string;
  name?: {
    _id: string;
    name: string;
    nameWithSequence: string;
    key: number;
  };
  group?: { _id: string; name: string; key: number };
  manager?: { _id: string; fullName: string; key: number };
  status?: 'Available' | 'Damaged' | 'Missing';
  lastReportReason?: 'Damaged' | 'Missing';
  lastReportDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
