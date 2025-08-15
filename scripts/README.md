# Script de Treinamento de Réplicas FitConnect

Este script permite criar e treinar réplicas do Sensay AI para o projeto FitConnect.

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Dependências instaladas**:
   ```bash
   npm install commander tsx @types/node
   ```
3. **Chave de API do Sensay** (definida como variável de ambiente ou no código)

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto ou defina a variável de ambiente:

```bash
export SENSAY_ORG_SECRET="sua-chave-da-organizacao-sensay"
```

Se não definir a variável de ambiente, o script usará a chave padrão do código.

## Como Usar

### Executar o Script

```bash
# Tornar o script executável (Linux/Mac)
chmod +x scripts/train-replicas.ts

# Executar com tsx
npx tsx scripts/train-replicas.ts <comando>
```

### Comandos Disponíveis

#### 1. Listar Tipos de Réplicas Disponíveis

```bash
npx tsx scripts/train-replicas.ts list-types
```

Mostra todos os tipos de réplicas pré-configuradas:
- `client`: Assistente para clientes encontrarem personal trainers
- `trainer`: Assistente para personal trainers conseguirem mais alunos

#### 2. Criar uma Réplica Específica

```bash
# Criar réplica para clientes
npx tsx scripts/train-replicas.ts create client

# Criar réplica para personal trainers
npx tsx scripts/train-replicas.ts create trainer
```

#### 3. Criar Ambas as Réplicas

```bash
npx tsx scripts/train-replicas.ts create-both
```

#### 4. Adicionar Dados de Treinamento Personalizados

```bash
# Adicionar textos extras
npx tsx scripts/train-replicas.ts create client --texts "Texto adicional 1" "Texto adicional 2"

# Adicionar arquivos extras
npx tsx scripts/train-replicas.ts create trainer --files "caminho/para/arquivo1.pdf" "caminho/para/arquivo2.txt"

# Combinar textos e arquivos
npx tsx scripts/train-replicas.ts create client \
  --texts "Dados extras sobre fitness" \
  --files "documentos/guia-treino.pdf"
```

## Estrutura das Réplicas

### Réplica Cliente (`client`)

**Objetivo**: Ajudar pessoas a encontrar personal trainers ideais

**Características**:
- Nome: "FitConnect - Assistente para Clientes"
- Focada em entender objetivos fitness
- Identifica preferências de treino
- Faz match com personal trainers adequados
- Linguagem motivadora e acessível

**Dados de Treinamento Incluídos**:
- Tipos de treino (emagrecimento, hipertrofia, funcional, reabilitação)
- Modalidades de atendimento (presencial, online, híbrido)
- Perfis de clientes (iniciante, intermediário, avançado)

### Réplica Personal Trainer (`trainer`)

**Objetivo**: Ajudar personal trainers a conseguir mais alunos e otimizar negócios

**Características**:
- Nome: "FitConnect - Assistente para Personal Trainers"
- Focada em estratégias de negócio
- Orientada para captação e retenção
- Conhecimento em marketing fitness
- Linguagem estratégica e prática

**Dados de Treinamento Incluídos**:
- Estratégias de captação de alunos
- Precificação de serviços
- Técnicas de retenção de clientes
- Marketing digital para fitness

## Saídas do Script

### Arquivos Gerados

Após a criação de cada réplica, o script gera arquivos de configuração:

```
replica-client-config.json
replica-trainer-config.json
```

Cada arquivo contém:
```json
{
  "type": "client",
  "name": "FitConnect - Assistente para Clientes",
  "uuid": "uuid-da-replica-criada",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### UUIDs das Réplicas

Os UUIDs gerados devem ser atualizados no arquivo `app/page.tsx`:

```typescript
const REPLICA_UUIDS = {
  client: 'uuid-da-replica-cliente',
  trainer: 'uuid-da-replica-trainer'
};
```

## Processo de Treinamento

O script executa as seguintes etapas:

1. **Criação da Réplica**
   - Define configurações básicas (nome, tipo, personalidade)
   - Configura modelo de IA (GPT-4o)
   - Define perguntas sugeridas

2. **Upload de Textos de Treinamento**
   - Cria entradas de conhecimento
   - Envia textos pré-definidos
   - Adiciona textos personalizados (se fornecidos)

3. **Upload de Arquivos** (se fornecidos)
   - Obtém URLs assinadas para upload
   - Faz upload dos arquivos especificados
   - Suporta PDFs, DOCX e outros formatos de texto

4. **Finalização**
   - Salva configurações em arquivo JSON
   - Exibe UUID da réplica criada

## Formatos de Arquivo Suportados

Para upload de arquivos de treinamento:
- **PDF** (.pdf)
- **Word** (.docx)
- **Texto** (.txt)
- **Markdown** (.md)
- Outros formatos de texto (até 50MB)

## Exemplos de Uso

### Criar réplica cliente com dados extras

```bash
npx tsx scripts/train-replicas.ts create client \
  --texts "Informações sobre academias parceiras" \
         "Dados sobre planos de saúde que cobrem personal trainer"
```

### Criar réplica trainer com arquivo de estratégias

```bash
npx tsx scripts/train-replicas.ts create trainer \
  --files "docs/estrategias-marketing-fitness.pdf"
```

### Criar ambas com dados personalizados

```bash
npx tsx scripts/train-replicas.ts create-both \
  --texts "Dados específicos da região" \
  --files "docs/manual-empresa.pdf"
```

## Solução de Problemas

### Erro de Autenticação
- Verifique se a variável `SENSAY_ORG_SECRET` está correta
- Confirme se a chave de API tem permissões adequadas

### Erro de Upload de Arquivo
- Verifique se o arquivo existe no caminho especificado
- Confirme se o arquivo não excede 50MB
- Teste com formatos suportados (.pdf, .docx, .txt)

### Erro de Rede
- Verifique conectividade com a internet
- Confirme se o endpoint `https://api.sensay.io` está acessível

### Script Não Executa
- Confirme que o Node.js está instalado (versão 18+)
- Instale as dependências: `npm install commander tsx @types/node`
- Use `npx tsx` em vez de `node` para executar TypeScript

## Próximos Passos

Após criar as réplicas:

1. **Atualizar UUIDs no Frontend**
   - Copie os UUIDs dos arquivos JSON gerados
   - Atualize `REPLICA_UUIDS` em `app/page.tsx`

2. **Testar Integração**
   - Execute o projeto: `npm run dev`
   - Teste os chats nas seções correspondentes
   - Verifique se as respostas estão coerentes

3. **Monitoramento**
   - Acesse o dashboard do Sensay
   - Monitore conversas e performance
   - Ajuste dados de treinamento se necessário

4. **Manutenção**
   - Adicione novos dados de treinamento periodicamente
   - Monitore feedback dos usuários
   - Atualize personalidades conforme necessário 