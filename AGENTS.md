# AGENT.md - Instruções para Agentes e Automação

Instruções para agentes, bots e sistemas de automação trabalhando neste projeto.

---

## 🤖 O Que Faz Este Projeto?

Servidor HTTP que mapeia URLs para comando de abrir arquivo no editor:

```
URL: http://localhost:3001/__open-in-editor?profile=app&file=/path/to/file.js:10:5
 ↓
Ação: code -g "/local/path/to/file.js:10:5"
```

---

## 📋 Checklist de Tarefas Comuns

### Deploy/Setup

- [ ] `npm install` - Instalar dependências
- [ ] `cp app.config.demo.js app.config.js` - Criar config
- [ ] Editar `app.config.js` com dados reais
- [ ] `npm run dev` ou `npm run start:prod`
- [ ] Testar: `curl "http://localhost:3001/...?profile=test&file=...&runInfo=1&dryRun=1"`

### Adicionar Novo Perfil

```javascript
// Em app.config.js
export const profiles = {
    // ... existentes ...
    'novo-projeto': {
        open_cmd: { command: 'code', args: ['-g'] },
        mapPaths: { local: '/local/path', remote: '/remote/path' },
        options: { dryRunMode: false, runInfo: false },
    },
};
```

- [ ] Editar `app.config.js`
- [ ] Copiar para `app.config.demo.js`
- [ ] Testar com `?profile=novo-projeto&file=...&runInfo=1&dryRun=1`
- [ ] Commit mudanças no demo

### Atualizar Configuração

- [ ] Editar `app.config.js`
- [ ] Rodar `npm run prettier`
- [ ] Testar: `node test-profiles.js` + `node test-integration.js`
- [ ] Copiar para `app.config.demo.js`
- [ ] Commit se tudo passar

### Troubleshooting

- [ ] Checar logs: `npm run logs`
- [ ] Testar com `&runInfo=1&dryRun=1`
- [ ] Rodar testes: `node test-profiles.js`
- [ ] Verificar que editor existe: `which code` / `which antigravity`

---

## 🔗 Endpoints Chave

### Abrir arquivo

```
GET /__open-in-editor?profile=APP&file=PATH:LINE:COL&runInfo=1&dryRun=1
```

**Parâmetros**:
- `profile` (required) - Nome do perfil
- `file` (required) - Caminho remoto com linha e coluna
- `runInfo` (optional) - 1 = show info, 0 = hide
- `dryRun` (optional) - 1 = não execute, 0 = execute
- `open_cmd` (optional) - Sobrescrever editor

**Resposta**: JSON com resultado

---

## 🧪 Testes Automatizados

### Rodar testes

```bash
npm install
node test-profiles.js      # Testes unitários
node test-integration.js   # Testes integração
```

**Esperado**: ✅ Todos passando

### Integração com CI/CD

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run prettier
      - run: node test-profiles.js
      - run: node test-integration.js
```

---

## 🚀 Deployment

### Desenvolvimento

```bash
npm run dev           # Com watch
npm run dev:no-watch  # Sem watch
```

### Produção (PM2)

```bash
npm run start         # Modo dev via PM2
npm run start:prod    # Modo prod via PM2
npm run logs          # Ver logs
npm run stop          # Parar
npm run restart       # Reiniciar
```

---

## 📊 Configuração Estrutura

```javascript
// app.config.js
export const serverConfig = {
    // Porta e host
    LISTEN_PORT: 3001,
    LISTEN_HOST: '0.0.0.0',

    // Defaults
    EDITOR_OPEN_CMD: 'code -g',
    REMAP_SPLIT_STR: ':',

    // Mode
    DRY_RUN_MODE: false,
};

export const profiles = {
    'project-name': {
        open_cmd: { command: 'code', args: ['-g'] },
        mapPaths: { local: '/local', remote: '/remote' },
        options: { dryRunMode: false, runInfo: false },
    },
};

export const defaultProfile = 'project-name';
```

---

## 🔄 Workflow de CI/CD

1. **Pull Request**: Testes devem passar
2. **Merge**: Build + deploy
3. **Production**: PM2 reload

```bash
# Pre-deploy
npm install
node test-profiles.js
node test-integration.js

# Deploy
pm2 start ecosystem.config.cjs --env production
```

---

## 📈 Monitoramento

### Logs

```bash
npm run logs
```

Monitore erros:
- "Invalid file"
- "Error opening editor"
- Path mapping issues

### Metrics

Rastreie:
- Quantidade de requisições
- Perfis mais usados
- Erros por tipo
- Tempo de resposta

```javascript
// Adicionar ao servidor:
const requestCount = {};
const errorCount = {};

