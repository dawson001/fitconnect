import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/sensay-sdk/client';
import { deleteV1TrainingByTrainingId } from '@/sensay-sdk';

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
  { params }: { params: { id: string } }
) {
  try {
    const trainingID = parseInt(params.id);
    
    if (isNaN(trainingID)) {
      return NextResponse.json(
        { success: false, message: 'ID de treinamento inválido' },
        { status: 400 }
      );
    }

    const response = await deleteV1TrainingByTrainingId({
      client: sensayClient,
      path: { trainingID }
    });

    if (response.data?.success) {
      return NextResponse.json({
        success: true,
        message: 'Conteúdo de treinamento deletado com sucesso!'
      });
    } else {
      throw new Error('Falha ao deletar o conteúdo');
    }
  } catch (error) {
    console.error('Erro ao deletar conteúdo de treinamento:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar conteúdo de treinamento' },
      { status: 500 }
    );
  }
} 