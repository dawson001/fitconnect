#!/usr/bin/env tsx

import { createClient } from '../sensay-sdk/client';
import {
  postV1Replicas,
  postV1ReplicasByReplicaUuidTraining,
  putV1ReplicasByReplicaUuidTrainingByTrainingId,
  getV1ReplicasByReplicaUuidTrainingFilesUpload,
  getV1Replicas,
  getV1ReplicasByReplicaUuid,
  deleteV1ReplicasByReplicaUuid
} from '../sensay-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as readline from 'readline';
import { Command } from 'commander';

// Configuração do cliente Sensay
const sensayClient = createClient({
  baseUrl: 'https://api.sensay.io',
  headers: {
    'X-ORGANIZATION-SECRET': process.env.SENSAY_ORG_SECRET || '73fce804638b7e5d1fc1a2cfc0550a7ff713288c72353c87379c755e5a57c008',
    'X-API-Version': '2025-05-01',
    'Content-Type': 'application/json'
  }
});

interface ReplicaConfig {
  name: string;
  purpose: string;
  shortDescription: string;
  greeting: string;
  type: 'individual' | 'character' | 'brand';
  ownerID: string;
  slug: string;
  tags: string[];
  personality: string;
  profileImage?: string;
  suggestedQuestions?: string[];
  trainingDataFile: string;
}

// Configuração da réplica FitConnect
const FITCONNECT_REPLICA_CONFIG: ReplicaConfig = {
  name: "FitConnect",
  purpose: "We connect you to the perfect personal trainer through artificial intelligence. No complications, no wasted time — just the ideal match for your goals.",
  shortDescription: "Connect you to the perfect personal trainer",
  greeting: "Hello! I'm your personal assistant to find the perfect personal trainer for you. Let's discover together which professional perfectly matches your goals and preferences. Ready to start?",
  type: "character",
  ownerID: "fitconnect-admin",
  slug: "fitconnect-assistant-english",
  tags: ["fitness", "personal-trainer", "health", "training", "matchmaking"],
  personality: `You are a specialized assistant from FitConnect that helps people find the perfect personal trainer through a structured questionnaire and personalized.

IMPORTANT: You must follow EXACTLY the instructions contained in the training file initial.txt. Follow the conversation flow, style, and all rules specified in this file.

Características principais:
- Be friendly, informal, and motivating
- Pass confidence and encourage the user
- Use short, natural phrases
- Always wait for the response before proceeding
- Follow the exact order of questions in the questionnaire
- Make motivational comments between questions
- At the end, present a maximum of 3 recommended personal trainers

Your goal is to collect all the necessary information following the structured flow and then present the best options for personal trainers for the user.`,
  trainingDataFile: "training-data/initial.txt"
};

async function createReplica(config: ReplicaConfig): Promise<string> {
  console.log(`🤖 Criando réplica: ${config.name}`);
  
  try {
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
        profileImage: config.profileImage,
        suggestedQuestions: config.suggestedQuestions,
        llm: {
          model: 'claude-4-sonnet-20250514',
          systemMessage: config.personality
        }
      }
    });
    console.log(response);
    if (response.data?.uuid) {
      console.log(`✅ Réplica criada com sucesso! UUID: ${response.data.uuid}`);
      return response.data.uuid;
    } else {
      throw new Error('UUID não retornado na resposta');
    }
  } catch (error) {
    console.error(`❌ Erro ao criar réplica:`, error);
    throw error;
  }
}

async function createTrainingEntry(replicaUUID: string): Promise<number> {
  console.log(`📝 Criando entrada de treinamento para réplica ${replicaUUID}`);
  
  try {
    const response = await postV1ReplicasByReplicaUuidTraining({
      client: sensayClient,
      path: { replicaUUID }
    });

    if (response.data?.knowledgeBaseID) {
      console.log(`✅ Entrada de treinamento criada! ID: ${response.data.knowledgeBaseID}`);
      return response.data.knowledgeBaseID;
    } else {
      throw new Error('ID de treinamento não retornado');
    }
  } catch (error) {
    console.error(`❌ Erro ao criar entrada de treinamento:`, error);
    throw error;
  }
}

