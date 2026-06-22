# Open in Editor Server

Um servidor HTTP que facilita abrir arquivos no seu editor de código diretamente a partir de URLs, com suporte a mapeamento de caminhos local/remoto e perfis de projeto.

## 🎯 O Que Faz?

Transforma uma URL como:
```
http://localhost:3001/__open-in-editor?profile=my-app&file=/var/www/app/index.js:10:5
```

Em um comando real:
```bash
code -g "/home/dev/projects/my-app/index.js:10:5"
```

Perfeito para:
- ✅ Stack traces clicáveis em produção
- ✅ Links de erro em logs
- ✅ XDebug/PHPStorm integrados
- ✅ Múltiplos projetos com mapeamento automático

---

## 📋 Requisitos

- **Node.js** 18+ (com suporte a ES modules)
- **PM2** para modo daemon (automático com `npm install`)

```bash
# Verificar versão do Node
node --version  # v18.0.0 ou superior
```

---

## 🚀 Instalação

### 1. Clonar/Copiar o Repositório

```bash
git clone <seu-repo> open-in-editor-server
cd open-in-editor-server
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar o Projeto

Crie `app.config.js` baseado em `app.config.demo.js`:

```bash
cp app.config.demo.js app.config.js
```

Edite `app.config.js` com seus projetos:

```javascript
export const profiles = {
    'meu-projeto': {
        open_cmd: {
            command: 'code',
            args: ['-g']
        },
        mapPaths: {
            local: '/home/usuario/projetos/meu-projeto',
            remote: '/var/www/meu-projeto'
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
};

export const defaultProfile = 'meu-projeto';
export const remapSplitStr = ':';  // use '=>' no Windows
```

---

## 🎬 Como Usar

### Modo Desenvolvimento (com Watch)

Ideal para desenvolvimento local com recarregamento automático:

```bash
npm run dev
```

**Features**:
- ✅ Recarrega automaticamente ao mudar código
- ✅ Sem daemon (fácil de parar com Ctrl+C)
- ✅ Saída de log em tempo real
- ✅ Útil para debug

### Modo Desenvolvimento (sem Watch)

Se preferir sem recarregamento automático:

```bash
npm run dev:no-watch
```

### Modo Produção (Daemon com PM2)

Para manter o servidor rodando em background:

```bash
# Iniciar em desenvolvimento
npm run start

# Ou iniciar em produção (com configurações prod)
npm run start:prod
```

**Features**:
- ✅ Roda como daemon (background)
- ✅ Persiste após reboot
- ✅ Auto-restart em caso de crash
- ✅ Gerenciamento via PM2
- ✅ Recomendado para produção

### Gerenciar o Daemon

```bash
# Ver status
npm run status

# Ver logs em tempo real
npm run logs

# Reiniciar
npm run restart

# Parar
npm run stop
```

---

## ⚙️ Configuração

### Arquivo: `app.config.js`

Este arquivo define todos os perfis do seu projeto. **Sempre que alterar, também atualize `app.config.demo.js`**:

```bash
# 1. Altere app.config.js conforme necessário
# 2. Atualize app.config.demo.js com as mesmas mudanças
cp app.config.js app.config.demo.js
```

#### Estrutura Completa de um Perfil

```javascript
export const profiles = {
    'my-project': {
        // Editor a usar
        open_cmd: {
            command: 'code',      // Comando do editor
            args: ['-g']          // Argumentos (opcional)
        },

        // Mapeamento de caminhos
        mapPaths: {
            local: '/home/dev/projects/my-project',  // Seu caminho local
            remote: '/var/www/my-project'             // Caminho remoto/container
        },

        // Opções específicas do perfil
        options: {
            dryRunMode: false,           // Forçar modo dry-run (sem executar)
            runInfo: false,              // Mostrar informações de execução
            remapSplitStr: ':'           // Separador para paths (linux)
                                         // Use '=>' para Windows
        },
    },
};

// Perfil padrão se nenhum for especificado
export const defaultProfile = 'my-project';

// Separador global (se não definido no perfil)
export const remapSplitStr = ':';  // ':' para Linux/Mac, '=>' para Windows
```

### Variáveis de Ambiente

Alternativa/complemento ao `app.config.js`:

```bash
# Editor padrão
export EDITOR_OPEN_CMD="code -g"

# Porta e host
export LISTEN_PORT=3001
export LISTEN_HOST=0.0.0.0

# Modo dry-run (teste sem executar)
export DRY_RUN_MODE=false

# Separador de path
export REMAP_SPLIT_STR=":"

# Iniciar servidor
npm run dev
```

**Prioridade**:
1. URL parameters (`?file=...`)
2. Profile config (`app.config.js`)
3. Environment variables
4. Default values

---

## 📖 Exemplos de Uso

### Exemplo 1: VS Code com Projeto Vue

```javascript
// app.config.js
'vue-app': {
    open_cmd: { command: 'code', args: ['-g'] },
    mapPaths: {
        local: '/home/dev/projects/vue-app',
        remote: '/var/www/vue-app'
    },
}
```

URL:
```
http://localhost:3001/__open-in-editor?profile=vue-app&file=/var/www/vue-app/src/App.vue:42:10
```

### Exemplo 2: Antigravity com Projeto Laravel

```javascript
// app.config.js
'laravel-app': {
    open_cmd: { command: 'antigravity', args: ['-g'] },
    mapPaths: {
        local: '/home/dev/projects/laravel-app',
        remote: '/var/www/laravel-app'
    },
}
```

URL:
```
?profile=laravel-app&file=/var/www/laravel-app/app/Http/Controllers/PostController.php:15:20
```

### Exemplo 3: Projeto Windows (IIS)

```javascript
// app.config.js
'windows-app': {
    open_cmd: { command: 'code', args: ['-g'] },
    mapPaths: {
        local: 'D:\\projetos\\windows-app',
        remote: 'C:\\inetpub\\wwwroot\\app'
    },
    options: {
        remapSplitStr: '=>'  // Para Windows
    },
}
```

### Exemplo 4: Modo Protegido para Produção

```javascript
// app.config.js
'prod-app': {
    open_cmd: { command: 'code', args: ['-g'] },
    mapPaths: {
        local: '/home/prod/apps/my-app',
        remote: '/var/www/my-app'
    },
    options: {
        dryRunMode: true,  // 🔒 Força modo dry-run!
        runInfo: true,     // Mostra o comando sem executar
    },
}
```

---

## 🔗 Integrando com Seu Projeto

### Com Laravel (XDebug)

Adicione em `php.ini` ou `.env`:

```ini
xdebug.file_link_format = "http://localhost:3001/__open-in-editor?profile=my-app&file=%f:%l:%c"
```

### Com Vue/Nuxt

Em seu middleware ou error handler:

```javascript
const editorLink = `http://localhost:3001/__open-in-editor?profile=my-app&file=${file}:${line}:${col}`;
console.log(`Error: ${message} ${editorLink}`);
```

### Com Node/Express

No seu error handler:

```javascript
app.use((err, req, res, next) => {
    const file = err.stack.match(/\((.+?):(\d+):/)?.[1] || 'unknown';
    const line = err.stack.match(/:(\d+):/)?.[1] || 1;
    const editorLink = `http://localhost:3001/__open-in-editor?profile=my-app&file=${file}:${line}`;

    res.render('error', { error: err, editorLink });
});
```

---

## 🐛 Debug e Troubleshooting

### Ver Informações de Execução

Adicione `&runInfo=1` para ver detalhes:

```
?profile=my-app&file=/var/www/my-app/app.js:10:5&runInfo=1
```

Retorna JSON com:
- Comando que será/foi executado
- Caminho mapeado
- Todas as configurações aplicadas

### Modo Dry-Run (Teste sem Executar)

```
?profile=my-app&file=/var/www/my-app/app.js:10:5&dryRun=1
```

Mostra o comando sem executar de verdade.

### Verificar Logs do Servidor

```bash
# Em tempo real
npm run logs

# Ou ver status
npm run status
```

### Problemas Comuns

#### "Invalid file or missing file param"
- Verifique que o arquivo existe no caminho mapeado
- Use `&runInfo=1` para ver o mapeamento real

#### "Error opening editor"
- Verifique que o editor está instalado: `which code`, `which antigravity`
- Teste o comando manualmente: `code -g "/path/to/file.js:10:5"`

#### Perfil não encontrado
- Use `&runInfo=1` para ver qual perfil foi usado
- Verifique o nome do perfil em `app.config.js`

---

## 📁 Estrutura do Projeto

```
open-in-editor-server/
├── open-in-editor-server.js      # Servidor principal
├── app.config.js                 # Configuração (NÃO commitar no git)
├── app.config.demo.js            # Exemplo de configuração
├── ecosystem.config.cjs          # Config PM2
├── package.json                  # Scripts e dependências
├── package-lock.json             # Lock file
├── README.md                      # Este arquivo
├── GUIDE_PROFILES.md             # Guia prático de perfis
├── PROFILE_ANALYSIS.md           # Análise técnica
├── test-profiles.js              # Testes unitários
├── test-integration.js           # Testes de integração
└── .gitignore                    # Ignora app.config.js
```

---

## 📝 Arquivo `.gitignore`

Certifique-se que `app.config.js` está ignorado:

```gitignore
# Configuration (sempre ignorar!)
app.config.js

# Dependencies
node_modules/

# PM2 logs
logs/

# OS files
.DS_Store
```

---

## 🚀 Workflow Recomendado

### 1. Setup Inicial

```bash
git clone <repo>
cd open-in-editor-server
npm install
cp app.config.demo.js app.config.js
# Edite app.config.js com seus dados
```

### 2. Desenvolvimento Local

```bash
npm run dev
# Servidor com watch: http://localhost:3001
```

### 3. Testar Antes de Commitar

```bash
npm run prettier  # Formatar código
# Testar URLs com &runInfo=1&dryRun=1
```

### 4. Deploy em Produção

```bash
# Via PM2
npm run start:prod

# Ver status
npm run status

# Ver logs
npm run logs
```

### 5. Manutenção

```bash
# Quando atualizar app.config.js, também atualize demo:
cp app.config.js app.config.demo.js
git add app.config.demo.js
git commit -m "refactor: update config demo"
```

---

## 📚 Documentação Adicional

- **[GUIDE_PROFILES.md](./GUIDE_PROFILES.md)** - Guia prático com exemplos reais
- **[PROFILE_ANALYSIS.md](./PROFILE_ANALYSIS.md)** - Análise técnica da implementação
- **[CLAUDE.md](./CLAUDE.md)** - Instruções para AI/Claude
- **[AGENT.md](./AGENT.md)** - Instruções para automação

---

## 🔐 Segurança

### ⚠️ Importante para Produção

1. **Sempre use `dryRunMode: true` para produção**
   ```javascript
   'prod-app': {
       options: { dryRunMode: true }  // Protege contra execução acidental
   }
   ```

2. **Não commitar `app.config.js`**
   - Adicione ao `.gitignore`
   - Use `app.config.demo.js` como exemplo

3. **Validar permissões de acesso**
   - Considere adicionar autenticação se público
   - Use firewall para restringir acesso

4. **Monitorar logs**
   - Verifique logs regularmente com `npm run logs`
   - Alerte sobre erros anormais

---

## 🤝 Contributing

1. Faça suas mudanças em uma branch
2. Rode os testes: `node test-profiles.js` e `node test-integration.js`
3. Formate o código: `npm run prettier`
4. Se alterar `app.config.js`, atualize `app.config.demo.js`
5. Commit com mensagem descritiva

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique este README
2. Veja [GUIDE_PROFILES.md](./GUIDE_PROFILES.md)
3. Execute com `&runInfo=1` para debug
4. Verifique os logs com `npm run logs`

---

## 📄 Licença

Veja LICENSE file (se aplicável)

---

## 🎉 Pronto!

Seu servidor está configurado e pronto para usar. Comece com:

```bash
npm run dev
# Acesse: http://localhost:3001/__open-in-editor?profile=seu-perfil&file=/path/to/file.js:10:5
```

Boa codificação! 🚀
