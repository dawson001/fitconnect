# FitConnect

Uma plataforma inteligente que conecta pessoas aos personal trainers ideais através de IA, powered by Sensay AI.

## 🎯 Sobre o Projeto

O FitConnect revolutiona a forma como pessoas encontram personal trainers. Utilizando inteligência artificial avançada da Sensay, conectamos clientes aos profissionais ideais baseado em objetivos, preferências e compatibilidade.

### Funcionalidades Principais

- **Chat IA Inteligente**: Encontre o personal trainer perfeito através de conversas inteligentes
- **Matching Personalizado**: Análise de perfil, objetivos e preferências para conexões ideais
- **Interface Moderna**: Design responsivo e experiência de usuário otimizada
- **Painel Administrativo**: Gerenciamento de réplicas e treinamento de IA

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Chave de API do Sensay AI

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/fitconnect.git
   cd fitconnect
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Copie o arquivo template
   cp config.template .env.local
   
   # Edite o arquivo .env.local com suas configurações
   # NEXT_PUBLIC_SENSAY_ORG_SECRET=sua-chave-sensay-aqui
   # NEXT_PUBLIC_REPLICA_UUID=uuid-da-sua-replica
   # ADMIN_PASSWORD=sua-senha-admin-aqui
   ```

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse o projeto**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## ⚙️ Configuração de Ambiente

O projeto utiliza variáveis de ambiente para configuração. Todas as configurações estão no arquivo `.env.local`:

### Variáveis Necessárias:

- **NEXT_PUBLIC_SENSAY_API_URL**: URL da API Sensay (padrão: https://api.sensay.io)
- **NEXT_PUBLIC_SENSAY_ORG_SECRET**: Chave secreta da organização Sensay
- **NEXT_PUBLIC_SENSAY_API_VERSION**: Versão da API (padrão: 2025-05-01)
- **NEXT_PUBLIC_REPLICA_UUID**: UUID da réplica para o chat de clientes
- **ADMIN_PASSWORD**: Senha para acesso ao painel administrativo

### Exemplo de configuração:
```env
NEXT_PUBLIC_SENSAY_API_URL=https://api.sensay.io
NEXT_PUBLIC_SENSAY_ORG_SECRET=sua-chave-secreta-aqui
NEXT_PUBLIC_SENSAY_API_VERSION=2025-05-01
NEXT_PUBLIC_REPLICA_UUID=uuid-da-replica-aqui
ADMIN_PASSWORD=senha-admin-segura
```

## 🤖 Treinamento de IA

### Script de Treinamento de Réplicas

O projeto inclui um script poderoso para criar e treinar as réplicas de IA:

```bash
# Listar tipos disponíveis
npx tsx scripts/train-replicas.ts list-types

# Criar réplica para clientes
npx tsx scripts/train-replicas.ts create client
```

### Configuração da Réplica

Após executar o script de treinamento:

1. **Obtenha o UUID** do arquivo JSON gerado
2. **Atualize** o arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_REPLICA_UUID=uuid-da-replica-cliente
   ```

Para documentação completa do script, veja: [`scripts/README.md`](scripts/README.md)

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **IA**: Sensay AI SDK
- **CLI**: Commander.js para scripts

## 📁 Estrutura do Projeto

```
fitconnect/
├── app/                    # Páginas e layouts (App Router)
│   ├── page.tsx           # Página principal com chat IA
│   ├── admin/             # Painel administrativo
│   ├── api/               # Rotas da API
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
├── sensay-sdk/            # SDK auto-gerado do Sensay
├── scripts/               # Scripts de automação
│   ├── train-replicas.ts  # Script de treinamento
│   └── README.md          # Documentação dos scripts
├── public/                # Arquivos estáticos
└── training-data/         # Dados para treinamento da IA
```

## 🎨 Características do Design

- **Design System**: Paleta de cores azul e moderna
- **Componentes**: Chat interativo com animações suaves
- **Responsivo**: Mobile-first design
- **Acessibilidade**: Foco em UX inclusiva
- **Performance**: Otimizado para Core Web Vitals

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte seu repositório** no Vercel
2. **Configure as variáveis de ambiente**:
   - `SENSAY_ORG_SECRET`: Sua chave da organização Sensay
3. **Deploy automático** a cada push

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código

# Treinamento de IA
npx tsx scripts/train-replicas.ts list-types
npx tsx scripts/train-replicas.ts create client
```

## 📊 Monitoramento

- **Analytics**: Monitore interações no chat
- **Performance**: Core Web Vitals tracking
- **IA Insights**: Dashboard Sensay para métricas da réplica

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: Veja a pasta `docs/` para guias detalhados
- **Issues**: Abra issues no GitHub para bugs e sugestões
- **Discussões**: Use GitHub Discussions para dúvidas gerais

## 🔗 Links Úteis

- [Sensay AI Documentation](https://docs.sensay.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

**Desenvolvido com ❤️ para revolucionar o mercado fitness**