async function uploadTrainingText(replicaUUID: string, trainingID: number, text: string): Promise<void> {
  console.log(`📚 Fazendo upload de texto de treinamento...`);
  
  try {
    await putV1ReplicasByReplicaUuidTrainingByTrainingId({
      client: sensayClient,
      path: { replicaUUID, trainingID },
      body: {
        rawText: text
      }
    });

    console.log(`✅ Texto de treinamento enviado com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao enviar texto de treinamento:`, error);
    throw error;
  }
}

async function uploadTrainingFile(replicaUUID: string, filePath: string): Promise<void> {
  console.log(`📁 Fazendo upload do arquivo: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const filename = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  try {
    // 1. Obter URL assinada para upload
    const uploadResponse = await getV1ReplicasByReplicaUuidTrainingFilesUpload({
      client: sensayClient,
      path: { replicaUUID },
      query: { filename }
    });

    if (!uploadResponse.data?.signedURL) {
      throw new Error('URL de upload não retornada');
    }

    // 2. Fazer upload do arquivo para a URL assinada
    const uploadUrl = uploadResponse.data.signedURL;
    const uploadResult = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });

    if (!uploadResult.ok) {
      throw new Error(`Erro no upload: ${uploadResult.statusText}`);
    }

    console.log(`✅ Arquivo ${filename} enviado com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao enviar arquivo:`, error);
    throw error;
  }
}

async function trainFitConnectReplica(): Promise<void> {
  const config = FITCONNECT_REPLICA_CONFIG;
  
  console.log(`🚀 Iniciando treinamento da réplica: ${config.name}`);

  // 1. Criar réplica
  const replicaUUID = await createReplica(config);

  // 2. Ler e treinar com o conteúdo do arquivo initial.txt
  console.log(`📚 Carregando dados de treinamento do arquivo: ${config.trainingDataFile}`);
  
  if (!fs.existsSync(config.trainingDataFile)) {
    throw new Error(`Arquivo de treinamento não encontrado: ${config.trainingDataFile}`);
  }

  const trainingContent = fs.readFileSync(config.trainingDataFile, 'utf-8');
  const trainingID = await createTrainingEntry(replicaUUID);
  await uploadTrainingText(replicaUUID, trainingID, trainingContent);
  
  console.log(`✅ Conteúdo do arquivo ${config.trainingDataFile} processado com sucesso`);

  console.log(`🎉 Treinamento da réplica ${config.name} concluído!`);
  console.log(`🔗 UUID da réplica: ${replicaUUID}`);
  
  // Salvar UUID em arquivo para uso posterior
  const configFile = 'replica-client-config.json';
  fs.writeFileSync(configFile, JSON.stringify({
    name: config.name,
    uuid: replicaUUID,
    slug: config.slug,
    createdAt: new Date().toISOString()
  }, null, 2));
  
  console.log(`💾 Configuração salva em: ${configFile}`);
}

async function listReplicas(): Promise<void> {
  console.log('📋 Listando réplicas...');
  
  try {
    const response = await getV1Replicas({
      client: sensayClient,
      query: {
        ownerID: 'fitconnect-admin'
      }
    });

    if (response.data?.items && response.data.items.length > 0) {
      console.log(`\n✅ Encontradas ${response.data.items.length} réplica(s):\n`);
      
      response.data.items.forEach((replica, index) => {
        console.log(`${index + 1}. ${replica.name}`);
        console.log(`   UUID: ${replica.uuid}`);
        console.log(`   Slug: ${replica.slug}`);
        console.log(`   Descrição: ${replica.shortDescription}`);
        console.log(`   Tags: ${replica.tags?.join(', ') || 'Nenhuma'}`);
        console.log(`   Privada: ${replica.private ? 'Sim' : 'Não'}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma réplica encontrada.');
    }
  } catch (error) {
    console.error('❌ Erro ao listar réplicas:', error);
    throw error;
  }
}

