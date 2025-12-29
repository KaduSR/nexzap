
/**
 * Serviço de Integração SIP / SonaVOIP
 * Responsável por validar e persistir as credenciais do PABX/Softphone.
 */

interface SipConfig {
  accountName: string;
  sipServer: string;
  sipProxy: string;
  username: string;
  domain: string;
  login: string;
  password?: string;
  displayName: string;
  transport: string;
  keepAlive: number;
}

// Em um cenário real, isso seria um Model do Sequelize (ex: SipSettings)
// Por enquanto, usamos uma variável em memória para simular o banco
let mockSipDb: SipConfig = {
    accountName: '',
    sipServer: '',
    sipProxy: '',
    username: '',
    domain: '',
    login: '',
    password: '',
    displayName: '',
    transport: 'UDP',
    keepAlive: 15
};

export const saveConfig = async (data: SipConfig) => {
    console.log("[SipService] Salvando configurações SIP:", data.username);
    
    // Validação básica
    if (!data.sipServer || !data.username || !data.domain) {
        throw new Error("Campos obrigatórios (Servidor, Usuário, Domínio) não preenchidos.");
    }

    // Simulando persistência no banco de dados
    mockSipDb = { ...data };

    return { 
        success: true, 
        message: "Configurações SIP atualizadas com sucesso." 
    };
};

export const getConfig = async () => {
    // Simulando delay de banco de dados
    // await new Promise(resolve => setTimeout(resolve, 200));
    
    // Retorna a config (sem expor a senha em texto plano se fosse real)
    return mockSipDb;
};