// Log cada requisição
console.log(`${profile} | ${file} | ${statusCode}`);
```

---

## 🐛 Debugging Programático

### Testar via HTTP

```bash
curl -s "http://localhost:3001/__open-in-editor?profile=test&file=/path:1:1&runInfo=1&dryRun=1" | jq
```

### Testar via Node

```javascript
import { spawn } from 'child_process';

const proc = spawn('node', ['open-in-editor-server.js'], {
    env: { LISTEN_PORT: 3001, LISTEN_HOST: 'localhost' }
});

// Depois testar via HTTP...
```

---

## 📝 Convenções de Código

### Nomes de Perfil

- ✅ kebab-case: `my-project`, `vue-app`
- ❌ camelCase: `myProject`
- ❌ UPPERCASE: `MY_PROJECT`

### Estrutura de Diretório

```
.
├── open-in-editor-server.js  # Servidor
├── app.config.js             # Config (não commitar)
├── app.config.demo.js        # Demo (commitar)
├── default.config.js         # Defaults (commitar)
├── ecosystem.config.cjs      # PM2 (commitar)
├── package.json              # Scripts (commitar)
├── test-*.js                 # Testes (commitar)
└── README.md, *.md           # Docs (commitar)
```

### Commits

```
fix: description          # Bug fix
feat: description         # Nova feature
refactor: description     # Refatoração
test: description         # Novo teste
docs: description         # Documentação
```

---

## ✅ Validação de Qualidade

### Antes de Commit

```bash
npm run prettier     # Format
node test-profiles.js
node test-integration.js
```

### Antes de Deploy

```bash
npm install
npm run prettier
node test-profiles.js
node test-integration.js
npm run start        # Test start
npm run stop
```

---

## 🔐 Segurança

### Validações

- ✅ Profile exists?
- ✅ File path valid?
- ✅ Command safe?
- ✅ dryRunMode respected?

### Produção

- ✅ `dryRunMode: true` para prod
- ✅ Autenticação recomendada
- ✅ Firewall para restringir acesso
- ✅ Monitore logs regularmente

---

## 🚨 Falhas Conhecidas e Tratamento

### Profile não encontrado

```json
{
    "profile": "inexistente",
    "result": "Usar config padrão ou erro"
}
```

**Ação**: Log e notificar

### Arquivo não mapeado

```json
{
    "statusCode": 400,
    "message": "Invalid file or missing file param"
}
```

**Ação**: Validar mapPaths, usar runInfo=1

### Editor não disponível

```json
{
    "statusCode": 500,
    "error": "ENOENT: no such file or directory"
}
```

**Ação**: Verificar editor, validar comando

---

## 📊 Health Checks

### Status do Servidor

```bash
curl http://localhost:3001/
# Deve retornar algo ou erro HTTP
```

### Teste de Profile

```bash
curl "http://localhost:3001/__open-in-editor?profile=test&file=/tmp/test.js:1:1&runInfo=1&dryRun=1" | jq
```

### Teste de Comando

```bash
npm run status
```

---

## 🔄 Automação Exemplo

### Script de Deploy

```bash
#!/bin/bash
set -e

# Setup
npm install
npm run prettier

# Test
node test-profiles.js
node test-integration.js

# Deploy
pm2 start ecosystem.config.cjs --env production --update-env

# Verify
npm run status
npm run logs | head -20

echo "✅ Deploy complete"
```

### Script de Rollback

```bash
#!/bin/bash
# Volta para versão anterior
git checkout HEAD~1 app.config.js
pm2 restart all
npm run logs
```

---

## 📞 Eventos para Monitorar

- ✅ Servidor inicializado
- ✅ Perfil carregado
- ✅ Comando executado
- ✅ Erro em mapeamento
- ✅ Erro em comando
- ✅ dryRunMode ativado

---

## 🎯 Automação com GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main, develop]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm install
      - run: npm run prettier
      - run: node test-profiles.js
      - run: node test-integration.js
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: |
          # Deploy steps aqui
          echo "Deploying..."
```

---

## 📋 Checklist de Health

- [ ] Servidor respondendo?
- [ ] Testes passando?
- [ ] Configs sincronizadas (app.config.js ↔ app.config.demo.js)?
- [ ] PM2 rodando (se daemon)?
- [ ] Logs sem erros?
- [ ] Perfis carregam?
- [ ] Mapeamento funciona?
- [ ] Editor disponível?

Se qualquer item ❌: investigar logs e corrigir antes de produção.

---

## 🚀 Quick Reference

| Task | Command |
|------|---------|
| Install | `npm install` |
| Setup | `cp app.config.demo.js app.config.js` |
| Dev | `npm run dev` |
| Test | `node test-profiles.js` |
| Deploy | `npm run start:prod` |
| Logs | `npm run logs` |
| Stop | `npm run stop` |
| Status | `npm run status` |

---

Bom desenvolvimento! 🤖
