import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const trainingDir = 'training-data';
    
    if (!fs.existsSync(trainingDir)) {
      return NextResponse.json({
        success: true,
        files: []
      });
    }
    
    const files = fs.readdirSync(trainingDir);
    
    const fileList = files.map(file => {
      const filePath = path.join(trainingDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2) + ' KB';
      
      return {
        name: file,
        path: filePath,
        size,
        modified: stats.mtime.toLocaleDateString('pt-BR')
      };
    });
    
    return NextResponse.json({
      success: true,
      files: fileList
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar arquivos' },
      { status: 500 }
    );
  }
} 