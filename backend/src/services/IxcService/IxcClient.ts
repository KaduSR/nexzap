import axios, { AxiosInstance } from "axios";
import { Buffer } from "buffer";
import AppError from "../../errors/AppError";

interface InvoiceData {
  id: number;
  valor: number;
  vencimento: string;
  link_boleto: string;
  pix_copia_cola: string;
  status: string;
}

interface DunningInvoice {
    id: number;
    cliente_nome: string;
    cliente_telefone: string;
    valor: string;
    vencimento: string;
    linha_digitavel: string;
    pix_code: string;
    link_pdf: string;
}

interface ReceivedPayment {
    id_fatura: number;
    valor_recebido: number;
    data_pagamento: string;
    pix_code?: string;
}

class IxcClient {
  private api: AxiosInstance;

  constructor(token: string, domain: string) {
    this.api = axios.create({
      baseURL: `${domain}/webservice/v1`,
      headers: {
        Authorization: `Basic ${Buffer.from(token).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });
  }

  // 1. Buscar Cliente pelo CPF/CNPJ
  async getClientByCpf(cpf: string): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development' && cpf === '00000000000') {
         return { id: 1, razao: "Cliente Teste", bloqueado: "S", ativo: "S", status_conexao: "online" };
      }

      const response = await this.api.post("/cliente", {
        qtype: "cliente.cnpj_cpf",
        query: cpf.replace(/\D/g, ""),
        oper: "=",
      });

      if (response.data.total > 0) {
        return response.data.registros[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar cliente IXC:", error);
      return null;
    }
  }

  // 1.1 Buscar Cliente pelo Telefone (Zero-Click Auth)
  async getClientByPhone(phone: string): Promise<any> {
    try {
      // Mock para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
         // Simula encontrar cliente pelo número
         return { id: 1, razao: "João Silva (Auto)", cpf_cnpj: "12345678900", bloqueado: "N", ativo: "S", status_conexao: "online" };
      }

      // Tenta buscar pelo celular
      const response = await this.api.post("/cliente", {
        qtype: "cliente.telefone_celular",
        query: phone, // Deve enviar apenas números ou formato like '%num%' dependendo da API
        oper: "LIKE",
      });

      if (response.data.total > 0) {
        return response.data.registros[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar cliente por telefone no IXC:", error);
      return null;
    }
  }

  // 2. Listar Faturas em Aberto
  async getOpenInvoices(clienteId: string | number): Promise<InvoiceData[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
          return [
              { id: 101, valor: 99.90, vencimento: "10/11/2024", link_boleto: "https://ixc.net/boleto/123", pix_copia_cola: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540599.905802BR5913Internet Provider6008Sao Paulo62070503***6304ABCD", status: "Aberto" }
          ];
      }

      const response = await this.api.post("/fn_areceber", {
        qtype: "fn_areceber.id_cliente",
        query: clienteId,
        oper: "=",
        status: "A"
      });

      if (response.data.total === 0) return [];

      return response.data.registros.map((reg: any) => ({
        id: reg.id,
        valor: reg.valor,
        vencimento: reg.data_vencimento,
        link_boleto: `https://ixc.provider.com/boleto/${reg.id}`,
        pix_copia_cola: reg.pix_qrcode_text || "Chave PIX indisponível via API",
        status: "Aberto"
      }));

    } catch (error) {
      console.error("Erro ao buscar faturas:", error);
      return [];
    }
  }

  // 2.1 Buscar Faturas por Data de Vencimento (Para Régua de Cobrança)
  async getInvoicesByDueDate(dateString: string): Promise<DunningInvoice[]> {
      try {
          if (process.env.NODE_ENV === 'development') {
              // Mock invoices expiring on that date
              return [
                  { 
                      id: 201, 
                      cliente_nome: "Maria Souza", 
                      cliente_telefone: "11988776655", 
                      valor: "99.90", 
                      vencimento: dateString,
                      linha_digitavel: "1234.5678.9012.3456",
                      pix_code: "00020126580014br.gov.bcb.pix...",
                      link_pdf: "http://ixc.link/pdf/201"
                  },
                  { 
                      id: 202, 
                      cliente_nome: "João Silva", 
                      cliente_telefone: "11999887766", 
                      valor: "149.90", 
                      vencimento: dateString,
                      linha_digitavel: "9876.5432.1098.7654",
                      pix_code: "00020126580014br.gov.bcb.pix...",
                      link_pdf: "http://ixc.link/pdf/202"
                  }
              ];
          }

          const response = await this.api.post("/fn_areceber", {
              qtype: "fn_areceber.data_vencimento",
              query: dateString,
              oper: "=",
              status: "A" // Apenas Aberto
          });

          if (response.data.total === 0) return [];

          // Note: In a real implementation you would join with client table to get phone numbers
          // For simplicity here assuming data comes populated or fetched additionally
          return response.data.registros.map((reg: any) => ({
              id: reg.id,
              cliente_nome: reg.cliente_razao || "Cliente",
              cliente_telefone: "00000000000", // Needs separate fetch in real IXC API v1
              valor: reg.valor,
              vencimento: reg.data_vencimento,
              linha_digitavel: "...",
              pix_code: reg.pix_qrcode_text || "",
              link_pdf: `https://ixc.provider.com/boleto/${reg.id}`
          }));

      } catch (error) {
          console.error("Erro ao buscar faturas por data:", error);
          return [];
      }
  }

  // 2.2 Buscar Baixas (Recebimentos)
  async getReceivingRecords(filters: { date: string }): Promise<ReceivedPayment[]> {
      try {
          if (process.env.NODE_ENV === 'development') {
              // Mock random payments for simulation
              return [
                  { id_fatura: 101, valor_recebido: 99.90, data_pagamento: filters.date }, // Matches seed ID
                  { id_fatura: 201, valor_recebido: 99.90, data_pagamento: filters.date }
              ];
          }

          // Busca no IXC por data de recebimento
          const response = await this.api.post("/fn_areceber", {
              qtype: "fn_areceber.data_recebimento",
              query: filters.date,
              oper: "=",
              status: "R" // Recebido
          });

          if (response.data.total === 0) return [];

          return response.data.registros.map((reg: any) => ({
              id_fatura: reg.id,
              valor_recebido: parseFloat(reg.valor_recebido || reg.valor),
              data_pagamento: reg.data_recebimento,
              pix_code: reg.pix_qrcode_text
          }));

      } catch (error) {
          console.error("Erro ao buscar recebimentos:", error);
          return [];
      }
  }

  // 3. Desbloqueio de Confiança
  async unlockClient(clienteId: string | number): Promise<{ success: boolean; message: string }> {
    try {
      // Mock Dev
      if (process.env.NODE_ENV === 'development') {
          return { success: true, message: "🔓 Desbloqueio de confiança realizado com sucesso! Aguarde 5 minutos e reinicie seu equipamento." };
      }

      const clientData = await this.api.post("/cliente", { 
          qtype: "cliente.id", 
          query: clienteId, 
          oper: "=" 
      });
      
      const cliente = clientData.data.registros[0];

      if (cliente && cliente.bloqueado === "N") {
        return { success: false, message: "Sua conexão já consta como desbloqueada em nosso sistema!" };
      }

      // Executa desbloqueio
      await this.api.post("/cliente_desbloqueio", { id_cliente: clienteId });

      return { success: true, message: "🔓 Desbloqueio de confiança realizado com sucesso! Aguarde 5 minutos e reinicie seu equipamento." };

    } catch (error) {
      console.error("Erro no desbloqueio:", error);
      return { success: false, message: "Não foi possível realizar o desbloqueio automático. Por favor, fale com um atendente." };
    }
  }

  // 4. Checar Conexão (Radacct/Logins)
  async checkConnection(clienteId: string | number): Promise<{ online: boolean, signal?: string, mac?: string }> {
      try {
          if (process.env.NODE_ENV === 'development') {
              return { online: true, signal: "-18dBm", mac: "AA:BB:CC:DD:EE:FF" };
          }
          
          // Simulação de busca na tabela radacct ou logins
          const response = await this.api.post("/radusuarios", {
              qtype: "radusuarios.id_cliente",
              query: clienteId,
              oper: "="
          });

          if(response.data.total > 0) {
              const login = response.data.registros[0];
              return { 
                  online: login.online === 'S', 
                  signal: "-20dBm", // Mock pois IXC nem sempre retorna sinal fácil via API v1
                  mac: login.mac 
              };
          }

          return { online: false };

      } catch (error) {
          return { online: false };
      }
  }
}

export default IxcClient;