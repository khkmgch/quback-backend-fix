export const imageFileFilter = (
    req: any,
    file: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    },
    callback: (error: Error, acceptFile: boolean) => void,
  ) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  };
  export const editFileName = (
    req: any,
    file: Express.Multer.File,
    callback: (error: Error, filename: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, uniqueSuffix + '-' + file.originalname);
  };
  