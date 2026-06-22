# Guia Prático: Usando Perfis no Open-in-Editor-Server

> **📖 Disponível em outros idiomas:** [English](./GUIDE_PROFILES.md)

> **📚 Veja também:** [README.pt-br.md](./README.pt-br.md) - Documentação completa

## 🎯 Objetivo

Este guia mostra como usar efetivamente o sistema de perfis para abrir arquivos em diferentes editors com mapeamento automático de caminhos.

---

## 📖 O Que É Um Perfil?

Um perfil é um conjunto de configurações que define:
- **Qual editor** abrir (VS Code, Vim, Antigravity, etc)
- **Como mapear caminhos** de desenvolvimento/produção
- **Opções especiais** como modo dry-run

---

## 🚀 Guia Rápido de Uso

### 1️⃣ Usar um Perfil Existente

**URL**:
```
http://localhost:3001/__open-in-editor?profile=my-project-2&file=/var/www/projects/my-second-project/app.js:10:5
```

**O que acontece**:
1. Busca configuração de `my-project-2`
2. Extrai editor: `code -g`
3. Mapeia `/var/www/...` → `/my-projects/my-project-2-apps/app.js`
4. Abre em VS Code no arquivo e linha corretos

### 2️⃣ Criar um Novo Perfil

**Arquivo**: `app.config.js`

```javascript
export const profiles = {
    // ... perfis existentes ...

    'meu-projeto': {
        open_cmd: {
            command: 'code',
            args: ['-g']
        },
        mapPaths: {
            local: '/home/usuario/projetos/meu-projeto',
            remote: '/var/www/html/meu-projeto'
        },
        options: {
            dryRunMode: false,
            runInfo: false,
        },
    },
};
```

**Depois usar**:
```
?profile=meu-projeto&file=/var/www/html/meu-projeto/src/index.js:1:1
```

### 3️⃣ Sobrescrever Configuração do Perfil

A URL sempre tem prioridade:

```
?profile=my-project-2&open_cmd=vim&file=/var/www/...
```

Aqui o perfil é usado para mapPaths, mas o editor é forçado para `vim`.

---

## 📋 Exemplos Práticos

### Exemplo 1: Projeto Vue.js em Produção

**Cenário**:
- Servidor remoto: `/var/www/vue-app`
- Máquina local: `/home/dev/projects/vue-app`
- Editor: VS Code

**Perfil em `app.config.js`**:
```javascript
'vue-app-prod': {
    open_cmd: {
        command: 'code',
        args: ['-g']
    },
    mapPaths: {
        local: '/home/dev/projects/vue-app',
        remote: '/var/www/vue-app'
    },
    options: {
        dryRunMode: false,  // Modo real para produção
        runInfo: false,
    },
}
```

**URL de erro do console do navegador**:
```
http://localhost:3001/__open-in-editor?profile=vue-app-prod&file=/var/www/vue-app/src/components/Button.vue:42:15
```

**Resultado**: Abre `Button.vue` na linha 42, coluna 15 em VS Code

---

### Exemplo 2: Projeto Laravel com Editor Antigravity

**Cenário**:
- Servidor remoto: `/var/www/laravel-app`
- Máquina local: `/home/dev/projects/laravel-app`
- Editor: Antigravity

**Perfil**:
```javascript
'laravel-app': {
    open_cmd: {
        command: 'antigravity',
        args: ['-g']
    },
    mapPaths: {
        local: '/home/dev/projects/laravel-app',
        remote: '/var/www/laravel-app'
    },
    options: {
        dryRunMode: false,
        runInfo: false,
    },
}
```

**URL**:
```
?profile=laravel-app&file=/var/www/laravel-app/app/Http/Controllers/PostController.php:15:20
```

---

### Exemplo 3: Projeto Windows (IIS)

**Cenário**:
- Servidor remoto: `C:\inetpub\wwwroot\app`
- Máquina local: `D:\projetos\meu-app`
- Separador: `=>` (porque usa backslash no Windows)

**Perfil**:
```javascript
'windows-iis-app': {
    open_cmd: {
        command: 'code',
        args: ['-g']
    },
    mapPaths: {
        local: 'D:\\projetos\\meu-app',
        remote: 'C:\\inetpub\\wwwroot\\app'
    },
    options: {
        remapSplitStr: '=>',
        dryRunMode: false,
        runInfo: false,
    },
}
```

**URL**:
```
?profile=windows-iis-app&file=C:\inetpub\wwwroot\app\Controllers\Home.cs:25:10
```

---

### Exemplo 4: Modo Dry-Run (Seguro para Produção)

**Cenário**: Você quer testar URLs sem realmente abrir o editor

**Perfil com proteção**:
```javascript
'producao-segura': {
    open_cmd: {
        command: 'code',
        args: ['-g']
    },
    mapPaths: {
        local: '/home/dev/projects/prod-app',
        remote: '/var/www/prod-app'
    },
    options: {
        dryRunMode: true,  // 🔒 Força modo dry-run!
        runInfo: true,     // Mostra informações
    },
}
```

**URL**:
```
?profile=producao-segura&file=/var/www/prod-app/main.py:100:5
```

**Resultado**:
- Mostra o comando que SERIA executado
- Não abre o editor de verdade
- Útil para testar antes

---

## 🔄 Fluxo Detalhado

Quando você faz uma requisição com perfil:

