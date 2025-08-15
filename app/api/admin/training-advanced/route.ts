import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/sensay-sdk/client';
import { postV1ReplicasByReplicaUuidTraining, putV1ReplicasByReplicaUuidTrainingByTrainingId } from '@/sensay-sdk';

const sensayClient = createClient({
  baseUrl: 'https://api.sensay.io',
  headers: {
    'X-ORGANIZATION-SECRET': process.env.SENSAY_ORG_SECRET || '73fce804638b7e5d1fc1a2cfc0550a7ff713288c72353c87379c755e5a57c008',
    'X-API-Version': '2025-03-25',
    'Content-Type': 'application/json'
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      replicaUUID, 
      rawText, 
      processedText, 
      vectorEntryId, 
      metadata = {} 
    } = body;

    if (!replicaUUID) {
      return NextResponse.json(
        { success: false, message: 'UUID da réplica é obrigatório' },
        { status: 400 }
      );
    }

    if (!rawText && !processedText) {
      return NextResponse.json(
        { success: false, message: 'rawText ou processedText é obrigatório' },
        { status: 400 }
      );
    }

    // Criar entrada de treinamento
    const trainingResponse = await postV1ReplicasByReplicaUuidTraining({
      client: sensayClient,
      path: { replicaUUID }
    });

    if (!trainingResponse.data?.knowledgeBaseID) {
      throw new Error('ID de treinamento não retornado');
    }

    // Preparar o body para o PUT com os parâmetros avançados
    const putBody: {
      rawText?: string;
      processedText?: string;
      vectorEntryId?: string;
      metadata?: Record<string, unknown>;
    } = {};
    
    if (rawText) putBody.rawText = rawText;
    if (processedText) putBody.processedText = processedText;
    if (vectorEntryId) putBody.vectorEntryId = vectorEntryId;
    if (Object.keys(metadata).length > 0) putBody.metadata = metadata;

    // Enviar conteúdo de treinamento com parâmetros avançados
    await putV1ReplicasByReplicaUuidTrainingByTrainingId({
      client: sensayClient,
      path: { 
        replicaUUID, 
        trainingID: trainingResponse.data.knowledgeBaseID 
      },
      headers: {
        'X-API-Version': '2025-03-25'
      },
      body: putBody
    });

    return NextResponse.json({
      success: true,
      message: 'Conteúdo de treinamento avançado enviado com sucesso!',
      trainingID: trainingResponse.data.knowledgeBaseID
    });
  } catch (error) {
    console.error('Erro ao enviar treinamento avançado:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao enviar treinamento avançado' },
      { status: 500 }
    );
  }
} 