async function getReplicaDetails(uuid: string): Promise<void> {
  console.log(`🔍 Buscando detalhes da réplica: ${uuid}`);
  
  try {
    const response = await getV1ReplicasByReplicaUuid({
      client: sensayClient,
      path: { replicaUUID: uuid }
    });

    if (response.data) {
      const replica = response.data;
      console.log('\n📊 Detalhes da réplica:');
      console.log(`Nome: ${replica.name}`);
      console.log(`Propósito: ${replica.purpose || 'Não definido'}`);
      console.log(`Descrição: ${replica.shortDescription}`);
      console.log(`Saudação: ${replica.greeting}`);
      console.log(`Tipo: ${replica.type}`);
      console.log(`Owner ID: ${replica.ownerID}`);
      console.log(`Slug: ${replica.slug}`);
      console.log(`Tags: ${replica.tags?.join(', ') || 'Nenhuma'}`);
      console.log(`Privada: ${replica.private ? 'Sim' : 'Não'}`);
      console.log(`Perguntas sugeridas: ${replica.suggestedQuestions?.join(', ') || 'Nenhuma'}`);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar réplica:', error);
    throw error;
  }
}

async function deleteReplica(uuid: string): Promise<void> {
  console.log(`🗑️ Deletando réplica: ${uuid}`);
  
  try {
    await deleteV1ReplicasByReplicaUuid({
      client: sensayClient,
      path: { replicaUUID: uuid }
    });

    console.log('✅ Réplica deletada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao deletar réplica:', error);
    throw error;
  }
}

async function editTrainingFile(filePath: string): Promise<void> {
  console.log(`📝 Editando arquivo de treinamento: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
    console.log('📄 Criando novo arquivo...');
    fs.writeFileSync(filePath, '# Novo arquivo de treinamento\n\nAdicione seu conteúdo aqui...');
  }

  // Abrir arquivo no editor padrão do sistema
  try {
    let editor = process.env.EDITOR || 'notepad'; // Windows padrão
    
    // Detectar sistema operacional e usar editor apropriado
    if (process.platform === 'darwin') {
      editor = 'open -t'; // macOS
    } else if (process.platform === 'linux') {
      editor = process.env.EDITOR || 'nano'; // Linux
    }

    console.log(`🖊️ Abrindo ${filePath} no editor...`);
    
    const child = spawn(editor, [filePath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('exit', (code: number | null) => {
      if (code === 0) {
        console.log('✅ Arquivo editado com sucesso!');
        console.log(`📁 Localização: ${path.resolve(filePath)}`);
      } else {
        console.log('❌ Erro ao editar arquivo.');
      }
    });

  } catch (error) {
    console.error('❌ Erro ao abrir editor:', error);
    console.log(`📁 Edite manualmente o arquivo: ${path.resolve(filePath)}`);
  }
}

async function uploadNewTraining(replicaUUID: string, filePath?: string, text?: string): Promise<void> {
  console.log(`📤 Enviando novo conteúdo de treinamento para réplica: ${replicaUUID}`);
  
  try {
    const trainingID = await createTrainingEntry(replicaUUID);
    
    if (filePath) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      await uploadTrainingText(replicaUUID, trainingID, content);
      console.log(`✅ Conteúdo do arquivo ${filePath} enviado com sucesso!`);
      
    } else if (text) {
      await uploadTrainingText(replicaUUID, trainingID, text);
      console.log('✅ Texto enviado com sucesso!');
      
    } else {
      throw new Error('Especifique um arquivo (-f) ou texto (-t) para enviar');
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar treinamento:', error);
    throw error;
  }
}

async function listTrainingFiles(): Promise<void> {
  console.log('📁 Arquivos de treinamento disponíveis:');
  
  const trainingDir = 'training-data';
  
  if (!fs.existsSync(trainingDir)) {
    console.log('❌ Diretório training-data não encontrado');
    return;
  }
  
  const files = fs.readdirSync(trainingDir);
  
  if (files.length === 0) {
    console.log('📝 Nenhum arquivo encontrado');
    return;
  }
  
  files.forEach((file, index) => {
    const filePath = path.join(trainingDir, file);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   Tamanho: ${size} KB`);
    console.log(`   Modificado: ${stats.mtime.toLocaleDateString('pt-BR')}`);
    console.log('');
  });
}

