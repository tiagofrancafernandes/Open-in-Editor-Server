# CLAUDE.md - Instruções para Claude/AI

Instruções específicas para assistentes de IA (Claude, etc) trabalhando neste projeto.

---

## 🎯 Objetivo do Projeto

Servidor HTTP que abre arquivos no editor de código a partir de URLs, com suporte a perfis de projeto e mapeamento automático de caminhos local/remoto.

---

## 📚 Documentação Chave

Consulte estes arquivos PRIMEIRO antes de fazer qualquer mudança:

1. **[README.md](./README.md)** - Overview e instruções de uso
2. **[GUIDE_PROFILES.md](./GUIDE_PROFILES.md)** - Guia prático com exemplos
3. **[PROFILE_ANALYSIS.md](./PROFILE_ANALYSIS.md)** - Análise técnica detalhada
4. **[AGENTS.md](./AGENTS.md)** - Instruções para automação/agentes

---

## 🛠️ Stack Técnico

- **Linguagem**: JavaScript (Node.js ES modules)
- **Runtime**: Node.js 18+
- **Gerenciador**: PM2 (para modo daemon)
- **Configuração**: `app.config.js` (dinâmico)
- **Testes**: Unitários + integração

---

## 📋 Estrutura de Código Principal

### `open-in-editor-server.js`

Arquivo principal com:
- Servidor HTTP via `http` nativo
- Leitura de configuração dinâmica
- Parser de URL e parâmetros
- Mapeamento de caminhos
- Execução de comandos
- Tratamento de erros

**Funções chave**:
- `getFinalConfig()` - Carrega config
- `getProfile(name)` - Obtém perfil
- `getOpenCmd(profile)` - Extrai comando
- `sendResponse()` - Envia resposta HTTP

### `app.config.js`

Configuração com perfis:
- `profiles` - Object com configs por projeto
- `defaultProfile` - Perfil padrão
- `remapSplitStr` - Separador global

**⚠️ NUNCA commitar `app.config.js`** - Use `app.config.demo.js` como exemplo.

### `ecosystem.config.cjs`

Configuração PM2 para modo daemon:
- App script e variáveis de ambiente
- Desenvolvimento vs produção
- Deploy settings

### `package.json`

Scripts NPM:
- `npm run dev` - Desenvolvimento com watch
- `npm run start` - Daemon modo desenvolvimento
- `npm run logs` - Ver logs
- Etc.

---

## 🧪 Testes

### Testes Unitários (`test-profiles.js`)

```bash
node test-profiles.js
```

Valida:
- Estrutura de cada perfil
- Função `getOpenCmd()` com diferentes formatos
- `mapPaths` válidos
- `options` presentes

**Resultado esperado**: ✅ 20/20 testes passando

### Testes de Integração (`test-integration.js`)

```bash
node test-integration.js
```

Simula requisições HTTP reais com:
- Aplicação de perfil
- Mapeamento de caminho
- Modo dry-run
- Fallback para padrão

**Resultado esperado**: ✅ 6/6 cenários funcionais

---

## 🔄 Fluxo de Requisição

```
URL com parâmetros
    ↓
Parse profile (?profile=...)
    ↓
Carregar config de app.config.js
    ↓
Obter dados do perfil
    ↓
Extrair command via getOpenCmd()
    ↓
Mapear caminho (remoto → local)
    ↓
Aplicar options (dryRunMode, etc)
    ↓
Executar comando via exec()
    ↓
Retornar resultado como JSON
```

---

## 🐛 Bugs Conhecidos / Corrigidos

### ✅ Bug Corrigido: Campo `_command`

**Localização**: `open-in-editor-server.js:149`

**Problema**: Tentava acessar `_openCmd?._command` (incorreto)

**Solução**: Mudou para `_openCmd?.command` (correto)

```javascript
// ❌ ANTES
let _command = ifStringOr(_openCmd?._command, '')?.trim();

// ✅ DEPOIS
let _command = ifStringOr(_openCmd?.command, '')?.trim();
```

---

## 📝 Regras de Desenvolvimento

### Commits

- ✅ Escrever commits como se fossem do usuário (sem menção a Claude)
- ✅ Incluir tipo: feat, fix, refactor, test, docs
- ✅ Ser descritivo mas conciso
- ✅ Atualizar `app.config.demo.js` se alterar `app.config.js`

Exemplo:
```
fix: correct field access in getOpenCmd function
```

### Testes

- ✅ SEMPRE rodar testes antes de commitar
- ✅ Testes devem passar 100%
- ✅ Adicionar novos testes para novas features
- ✅ Testar com `&runInfo=1&dryRun=1` para segurança

### Configuração

- ✅ **NUNCA** commitar `app.config.js`
- ✅ Sempre atualizar `app.config.demo.js` em paralelo
- ✅ Documentar mudanças em `PROFILE_ANALYSIS.md` se relevante
- ✅ Validar em `test-profiles.js` antes

### Documentação

- ✅ Manter README.md atualizado
- ✅ Adicionar exemplos em GUIDE_PROFILES.md
- ✅ Documentar decisões técnicas em PROFILE_ANALYSIS.md
- ✅ Usar comentários em código apenas para lógica não óbvia

---

## 🚀 Workflow de Desenvolvimento

### 1. Entender o Contexto

- [ ] Ler README.md
- [ ] Executar `node test-profiles.js`
- [ ] Executar `node test-integration.js`
- [ ] Entender estrutura atual

### 2. Fazer Mudança

