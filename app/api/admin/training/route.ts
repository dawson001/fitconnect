import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/sensay-sdk/client';
import { postV1ReplicasByReplicaUuidTraining, putV1ReplicasByReplicaUuidTrainingByTrainingId } from '@/sensay-sdk';
import * as cheerio from 'cheerio';

const sensayClient = createClient({
  baseUrl: 'https://api.sensay.io',
  headers: {
    'X-ORGANIZATION-SECRET': process.env.SENSAY_ORG_SECRET || '73fce804638b7e5d1fc1a2cfc0550a7ff713288c72353c87379c755e5a57c008',
    'X-API-Version': '2025-05-01',
    'Content-Type': 'application/json'
  }
});

async function extractContentFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove scripts, styles e elementos irrelevantes
    $('script, style, nav, header, footer, aside, .navigation, .menu, .ads').remove();
    
    // Extrair conteúdo principal
    let textContent = '';
    
    // Tentar encontrar conteúdo principal por seletores comuns
    const mainSelectors = [
      'main',
      'article', 
      '.content',
      '.post-content',
      '.entry-content',
      '#content',
      '.main-content',
      'body'
    ];
    
    for (const selector of mainSelectors) {
      const mainElement = $(selector);
      if (mainElement.length > 0) {
        textContent = mainElement.text();
        break;
      }
    }
    
    // Se não encontrou por seletores, usar o body completo
    if (!textContent) {
      textContent = $('body').text();
    }
    
    // Limpar e normalizar o texto
    textContent = textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    if (!textContent || textContent.length < 100) {
      throw new Error('Conteúdo insuficiente extraído da URL');
    }
    
    // Limitar o tamanho do conteúdo para evitar tokens excessivos
    if (textContent.length > 50000) {
      textContent = textContent.substring(0, 50000) + '...';
    }
    
    return textContent;
  } catch (error) {
    throw new Error(`Erro ao extrair conteúdo da URL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const replicaUUID = formData.get('replicaUUID') as string;
    const text = formData.get('text') as string;
    const file = formData.get('file') as File;
    const url = formData.get('url') as string;

    if (!replicaUUID) {
      return NextResponse.json(
        { success: false, message: 'UUID da réplica é obrigatório' },
        { status: 400 }
      );
    }

    let content = '';
    let sourceType = 'text';
    let sourceUrl = '';
    
    if (file) {
      content = await file.text();
      sourceType = 'file_upload';
    } else if (text) {
      content = text;
      sourceType = 'text';
    } else if (url) {
      content = await extractContentFromUrl(url);
      sourceType = 'url';
      sourceUrl = url;
    } else {
      return NextResponse.json(
        { success: false, message: 'Texto, arquivo ou URL é obrigatório' },
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

    // Enviar conteúdo de treinamento
    const trainingBody: {
      rawText: string;
      metadata?: {
        source: string;
        type: string;
        extracted_at: string;
      };
    } = {
      rawText: content
    };

    // Adicionar metadata para URLs
    if (sourceType === 'url' && sourceUrl) {
      trainingBody.metadata = {
        source: sourceUrl,
        type: 'url',
        extracted_at: new Date().toISOString()
      };
    }

    await putV1ReplicasByReplicaUuidTrainingByTrainingId({
      client: sensayClient,
      path: { 
        replicaUUID, 
        trainingID: trainingResponse.data.knowledgeBaseID 
      },
      body: trainingBody
    });

    return NextResponse.json({
      success: true,
      message: 'Conteúdo de treinamento enviado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao enviar treinamento:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao enviar treinamento' },
      { status: 500 }
    );
  }
} 