// CLI Setup
const program = new Command();

program
  .name('train-replicas')
  .description('Script para treinar e gerenciar réplicas do FitConnect usando Sensay AI')
  .version('1.0.0');

program
  .command('create')
  .description('Criar e treinar a réplica do FitConnect')
  .action(async () => {
    try {
      await trainFitConnectReplica();
    } catch (error) {
      console.error('❌ Erro durante o treinamento:', error);
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Mostrar informações sobre a réplica')
  .action(() => {
    const config = FITCONNECT_REPLICA_CONFIG;
    console.log('📋 Informações da réplica FitConnect:');
    console.log(`  Nome: ${config.name}`);
    console.log(`  Propósito: ${config.purpose}`);
    console.log(`  Descrição: ${config.shortDescription}`);
    console.log(`  Arquivo de treinamento: ${config.trainingDataFile}`);
    console.log(`  Tags: ${config.tags.join(', ')}`);
  });

// === COMANDOS ADMINISTRATIVOS ===

program
  .command('admin:list')
  .description('🔧 [ADMIN] Listar todas as réplicas')
  .action(async () => {
    try {
      await listReplicas();
    } catch (error) {
      console.error('❌ Erro ao listar réplicas:', error);
      process.exit(1);
    }
  });

program
  .command('admin:details')
  .description('🔧 [ADMIN] Ver detalhes de uma réplica')
  .argument('<uuid>', 'UUID da réplica')
  .action(async (uuid: string) => {
    try {
      await getReplicaDetails(uuid);
    } catch (error) {
      console.error('❌ Erro ao buscar réplica:', error);
      process.exit(1);
    }
  });

program
  .command('admin:delete')
  .description('🔧 [ADMIN] Deletar uma réplica')
  .argument('<uuid>', 'UUID da réplica')
  .action(async (uuid: string) => {
    try {
      // Confirmar antes de deletar
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(`⚠️ Tem certeza que deseja deletar a réplica ${uuid}? (sim/não): `, async (answer: string) => {
        if (answer.toLowerCase() === 'sim' || answer.toLowerCase() === 's') {
          await deleteReplica(uuid);
        } else {
          console.log('❌ Operação cancelada.');
        }
        rl.close();
      });
    } catch (error) {
      console.error('❌ Erro ao deletar réplica:', error);
      process.exit(1);
    }
  });

program
  .command('admin:edit-file')
  .description('🔧 [ADMIN] Editar arquivo de treinamento')
  .argument('[file]', 'Caminho do arquivo (padrão: training-data/initial.txt)')
  .action(async (file?: string) => {
    try {
      const filePath = file || 'training-data/initial.txt';
      await editTrainingFile(filePath);
    } catch (error) {
      console.error('❌ Erro ao editar arquivo:', error);
      process.exit(1);
    }
  });

program
  .command('admin:upload')
  .description('🔧 [ADMIN] Enviar novo conteúdo de treinamento')
  .argument('<uuid>', 'UUID da réplica')
  .option('-f, --file <file>', 'Arquivo para enviar')
  .option('-t, --text <text>', 'Texto para enviar')
  .action(async (uuid: string, options) => {
    try {
      await uploadNewTraining(uuid, options.file, options.text);
    } catch (error) {
      console.error('❌ Erro ao enviar treinamento:', error);
      process.exit(1);
    }
  });

program
  .command('admin:files')
  .description('🔧 [ADMIN] Listar arquivos de treinamento')
  .action(async () => {
    try {
      await listTrainingFiles();
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(); 