'use client';

import Link from 'next/link';
import { SENSAY_CONFIG, REPLICA_UUID, validateConfig } from '../../lib/config';

export default function TestEnv() {
  const isConfigValid = validateConfig();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste de Variáveis de Ambiente</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status da Configuração</h2>
          <div className={`p-4 rounded ${isConfigValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConfigValid ? '✅ Configuração válida' : '❌ Configuração inválida'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Configuração Sensay</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Base URL:</strong> {SENSAY_CONFIG.baseUrl || '❌ Não definido'}
              </div>
              <div>
                <strong>Org Secret:</strong> {SENSAY_CONFIG.orgSecret ? '✅ Definido' : '❌ Não definido'}
              </div>
              <div>
                <strong>API Version:</strong> {SENSAY_CONFIG.apiVersion || '❌ Não definido'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Replica</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>UUID:</strong> {REPLICA_UUID ? '✅ Definido' : '❌ Não definido'}
              </div>
              {REPLICA_UUID && (
                <div className="text-xs text-gray-600 break-all">
                  {REPLICA_UUID}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Variáveis de Ambiente Raw</h3>
          <div className="space-y-2 text-sm font-mono bg-gray-100 p-4 rounded">
            <div>NEXT_PUBLIC_SENSAY_API_URL: {process.env.NEXT_PUBLIC_SENSAY_API_URL || 'undefined'}</div>
            <div>NEXT_PUBLIC_SENSAY_ORG_SECRET: {process.env.NEXT_PUBLIC_SENSAY_ORG_SECRET ? 'defined' : 'undefined'}</div>
            <div>NEXT_PUBLIC_SENSAY_API_VERSION: {process.env.NEXT_PUBLIC_SENSAY_API_VERSION || 'undefined'}</div>
            <div>NEXT_PUBLIC_REPLICA_UUID: {process.env.NEXT_PUBLIC_REPLICA_UUID ? 'defined' : 'undefined'}</div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Voltar para a página principal
          </Link>
        </div>
      </div>
    </div>
  );
} 