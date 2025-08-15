'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ADMIN_PASSWORD } from '../../lib/config';

interface Replica {
  uuid: string;
  name: string;
  shortDescription: string;
  slug: string;
  tags: string[];
  private: boolean;
  greeting: string;
  purpose?: string;
  type: string;
  ownerID: string;
}

interface TrainingFile {
  name: string;
  size: string;
  modified: string;
  path: string;
}

interface TrainingContent {
  id: number;
  type: string;
  filename: string | null;
  url?: string;
  status: string;
  raw_text: string | null;
  processed_text: string | null;
  created_at: string;
  updated_at: string;
  title?: string;
}

// Componente de Login
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simular delay de autenticação
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('fitconnect-admin-auth', 'true');
        onLogin();
      } else {
        setError('Senha incorreta');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-4">
              🔐
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Acesso Administrativo</h1>
            <p className="text-gray-600 mt-2">Digite a senha para acessar o painel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite a senha..."
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verificando...
                </div>
              ) : (
                '🔑 Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Voltar ao Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [replicas, setReplicas] = useState<Replica[]>([]);
  const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>([]);
  const [trainingContent, setTrainingContent] = useState<Record<string, TrainingContent[]>>({});
  const [selectedReplica, setSelectedReplica] = useState<Replica | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'replicas' | 'training' | 'files' | 'trained'>('replicas');
  
  // Form states
  const [uploadText, setUploadText] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [editingFile, setEditingFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  
  // Advanced training form states
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [advancedForm, setAdvancedForm] = useState({
    rawText: '',
    processedText: '',
    vectorEntryId: '',
    metadata: {
      tags: '',
      source: '',
      page: '',
      custom: '{}'
    }
  });

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const authStatus = localStorage.getItem('fitconnect-admin-auth');
    setIsAuthenticated(authStatus === 'true');
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    loadReplicas();
    loadTrainingFiles();
    loadTrainingContent();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadReplicas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/replicas');
      if (response.ok) {
        const data = await response.json();
        setReplicas(data.replicas || []);
      } else {
        showMessage('error', 'Erro ao carregar réplicas');
      }
    } catch (error) {
      showMessage('error', 'Erro ao conectar com API');
    }
    setLoading(false);
  };

  const loadTrainingFiles = async () => {
    try {
      const response = await fetch('/api/admin/training-files');
      if (response.ok) {
        const data = await response.json();
        setTrainingFiles(data.files || []);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    }
  };

  const loadTrainingContent = async () => {
    try {
      const response = await fetch('/api/admin/training-content');
      if (response.ok) {
        const data = await response.json();
        setTrainingContent(data.trainingByReplica || {});
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo de treinamento:', error);
    }
  };

  const createReplica = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/replicas', {
        method: 'POST'
      });
      
      if (response.ok) {
        showMessage('success', 'Réplica criada com sucesso!');
        loadReplicas();
        loadTrainingContent();
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Erro ao criar réplica');
      }
    } catch (error) {
      showMessage('error', 'Erro ao criar réplica');
    }
    setLoading(false);
  };

  const deleteReplica = async (uuid: string) => {
    if (!confirm('Tem certeza que deseja deletar esta réplica?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/replicas/${uuid}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showMessage('success', 'Réplica deletada com sucesso!');
        loadReplicas();
        setSelectedReplica(null);
      } else {
        showMessage('error', 'Erro ao deletar réplica');
      }
    } catch (error) {
      showMessage('error', 'Erro ao deletar réplica');
    }
    setLoading(false);
  };

  const uploadAdvancedTraining = async (uuid: string) => {
    try {
      // Preparar metadata
      const metadata: Record<string, unknown> = {};
      
      if (advancedForm.metadata.tags) {
        metadata.tags = advancedForm.metadata.tags.split(',').map(tag => tag.trim());
      }
      if (advancedForm.metadata.source) {
        metadata.source = advancedForm.metadata.source;
      }
      if (advancedForm.metadata.page) {
        metadata.page = parseInt(advancedForm.metadata.page) || advancedForm.metadata.page;
      }
      
      // Tentar fazer parse do JSON customizado
      try {
        const customMetadata = JSON.parse(advancedForm.metadata.custom);
        Object.assign(metadata, customMetadata);
      } catch {
        // Ignorar se não for JSON válido
      }

      const response = await fetch('/api/admin/training-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replicaUUID: uuid,
          rawText: advancedForm.rawText || undefined,
          processedText: advancedForm.processedText || undefined,
          vectorEntryId: advancedForm.vectorEntryId || undefined,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined
        })
      });

      if (response.ok) {
        showMessage('success', 'Treinamento avançado enviado com sucesso!');
        setAdvancedForm({
          rawText: '',
          processedText: '',
          vectorEntryId: '',
          metadata: {
            tags: '',
            source: '',
            page: '',
            custom: '{}'
          }
        });
        loadTrainingContent();
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Erro ao enviar treinamento avançado');
      }
    } catch (error) {
      showMessage('error', 'Erro ao enviar treinamento avançado');
    }
  };

  const uploadTraining = async (uuid: string) => {
    if (!uploadText && !uploadFile && !uploadUrl) {
      showMessage('error', 'Adicione texto, selecione um arquivo ou forneça uma URL');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('replicaUUID', uuid);
      
      if (uploadFile) {
        formData.append('file', uploadFile);
      } else if (uploadText) {
        formData.append('text', uploadText);
      } else if (uploadUrl) {
        formData.append('url', uploadUrl);
      }

      const response = await fetch('/api/admin/training', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        showMessage('success', 'Conteúdo de treinamento enviado!');
        setUploadText('');
        setUploadFile(null);
        setUploadUrl('');
        loadTrainingContent();
      } else {
        showMessage('error', 'Erro ao enviar treinamento');
      }
    } catch (error) {
      showMessage('error', 'Erro ao enviar treinamento');
    }
    setLoading(false);
  };

  const loadFileContent = async (filePath: string) => {
    try {
      const response = await fetch(`/api/admin/files/${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content);
        setEditingFile(filePath);
      }
    } catch (error) {
      showMessage('error', 'Erro ao carregar arquivo');
    }
  };

  const saveFileContent = async () => {
    try {
      const response = await fetch(`/api/admin/files/${encodeURIComponent(editingFile)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: fileContent })
      });

      if (response.ok) {
        showMessage('success', 'Arquivo salvo com sucesso!');
        setEditingFile('');
        setFileContent('');
        loadTrainingFiles();
      } else {
        showMessage('error', 'Erro ao salvar arquivo');
      }
    } catch (error) {
      showMessage('error', 'Erro ao salvar arquivo');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'READY':
        return { color: 'bg-green-100 text-green-800', icon: '✅', description: 'Pronto para uso' };
      case 'VECTOR_CREATED':
        return { color: 'bg-blue-100 text-blue-800', icon: '🔄', description: 'Vetores criados (funcional)' };
      case 'PROCESSING':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', description: 'Processando...' };
      case 'AWAITING_UPLOAD':
        return { color: 'bg-gray-100 text-gray-800', icon: '⏸️', description: 'Aguardando upload' };
      case 'SUPABASE_ONLY':
        return { color: 'bg-purple-100 text-purple-800', icon: '💾', description: 'Salvo no banco' };
      default:
        if (status.startsWith('ERR_')) {
          return { color: 'bg-red-100 text-red-800', icon: '❌', description: 'Erro no processamento' };
        }
        return { color: 'bg-gray-100 text-gray-800', icon: '❓', description: status };
    }
  };

  const deleteTrainingContent = async (trainingId: number) => {
    if (!confirm('Tem certeza que deseja deletar este conteúdo de treinamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeletingItems(prev => new Set(prev).add(trainingId));
    try {
      const response = await fetch(`/api/admin/training-content/${trainingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage('success', 'Conteúdo de treinamento deletado com sucesso!');
        loadTrainingContent();
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Erro ao deletar conteúdo');
      }
    } catch (error) {
      showMessage('error', 'Erro ao deletar conteúdo de treinamento');
    }
    setDeletingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(trainingId);
      return newSet;
    });
  };

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem('fitconnect-admin-auth');
    setIsAuthenticated(false);
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Mostrar tela de login se não autenticado
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔧 Painel Administrativo</h1>
              <p className="text-gray-600">Gerencie réplicas e arquivos de treinamento do FitConnect</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Voltar ao Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                🚪 Sair
              </button>
              <button
                onClick={loadReplicas}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                🔄 Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'replicas', label: 'Réplicas', count: replicas.length },
                { id: 'training', label: 'Treinamento', count: null },
                { id: 'trained', label: 'Já Treinado', count: Object.values(trainingContent).reduce((acc, items) => acc + items.length, 0) },
                { id: 'files', label: 'Arquivos', count: trainingFiles.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'replicas' | 'training' | 'files' | 'trained')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'replicas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Réplicas ({replicas.length})</h2>
              <button
                onClick={createReplica}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                ➕ Criar Réplica
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {replicas.map((replica) => (
                <div key={replica.uuid} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{replica.name}</h3>
                      <p className="text-sm text-gray-600">{replica.shortDescription}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${replica.private ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                      {replica.private ? 'Privada' : 'Pública'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Slug:</strong> {replica.slug}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>UUID:</strong> {replica.uuid.substring(0, 8)}...
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {replica.tags?.map((tag) => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReplica(replica)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200"
                    >
                      👁️ Ver
                    </button>
                    <button
                      onClick={() => deleteReplica(replica.uuid)}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200"
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de detalhes */}
            {selectedReplica && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{selectedReplica.name}</h3>
                      <button
                        onClick={() => setSelectedReplica(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Propósito</h4>
                        <p className="text-sm text-gray-600">{selectedReplica.purpose}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Saudação</h4>
                        <p className="text-sm text-gray-600">{selectedReplica.greeting}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Informações Técnicas</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>UUID:</strong> {selectedReplica.uuid}</p>
                          <p><strong>Tipo:</strong> {selectedReplica.type}</p>
                          <p><strong>Owner ID:</strong> {selectedReplica.ownerID}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Enviar Treinamento</h2>
              <button
                onClick={() => setShowAdvancedForm(!showAdvancedForm)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${showAdvancedForm ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-gray-700 hover:text-white`}
              >
                🔧 {showAdvancedForm ? 'Modo Simples' : 'Modo Avançado'}
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">
                {showAdvancedForm ? 'Treinamento Avançado' : 'Adicionar Conteúdo de Treinamento'}
              </h3>
              <p className="text-gray-600 mb-6">
                {showAdvancedForm 
                  ? 'Configure parâmetros avançados como rawText, processedText, vectorEntryId e metadata'
                  : 'Envie novo conteúdo para treinar uma réplica'
                }
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Réplica</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedReplica(replicas.find(r => r.uuid === e.target.value) || null)}
                  >
                    <option value="">Selecione uma réplica...</option>
                    {replicas.map((replica) => (
                      <option key={replica.uuid} value={replica.uuid}>
                        {replica.name}
                      </option>
                    ))}
                  </select>
                </div>

                {!showAdvancedForm ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Texto de Treinamento</label>
                      <textarea
                        placeholder="Cole o texto de treinamento aqui..."
                        value={uploadText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUploadText(e.target.value)}
                        rows={6}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="text-center text-gray-500">OU</div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload de Arquivo</label>
                      <input
                        type="file"
                        accept=".txt,.md"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadFile(e.target.files?.[0] || null)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="text-center text-gray-500">OU</div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL da Página Web</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/pagina-importante"
                        value={uploadUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadUrl(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        O sistema irá extrair automaticamente o conteúdo da página para treinamento
                      </p>
                    </div>

                    <button 
                      onClick={() => selectedReplica && uploadTraining(selectedReplica.uuid)}
                      disabled={loading || !selectedReplica}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📤 Enviar Treinamento
                    </button>
                  </>
                ) : (
                  <>
                    {/* Formulário Avançado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Raw Text
                          <span className="text-gray-500 text-xs ml-1">(texto original)</span>
                        </label>
                        <textarea
                          placeholder="Texto original que você quer que a réplica aprenda..."
                          value={advancedForm.rawText}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdvancedForm({...advancedForm, rawText: e.target.value})}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Processed Text
                          <span className="text-gray-500 text-xs ml-1">(texto otimizado)</span>
                        </label>
                        <textarea
                          placeholder="Texto já processado e otimizado para vetorização..."
                          value={advancedForm.processedText}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdvancedForm({...advancedForm, processedText: e.target.value})}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vector Entry ID
                        <span className="text-gray-500 text-xs ml-1">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ID do vetor no banco de dados (se existir)"
                        value={advancedForm.vectorEntryId}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdvancedForm({...advancedForm, vectorEntryId: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Metadata Section */}
                    <div className="border-t pt-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Metadata</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                          <input
                            type="text"
                            placeholder="tag1, tag2, tag3"
                            value={advancedForm.metadata.tags}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdvancedForm({...advancedForm, metadata: {...advancedForm.metadata, tags: e.target.value}})}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                          <input
                            type="text"
                            placeholder="manual do produto"
                            value={advancedForm.metadata.source}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdvancedForm({...advancedForm, metadata: {...advancedForm.metadata, source: e.target.value}})}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Page</label>
                          <input
                            type="text"
                            placeholder="42"
                            value={advancedForm.metadata.page}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdvancedForm({...advancedForm, metadata: {...advancedForm.metadata, page: e.target.value}})}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Metadata (JSON)
                          <span className="text-gray-500 text-xs ml-1">(propriedades adicionais)</span>
                        </label>
                        <textarea
                          placeholder='{"categoria": "fitness", "nivel": "iniciante"}'
                          value={advancedForm.metadata.custom}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdvancedForm({...advancedForm, metadata: {...advancedForm.metadata, custom: e.target.value}})}
                          rows={2}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => selectedReplica && uploadAdvancedTraining(selectedReplica.uuid)}
                      disabled={loading || !selectedReplica || (!advancedForm.rawText && !advancedForm.processedText)}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🚀 Enviar Treinamento Avançado
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trained' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Conteúdo Já Treinado</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Status dos treinamentos: 
                  <span className="ml-2 text-green-700 font-medium">✅ READY (Ideal)</span> • 
                  <span className="ml-1 text-blue-700 font-medium">🔄 VECTOR_CREATED (Funcional)</span> • 
                  <span className="ml-1 text-yellow-700 font-medium">⏳ PROCESSING</span> • 
                  <span className="ml-1 text-red-700 font-medium">❌ ERR_*</span>
                </p>
              </div>
              <button
                onClick={loadTrainingContent}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                🔄 Atualizar
              </button>
            </div>

            {Object.keys(trainingContent).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum conteúdo de treinamento encontrado</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(trainingContent).map(([replicaId, items]) => {
                  const replica = replicas.find(r => r.uuid === replicaId);
                  return (
                    <div key={replicaId} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {replica ? replica.name : `Réplica ${replicaId.substring(0, 8)}...`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {items.length} item(s) de treinamento
                        </p>
                      </div>
                      
                                               <div className="space-y-3">
                           {items.map((item) => (
                             <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                               <div className="flex justify-between items-start mb-2">
                                 <div className="flex items-center space-x-2">
                                   <span className="text-sm font-medium text-gray-900">
                                     {item.type === 'text' ? '📝 Texto' : 
                                      item.type === 'file_upload' ? '📁 Arquivo' : 
                                      item.type === 'url' ? '🔗 URL' : '📄 Outro'}
                                   </span>
                                   {item.filename && (
                                     <span className="text-sm text-gray-600">({item.filename})</span>
                                   )}
                                   {item.url && (
                                     <a 
                                       href={item.url} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="text-sm text-blue-600 hover:text-blue-800 underline"
                                       title={item.url}
                                     >
                                       ({new URL(item.url).hostname})
                                     </a>
                                   )}
                                 </div>
                                 <div className="flex items-center space-x-2">
                                   <span 
                                     className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(item.status).color}`}
                                     title={getStatusInfo(item.status).description}
                                   >
                                     {getStatusInfo(item.status).icon} {item.status}
                                   </span>
                                   <button
                                     onClick={() => deleteTrainingContent(item.id)}
                                     disabled={deletingItems.has(item.id)}
                                     className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded disabled:opacity-50"
                                     title="Deletar conteúdo de treinamento"
                                   >
                                     {deletingItems.has(item.id) ? '⏳' : '🗑️'}
                                   </button>
                                 </div>
                               </div>
                            
                            {item.title && (
                              <p className="text-sm font-medium text-gray-900 mb-2">{item.title}</p>
                            )}
                            
                            {item.raw_text && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">Texto Original:</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                                  {item.raw_text}
                                </p>
                              </div>
                            )}
                            
                                                         <div className="flex justify-between text-xs text-gray-500">
                               <span>ID: {item.id} • Criado: {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                               <span>Atualizado: {new Date(item.updated_at).toLocaleDateString('pt-BR')}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Arquivos de Treinamento ({trainingFiles.length})</h2>
              <button
                onClick={loadTrainingFiles}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                🔄 Atualizar
              </button>
            </div>

            <div className="space-y-4">
              {trainingFiles.map((file) => (
                <div key={file.path} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-600">
                          {file.size} • Modificado em {file.modified}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => loadFileContent(file.path)}
                      className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200"
                    >
                      ⚙️ Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de edição de arquivo */}
            {editingFile && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Editando: {editingFile}</h3>
                      <button
                        onClick={() => setEditingFile('')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <textarea
                      value={fileContent}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFileContent(e.target.value)}
                      rows={20}
                      className="w-full h-full p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                  
                  <div className="p-6 border-t flex gap-3">
                    <button
                      onClick={saveFileContent}
                      className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700"
                    >
                      💾 Salvar Alterações
                    </button>
                    <button
                      onClick={() => setEditingFile('')}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-400"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 