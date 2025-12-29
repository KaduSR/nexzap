
/**
 * Serviço de Integração com IXC Provedor
 * Simula (e estrutura) as chamadas para a API do IXC.
 */

interface IxcCustomer {
  id: number;
  razao: string;
  fantasia: string;
  cnpj_cpf: string;
  telefone_celular: string;
  ativo: "S" | "N"; // S = Sim (Ativo), N = Não (Inativo/Cancelado)
  bloqueado: "S" | "N"; // S = Bloqueado
  plano: string;
  status_conexao: "online" | "offline";
  endereco: string;
}

interface IxcServiceOrderData {
    subjectId: string;
    departmentId: string;
    priority: string;
    description: string;
    contractId: string; // id_login no IXC
    shift: string; // Turno
    address: string; // Endereço de Instalação/Reparo
}

export const getCustomers = async (status: "active" | "blocked" | "all" = "all") => {
  // TODO: Em produção, substituir por axios.post('https://ixc.seudominio.com/webservice/v1/cliente', { ...auth })
  
  // Mock de dados retornados pelo IXC (Simulação de um Provedor Real)
  const mockCustomers: IxcCustomer[] = [
    { 
      id: 42901, 
      razao: "João Silva", 
      fantasia: "João", 
      cnpj_cpf: "123.456.789-00", 
      telefone_celular: "11999887766",
      ativo: "S", 
      bloqueado: "N",
      plano: "FIBRA 500MB",
      status_conexao: "online",
      endereco: "Rua das Flores, 123"
    },
    { 
      id: 42902, 
      razao: "Maria Souza", 
      fantasia: "Maria", 
      cnpj_cpf: "987.654.321-00", 
      telefone_celular: "11988776655",
      ativo: "S", 
      bloqueado: "S", // Cliente Bloqueado por débito
      plano: "FIBRA 300MB",
      status_conexao: "offline",
      endereco: "Av. Paulista, 1000"
    },
    { 
      id: 42903, 
      razao: "Empresa Alpha Ltda", 
      fantasia: "Alpha", 
      cnpj_cpf: "00.000.000/0001-99", 
      telefone_celular: "11977665544",
      ativo: "S", 
      bloqueado: "N", 
      plano: "LINK DEDICADO 1GB",
      status_conexao: "online",
      endereco: "Rua Empresarial, 500"
    },
    {
       id: 42904,
       razao: "Carlos Pereira",
       fantasia: "Carlos",
       cnpj_cpf: "111.222.333-44",
       telefone_celular: "11966554433",
       ativo: "S",
       bloqueado: "S",
       plano: "RADIO 50MB",
       status_conexao: "offline",
       endereco: "Sítio do Pica Pau, km 4"
    }
  ];

  // Filtragem Lógica
  if (status === "active") {
    // Retorna apenas Ativos e NÃO bloqueados
    return mockCustomers.filter(c => c.ativo === "S" && c.bloqueado === "N");
  }

  if (status === "blocked") {
    // Retorna apenas Bloqueados (mas que o cadastro ainda está ativo 'S')
    return mockCustomers.filter(c => c.ativo === "S" && c.bloqueado === "S");
  }

  return mockCustomers;
};

export const getCustomerByCpf = async (cpf: string) => {
    // Lógica para buscar cliente específico
    console.log(`Buscando cliente CPF: ${cpf}`);
    return { id: 42901, nome: "João Silva", status: "ATIVO" };
};

/**
 * Busca Assuntos (Tipos de O.S.) do IXC
 * Tabela: su_oss_assunto
 */
export const getOsSubjects = async () => {
    // Mock
    return [
        { id: 1, label: "Suporte Técnico - Lentidão" },
        { id: 2, label: "Suporte Técnico - Sem Conexão" },
        { id: 3, label: "Instalação" },
        { id: 4, label: "Troca de Endereço" },
        { id: 5, label: "Retirada de Equipamento" }
    ];
};

/**
 * Busca Departamentos (Setores) do IXC
 * Tabela: ticket_setor
 */
export const getOsDepartments = async () => {
    // Mock
    return [
        { id: 101, label: "Suporte Nível 1" },
        { id: 102, label: "NOC / Redes" },
        { id: 103, label: "Técnicos de Campo" },
        { id: 104, label: "Comercial" }
    ];
};

/**
 * Cria uma Nova Ordem de Serviço
 * Tabela: su_oss_chamado
 */
export const createServiceOrder = async (data: IxcServiceOrderData) => {
    console.log("[IXC API] Criando Ordem de Serviço:", data);
    
    // Simulação de chamada POST para API IXC
    // Endpoint: webservice/v1/su_oss_chamado
    // Payload: { id_cliente, id_assunto, setor, mensagem, prioridade, endereco, turno ... }
    
    return { 
        success: true, 
        message: "Ordem de Serviço criada com sucesso", 
        id_oss: Math.floor(Math.random() * 100000),
        kanban: "O.S. enviada para o Kanban do Dia."
    };
};
