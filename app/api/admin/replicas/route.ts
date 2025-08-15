import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/sensay-sdk/client';
import { getV1Replicas, postV1Replicas, postV1ReplicasByReplicaUuidTraining, putV1ReplicasByReplicaUuidTrainingByTrainingId } from '@/sensay-sdk';
import * as fs from 'fs';

const sensayClient = createClient({
  baseUrl: 'https://api.sensay.io',
  headers: {
    'X-ORGANIZATION-SECRET': process.env.SENSAY_ORG_SECRET || '73fce804638b7e5d1fc1a2cfc0550a7ff713288c72353c87379c755e5a57c008',
    'X-API-Version': '2025-05-01',
    'Content-Type': 'application/json'
  }
});

const FITCONNECT_REPLICA_CONFIG = {
  name: "FitConnect - Assistente Personal Trainer",
  purpose: "Ajudar pessoas a encontrar o personal trainer ideal através de um questionário estruturado",
  shortDescription: "Vamos conectar você ao personal trainer perfeito",
  greeting: "Olá! 💪 Bem-vindo ao FitConnect! Sou seu assistente pessoal para encontrar o personal trainer ideal para você. Vamos descobrir juntos qual profissional combina perfeitamente com seus objetivos e preferências. Pronto para começar?",
  type: "character" as const,
  ownerID: "fitconnect-admin",
  slug: "fitconnect-assistant",
  tags: ["fitness", "personal-trainer", "saude", "treino", "matchmaking"],
  personality: `Você é um assistente especializado do FitConnect que ajuda pessoas a encontrar o personal trainer ideal através de um questionário estruturado e personalizado.

IMPORTANTE: Você deve seguir EXATAMENTE as instruções contidas no arquivo de treinamento initial.txt. Siga o fluxo de conversa, o estilo e todas as regras especificadas nesse arquivo.

Características principais:
- Seja amigável, informal e motivador
- Passe confiança e incentive o usuário
- Use frases curtas e naturais
- Sempre espere pela resposta antes de prosseguir
- Siga a ordem exata das perguntas do questionário
- Faça comentários motivacionais entre as perguntas
- Ao final, apresente no máximo 3 personal trainers recomendados

Seu objetivo é coletar todas as informações necessárias seguindo o fluxo estruturado e depois apresentar as melhores opções de personal trainers para o usuário.`,
  trainingDataFile: "training-data/initial.txt"
};

export async function GET() {
  try {
    const response = await getV1Replicas({
      client: sensayClient,
      query: {
        ownerID: 'fitconnect-admin'
      }
    });

    return NextResponse.json({
      success: true,
      replicas: response.data?.items || []
    });
  } catch (error) {
    console.error('Erro ao listar réplicas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar réplicas' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const config = FITCONNECT_REPLICA_CONFIG;
    
    // Criar réplica
    const response = await postV1Replicas({
      client: sensayClient,
      body: {
        name: config.name,
        purpose: config.purpose,
        shortDescription: config.shortDescription,
        greeting: config.greeting,
        type: config.type,
        ownerID: config.ownerID,
        slug: config.slug,
        tags: config.tags,
        llm: {
          model: 'gpt-4o',
          systemMessage: config.personality
        }
      }
    });

    if (!response.data?.uuid) {
      throw new Error('UUID não retornado na resposta');
    }

    const replicaUUID = response.data.uuid;

    // Ler e treinar com o conteúdo do arquivo initial.txt
    if (fs.existsSync(config.trainingDataFile)) {
      const trainingContent = fs.readFileSync(config.trainingDataFile, 'utf-8');
      
      const trainingResponse = await postV1ReplicasByReplicaUuidTraining({
        client: sensayClient,
        path: { replicaUUID }
      });

      if (trainingResponse.data?.knowledgeBaseID) {
        await putV1ReplicasByReplicaUuidTrainingByTrainingId({
          client: sensayClient,
          path: { replicaUUID, trainingID: trainingResponse.data.knowledgeBaseID },
          body: {
            rawText: trainingContent
          }
        });
      }
    }

    // Salvar UUID em arquivo para uso posterior
    const configFile = 'replica-client-config.json';
    fs.writeFileSync(configFile, JSON.stringify({
      name: config.name,
      uuid: replicaUUID,
      slug: config.slug,
      createdAt: new Date().toISOString()
    }, null, 2));

    return NextResponse.json({
      success: true,
      replica: response.data,
      message: 'Réplica criada e treinada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao criar réplica:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar réplica' },
      { status: 500 }
    );
  }
} 