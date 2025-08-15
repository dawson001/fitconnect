// Configuração centralizada do FitConnect

// Configurações da API Sensay
export const SENSAY_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SENSAY_API_URL || 'https://api.sensay.io',
  orgSecret: process.env.NEXT_PUBLIC_SENSAY_ORG_SECRET || '',
  apiVersion: process.env.NEXT_PUBLIC_SENSAY_API_VERSION || '2025-05-01',
};

// UUID da replica para chat de clientes
export const REPLICA_UUID = process.env.NEXT_PUBLIC_REPLICA_UUID || '';

// Senha do admin (apenas servidor)
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fitconnect2025!';

// Função para verificar se as configurações estão corretas
export const validateConfig = () => {
  const missing = [];
  
  if (!SENSAY_CONFIG.orgSecret) {
    missing.push('NEXT_PUBLIC_SENSAY_ORG_SECRET');
  }
  
  if (!REPLICA_UUID) {
    missing.push('NEXT_PUBLIC_REPLICA_UUID');
  }
  
  if (missing.length > 0) {
    console.error('Variáveis de ambiente faltando:', missing);
    return false;
  }
  
  return true;
}; 