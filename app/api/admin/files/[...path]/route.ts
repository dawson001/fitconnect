import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const filePath = params.path.join('/');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    return NextResponse.json({
      success: true,
      content,
      path: filePath
    });
  } catch (error) {
    console.error('Erro ao ler arquivo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao ler arquivo' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const filePath = params.path.join('/');
    const { content } = await request.json();
    
    // Criar diretório se não existir
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'Arquivo salvo com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao salvar arquivo' },
      { status: 500 }
    );
  }
} 