```
1. URL: ?profile=my-project-2&file=/var/www/projects/my-second-project/app.js:10:5
   ↓
2. Servidor lê: profile = 'my-project-2'
   ↓
3. Busca em app.config.js:
   - open_cmd: { command: 'code', args: ['-g'] }
   - mapPaths.local: '/my-projects/my-project-2-apps'
   - mapPaths.remote: '/var/www/projects/my-second-project'
   ↓
4. Mapeia o caminho:
   '/var/www/projects/my-second-project/app.js'
   → '/my-projects/my-project-2-apps/app.js'
   ↓
5. Extrai linha e coluna: 10:5
   ↓
6. Monta comando:
   code -g "/my-projects/my-project-2-apps/app.js:10:5"
   ↓
7. Executa o comando → Abre em VS Code!
```

---

## 💡 Casos de Uso Reais

### Caso 1: Stack Trace em Produção

Você vê um erro em produção:
```
Error at /var/www/app/src/User.php:45:12
```

Em vez de procurar manualmente, clique no link:
```html
<a href="http://localhost:3001/__open-in-editor?profile=my-app&file=/var/www/app/src/User.php:45:12">
    Abrir em Editor
</a>
```

### Caso 2: Debug em Desenvolvimento

Seu framework gera um link de erro interativo:
```
XDebug: /var/www/laravel-app/app/Http/Controllers/OrderController.php:89:5
```

Configure seu app para gerar URLs assim:
```
xdebug.file_link_format = "http://localhost:3001/__open-in-editor?profile=laravel-app&file=%f:%l:%c"
```

### Caso 3: Links em Logs

Seu sistema de logging pode gerar links clicáveis:
```javascript
// Em seu logger
const editorLink = `http://localhost:3001/__open-in-editor?profile=my-app&file=${file}:${line}:${col}`;
log(`Erro: ${message} ${editorLink}`);
```

---

## ⚙️ Variáveis de Ambiente

Se preferir não usar `app.config.js`, pode usar variáveis:

```bash
export EDITOR_OPEN_CMD="code -g"
export LISTEN_PORT=3001
export LISTEN_HOST=0.0.0.0
export REMAP_SPLIT_STR=":"

node open-in-editor-server.js
```

Mas **recomendamos** usar `app.config.js` para melhor controle.

---

## 🎯 Debug & Troubleshooting

### Ver Informações de Execução

Adicione `&runInfo=1` à URL:

```
?profile=my-project-2&file=/var/www/.../app.js:10:5&runInfo=1
```

**Retorna JSON com**:
- Comando executado
- Caminho mapeado
- Configurações aplicadas
- Mensagens de erro

### Modo Dry-Run (Sem Executar)

```
?profile=my-project-2&file=/var/www/.../app.js:10:5&dryRun=1
```

Mostra o que SERIA executado sem executar de verdade.

### Checar Mapeamento de Caminho

Use `&runInfo=1` para ver:
```json
{
    "appBasePathRemoteMap": {
        "remote": "/var/www/projects/my-second-project",
        "local": "/my-projects/my-project-2-apps"
    },
    "mappedPath": "/my-projects/my-project-2-apps/app.js"
}
```

---

## 📝 Checklist de Configuração

Ao criar um novo perfil, verifique:

- ✅ Nome do perfil é único
- ✅ Editor existe no sistema (`code`, `vim`, etc)
- ✅ Caminhos local e remoto estão corretos
- ✅ Separador está certo (`:` para Linux/Mac, `=>` para Windows)
- ✅ `dryRunMode` reflete intenção (proteção vs velocidade)
- ✅ `runInfo` ajuda no debug se necessário

---

## 🚨 Erros Comuns

### ❌ "Invalid file or missing file param"

**Causa**: Caminho não mapeado corretamente

**Solução**:
```
// Verifique que arquivo existe:
// Local: /my-projects/my-project-2-apps/app.js
// URL Remote: /var/www/projects/my-second-project/app.js
```

### ❌ "Error opening editor"

**Causa**: Editor não está instalado/configurado

**Solução**:
```bash
# Teste o comando manualmente
code -g "/path/to/file.js:10:5"

# Se não funcionar, ajuste a configuração
```

### ❌ Caminho não mapeado

**Causa**: `mapPaths` não corresponde ao arquivo

**Solução**:
```
Use &runInfo=1 para ver o mapeamento real
Ajuste mapPaths.remote para corresponder ao arquivo
```

---

## ✨ Dicas Profissionais

1. **Automatize em seu Framework**
   - Laravel: Configure `xdebug.file_link_format`
   - Vue: Adicione plugin para gerar links
   - Node: Use middleware para interceptar erros

2. **Crie Perfis por Ambiente**
   - `my-app-dev`, `my-app-staging`, `my-app-prod`
   - Cada um com sua configuração

3. **Proteja Produção**
   - Perfil produção: `dryRunMode: true`
   - Só use `false` para desenvolvimento

4. **Use Links Dinâmicos**
   - Encode a URL corretamente
   - Teste com `&runInfo=1` primeiro

---

## 🎓 Próximos Passos

1. Crie seus perfis em `app.config.js`
2. Teste com `&runInfo=1&dryRun=1` primeiro
3. Integre com seu framework/logger
4. Aproveite a produtividade! 🚀

---

**Dúvidas?** Veja `PROFILE_ANALYSIS.md` para detalhes técnicos.

**Quer mais detalhes?** Leia [README.pt-br.md](./README.pt-br.md) para documentação completa, incluindo instruções de setup e exemplos de integração.
