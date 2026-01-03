// cspell: disable

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string | number;
        name: string;
        companyId: number;
        profile: string;
        super: boolean;
        iat?: number;
        exp?: number;
      };
      // Adicione outras propriedades personalizadas aqui se precisar
      files?: Express.Multer.File[];
      file?: Express.Multer.File;
    }
  }
}
