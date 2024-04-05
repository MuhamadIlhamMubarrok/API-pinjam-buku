import { Injectable, PipeTransform } from '@nestjs/common';
import { IsMongoId, IsOptional } from 'class-validator';

export class GetApprovalListDTO {
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
  status?: string | string[];

  @IsOptional()
  group?: string | number[];

  @IsOptional()
  user?: string | number[];

  @IsOptional()
  manager?: string | number[];

  @IsOptional()
  lastUpdate?: string | number[];

  @IsOptional()
  @IsMongoId()
  loggedInUser?: string;
}

@Injectable()
export class GetApprovalListDTOPipe implements PipeTransform {
  transform(query: GetApprovalListDTO): GetApprovalListDTO {
    const { page, limit, sortOrder, status, group, user, manager, lastUpdate } =
      query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (status) {
      query.status = JSON.parse(status as string);
    }

    if (group) {
      query.group = JSON.parse(group as string);
    }

    if (user) {
      query.user = JSON.parse(user as string);
    }

    if (manager) {
      query.manager = JSON.parse(manager as string);
    }

    if (lastUpdate) {
      query.lastUpdate = JSON.parse(lastUpdate as string);
    }

    return query;
  }
}

export class GetApprovalOptionDTO extends GetApprovalListDTO {
  @IsOptional()
  statusOptions?: boolean | string;

  @IsOptional()
  userOptions?: boolean | string;

  @IsOptional()
  groupOptions?: boolean | string;

  @IsOptional()
  managerOptions?: boolean | string;
}

@Injectable()
export class GetApprovalOptionsDTOPipe implements PipeTransform {
  transform(query: GetApprovalOptionDTO): GetApprovalListDTO {
    const { userOptions, groupOptions, statusOptions, managerOptions } = query;
    if (groupOptions == 'true') {
      query.groupOptions = true;
    } else if (groupOptions == 'false') {
      query.groupOptions = false;
    } else {
      query.groupOptions = undefined;
    }

    if (userOptions == 'true') {
      query.userOptions = true;
    } else if (userOptions == 'false') {
      query.userOptions = false;
    } else {
      query.userOptions = undefined;
    }

    if (managerOptions == 'true') {
      query.managerOptions = true;
    } else if (managerOptions == 'false') {
      query.managerOptions = false;
    } else {
      query.managerOptions = undefined;
    }

    if (statusOptions == 'true') {
      query.statusOptions = true;
    } else if (statusOptions == 'false') {
      query.statusOptions = false;
    } else {
      query.statusOptions = undefined;
    }

    return query;
  }
}

export class GetApprovalPerTransactionDTO {
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
  asset?: string | number[];

  @IsOptional()
  brand?: string | number[];

  @IsOptional()
  model?: string | number[];

  @IsOptional()
  status?: string | string[];

  @IsOptional()
  transaction?: string;

  @IsOptional()
  loggedInUser?: string;
}

@Injectable()
export class GetApprovalPerTransactionDTOPipe implements PipeTransform {
  transform(query: GetApprovalPerTransactionDTO): GetApprovalPerTransactionDTO {
    const { page, limit, sortOrder, asset, brand, model, status } = query;

    if (limit) {
      query.limit = parseInt(limit as string);
    }

    if (page) {
      query.page = parseInt(page as string);
    }

    if (sortOrder) {
      query.sortOrder = parseInt(sortOrder as string);
    }

    if (asset) {
      query.asset = JSON.parse(asset as string);
    }

    if (brand) {
      query.brand = JSON.parse(brand as string);
    }

    if (model) {
      query.model = JSON.parse(model as string);
    }

    if (status) {
      query.status = JSON.parse(status as string);
    }

    return query;
  }
}

export class GetApprovalPerTransactionOptionDTO extends GetApprovalPerTransactionDTO {
  @IsOptional()
  assetOptions?: boolean | string;

  @IsOptional()
  brandOptions?: boolean | string;

  @IsOptional()
  modelOptions?: boolean | string;
}

@Injectable()
export class GetApprovalPerTransactionOptionDTOPipe implements PipeTransform {
  transform(
    query: GetApprovalPerTransactionOptionDTO,
  ): GetApprovalPerTransactionOptionDTO {
    const { assetOptions, brandOptions, modelOptions } = query;
    if (assetOptions == 'true') {
      query.assetOptions = true;
    } else if (assetOptions == 'false') {
      query.assetOptions = false;
    } else {
      query.assetOptions = undefined;
    }

    if (brandOptions == 'true') {
      query.brandOptions = true;
    } else if (brandOptions == 'false') {
      query.brandOptions = false;
    } else {
      query.brandOptions = undefined;
    }

    if (modelOptions == 'true') {
      query.modelOptions = true;
    } else if (modelOptions == 'false') {
      query.modelOptions = false;
    } else {
      query.modelOptions = undefined;
    }
    return query;
  }
}
