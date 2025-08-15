import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/sensay-sdk/client';
import { deleteV1ReplicasByReplicaUuid } from '@/sensay-sdk';

const sensayClient = createClient({
  baseUrl: 'https://api.sensay.io',
  headers: {
    'X-ORGANIZATION-SECRET': process.env.SENSAY_ORG_SECRET || '73fce804638b7e5d1fc1a2cfc0550a7ff713288c72353c87379c755e5a57c008',
    'X-API-Version': '2025-05-01',
    'Content-Type': 'application/json'
  }
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { uuid } = params;

    await deleteV1ReplicasByReplicaUuid({
      client: sensayClient,
      path: { replicaUUID: uuid }
    });

    return NextResponse.json({
      success: true,
      message: 'Réplica deletada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar réplica:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar réplica' },
      { status: 500 }
    );
  }
} 