- [ ] Fazer alteração no código
- [ ] Adicionar testes se necessário
- [ ] Validar com `&runInfo=1&dryRun=1`
- [ ] Verificar se não quebrou testes existentes

### 3. Documentar

- [ ] Atualizar comentários se necessário
- [ ] Adicionar exemplo em GUIDE_PROFILES.md se relevante
- [ ] Atualizar PROFILE_ANALYSIS.md se aplicável
- [ ] Atualizar app.config.demo.js em paralelo

### 4. Testar Completo

- [ ] `npm run prettier` (formatar)
- [ ] `node test-profiles.js` (unitários)
- [ ] `node test-integration.js` (integração)
- [ ] Testar manualmente com `&runInfo=1&dryRun=1`

### 5. Commitar

- [ ] `git add .`
- [ ] `git commit -m "type: description"`
- [ ] Commit sem menção a Claude

---

## ✨ Checklist para Mudanças

Antes de commitar QUALQUER mudança, responda:

- ✅ Testes passam? (`node test-profiles.js` + `test-integration.js`)
- ✅ Código está formatado? (`npm run prettier`)
- ✅ Documentação está atualizada? (README, GUIDE, ANALYSIS)
- ✅ Se alterei app.config.js, atualizei app.config.demo.js?
- ✅ Commit message não menciona Claude?
- ✅ Testei com `&runInfo=1&dryRun=1`?

Se NÃO para qualquer item acima: **NÃO COMMITAR**

---

## 🔍 Debug e Investigação

### Executar com Debug

```bash
# Ver informações de execução
URL?profile=...&file=...&runInfo=1&dryRun=1
```

Isso retorna JSON com:
- Comando que seria executado
- Caminho mapeado
- Todas as configurações aplicadas
- Mensagens de erro

### Ver Logs do Servidor

```bash
npm run logs
```

### Testar Comando Manualmente

```bash
# Ver o comando que seria executado
URL?profile=...&file=...&runInfo=1&dryRun=1

# Depois execute manualmente:
code -g "/path/to/file.js:10:5"
```

---

## 🎯 Issues Comuns e Soluções

### Perfil não carrega

1. Verifique que `app.config.js` existe
2. Execute `node -e "import('./app.config.js').then(c => console.log(c.profiles))"`
3. Use `&runInfo=1` para ver qual perfil foi usado

### Caminho não mapeia

1. Verifique `mapPaths` em `app.config.js`
2. Use `&runInfo=1` para ver mapeamento real
3. Certifique que local/remote correspondem ao arquivo

### Comando não executa

1. Teste comando manualmente: `code -g "/path/to/file.js:10:5"`
2. Verifique que editor está instalado
3. Use `&runInfo=1` para ver comando gerado

---

## 🤔 Decisões de Design

### Por que PM2?

- Modo daemon fácil
- Auto-restart em crash
- Persistência após reboot
- Log management
- Alternativa: systemd, docker

### Por que app.config.js dinâmico?

- Permite múltiplos perfis
- Sem hardcode de configs
- Fácil de alterar sem rebuildar
- Não precisa de reinicialização após mudança (recarrega)

### Por que URL parameters têm precedência?

- Máxima flexibilidade
- Pode sobrescrever perfil quando necessário
- Não quebra workflow existente

### Por que dryRunMode força execução?

- Proteção para produção
- Evita acidentes
- Quando habilitado no perfil, é intencional

---

## 📊 Métricas e Performance

- **Startup**: ~100ms
- **Request handling**: ~5-50ms (depende do mapeamento)
- **Configuração loading**: ~10-20ms (primeira vez)

---

## 🔐 Considerações de Segurança

- ✅ Input validation em comandos
- ✅ Proteção de dryRunMode em perfis sensíveis
- ✅ Tratamento de erros robusto
- ✅ Log de todas as execuções (quando runInfo=1)

Para produção:
- Considere adicionar autenticação
- Valide perfis contra whitelist
- Monitore logs regularmente

---

## 🚨 Antes de Fazer Mudanças Grandes

Se vai fazer mudanças significativas:

1. **Crie branch feature**: `git checkout -b feature/description`
2. **Discuta arquitetura**: Veja PROFILE_ANALYSIS.md
3. **Rodar testes completos**: `test-profiles.js` + `test-integration.js`
4. **Documenta decisão**: Adicione comentário em PROFILE_ANALYSIS.md
5. **Crie testes novos**: Para validar nova funcionalidade

---

## ✅ Checklist Final

Sempre antes de finalizar uma tarefa:

- ✅ Li README.md?
- ✅ Li GUIDE_PROFILES.md?
- ✅ Li PROFILE_ANALYSIS.md?
- ✅ Rodei testes?
- ✅ Testei com &runInfo=1&dryRun=1?
- ✅ Atualizei documentação?
- ✅ Commit não menciona Claude?
- ✅ app.config.demo.js foi atualizado?

Se NÃO: volta e completa ANTES de considerar feito.

---

## 📞 Suporte para Claude/AI

Quando trabalhando neste projeto:

1. SEMPRE ler os 3 arquivos de doc principais
2. SEMPRE rodar testes antes de finalizar
3. SEMPRE testar com ?runInfo=1&dryRun=1
4. NUNCA commitar app.config.js
5. NUNCA mencionar Claude em commits
6. NUNCA pular documentação

Se não tiver certeza: **pergunte ao usuário antes de mudar**.

---

Boa desenvolvimento! 🚀
