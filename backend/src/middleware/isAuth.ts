
/**
 * Mock Middleware de Autenticação
 * Em produção, este arquivo validaria o JWT e injetaria o usuário na requisição.
 */
const isAuth = (req: any, res: any, next: any) => {
  // Simulação de autenticação bem-sucedida
  // Injeta usuário mock para os controllers usarem req.user.id e req.user.companyId
  req.user = {
    id: 1,
    name: "Admin",
    companyId: 1,
    profile: "admin"
  };
  
  next();
};

export default isAuth;