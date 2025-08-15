import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/sensay-sdk/client';
import { getV1Training } from '@/sensay-sdk';

const sensayClient = createClient({
  baseUrl: 'https://api.sensay.io',
  headers: {
    'X-ORGANIZATION-SECRET': process.env.SENSAY_ORG_SECRET || '73fce804638b7e5d1fc1a2cfc0550a7ff713288c72353c87379c755e5a57c008',
    'X-API-Version': '2025-05-01',
    'Content-Type': 'application/json'
  }
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const replicaUUID = searchParams.get('replicaUUID');

    const response = await getV1Training({
      client: sensayClient,
      query: {
        limit: '50' // Limitar a 50 entradas por página
      }
    });

    if (response.data?.items) {
      // Filtrar por UUID da réplica se fornecido
      let trainingItems = response.data.items;
      
      if (replicaUUID) {
        trainingItems = trainingItems.filter(item => item.replica_uuid === replicaUUID);
      }

      // Organizar por réplica
      const trainingByReplica = trainingItems.reduce((acc, item) => {
        const replicaId = item.replica_uuid || 'unknown';
        if (!acc[replicaId]) {
          acc[replicaId] = [];
        }
        acc[replicaId].push({
          id: item.id,
          type: item.type,
          filename: item.filename,
          status: item.status,
          raw_text: item.raw_text ? 
            (item.raw_text.length > 200 ? item.raw_text.substring(0, 200) + '...' : item.raw_text) 
            : null,
          processed_text: item.processed_text ? 
            (item.processed_text.length > 200 ? item.processed_text.substring(0, 200) + '...' : item.processed_text) 
            : null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          title: item.title || undefined
        });
        return acc;
      }, {} as Record<string, Array<{
        id: number;
        type: string;
        filename: string | null;
        status: string;
        raw_text: string | null;
        processed_text: string | null;
        created_at: string;
        updated_at: string;
        title?: string;
      }>>);

      return NextResponse.json({
        success: true,
        trainingByReplica,
        totalItems: trainingItems.length
      });
    }

    return NextResponse.json({
      success: true,
      trainingByReplica: {},
      totalItems: 0
    });
  } catch (error) {
    console.error('Erro ao listar conteúdo de treinamento:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar conteúdo de treinamento' },
      { status: 500 }
    );
  }
} 