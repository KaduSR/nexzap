
/**
 * Mock Middleware de Autenticação
 * Em produção, este arquivo validaria o JWT e injetaria o usuário na requisição.
 */
const isAuth = (req: any, res: any, next: any) => {
  // Simulação de autenticação bem-sucedida
  next();
};

export default isAuth;
