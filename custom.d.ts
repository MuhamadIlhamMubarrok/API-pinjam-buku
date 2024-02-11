declare namespace Express {
  export interface Request {
    user?: {
      id?: string;
      company?: string;
      companyCode?: string;
    };
    companyConnection?: import('mongoose').Connection;
    globalConnection?: import('mongoose').Connection;
    upload?: {
      dir: string;
      fileNamePrefix: string;
    };
    uploadedFile?: string;
  }
}
