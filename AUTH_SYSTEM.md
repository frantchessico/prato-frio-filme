# 🔐 Sistema de Autenticação JWT - Prato Frio

## 📋 Visão Geral

Sistema de autenticação JWT implementado para controlar o acesso ao filme "Prato Frio" com restrição de 12 minutos para usuários não autenticados.

## 🎯 Funcionalidades

### ✅ **Acesso Livre (Primeiros 12 minutos)**
- Visitantes podem assistir livremente até o minuto 12
- Indicador visual de tempo restante
- Player funciona normalmente

### 🔒 **Restrição Após 12 Minutos**
- Player pausa automaticamente
- Modal de autenticação aparece com duas opções:
  - **"Já Apoiei"** → Formulário de login
  - **"Apoiar Agora"** → Formulário de registro

### 🎬 **Acesso Completo (Usuários Autenticados)**
- Assistir ao filme na íntegra
- Sem interrupções
- Token JWT válido por 7 dias

## 🏗️ Arquitetura

### **Contextos**
- `AuthContext` - Gerenciamento de estado de autenticação
- `PlayerContext` - Controle de players múltiplos

### **APIs**
- `POST /api/auth/register` - Criação de conta
- `POST /api/auth/login` - Autenticação

### **Componentes**
- `AuthModal` - Modal de login/registro
- `TimeIndicator` - Indicador de tempo restante
- `WatchSection` - Player principal com restrições

## 📝 Campos de Registro

### **Campos Obrigatórios:**
- **Telefone** - Identificador principal do usuário
- **Primeiro Nome** - Nome do usuário
- **Último Nome** - Sobrenome do usuário
- **Senha** - Mínimo 6 caracteres

### **Validações:**
- Telefone: Formato válido
- Senha: Mínimo 6 caracteres
- Nomes: Obrigatórios

## 🔧 Configuração

### **Variáveis de Ambiente:**
```env
JWT_SECRET=prato-frio-super-secret-key-2024-mocambique
```

### **Dependências:**
- `jsonwebtoken` - Geração e verificação de JWT
- `bcryptjs` - Hash de senhas
- `@types/jsonwebtoken` - Tipos TypeScript
- `@types/bcryptjs` - Tipos TypeScript

## 🚀 Fluxo de Funcionamento

### **1. Acesso Inicial**
```
Usuário acessa → Player carrega → Assistir livremente (0-12min)
```

### **2. Restrição Ativada**
```
12 minutos atingidos → Player pausa → Modal aparece
```

### **3. Autenticação**
```
Modal → Escolher opção → Login/Registro → Token JWT → Acesso completo
```

### **4. Sessão Persistente**
```
Token salvo no localStorage → Acesso direto → Sem restrições
```

## 🛡️ Segurança

### **JWT Token:**
- Expiração: 7 dias
- Algoritmo: HS256
- Payload: ID, telefone, nome, sobrenome

### **Senhas:**
- Hash: bcryptjs
- Salt rounds: 10
- Não armazenadas em texto plano

### **Validações:**
- Telefone único
- Senha mínima
- Token verificado a cada requisição

## 📱 Interface do Usuário

### **Indicador de Tempo:**
- Posição: Canto superior direito
- Mostra: Tempo restante
- Cor: Vermelho quando próximo do limite

### **Modal de Autenticação:**
- Design: Moderno e responsivo
- Abas: Login / Registro
- Validação: Em tempo real
- Feedback: Mensagens de erro/sucesso

## 🔄 Estados da Aplicação

### **Não Autenticado:**
- Acesso limitado a 12 minutos
- Indicador de tempo visível
- Modal obrigatório após limite

### **Autenticado:**
- Acesso completo ao filme
- Sem restrições de tempo
- Sessão persistente

## 🧪 Testes

### **Cenários de Teste:**
1. **Acesso livre** - Verificar 12 minutos
2. **Restrição ativada** - Modal aparece
3. **Registro** - Nova conta criada
4. **Login** - Autenticação válida
5. **Sessão persistente** - Token salvo
6. **Acesso completo** - Filme sem restrições

## 🚨 Notas Importantes

### **Desenvolvimento:**
- Banco de dados em memória (não persistente)
- Em produção: usar banco real (PostgreSQL/MongoDB)
- JWT_SECRET: usar variável de ambiente segura

### **Produção:**
- Configurar banco de dados real
- Usar HTTPS obrigatório
- Implementar rate limiting
- Logs de auditoria

## 📊 Monitoramento

### **Métricas Importantes:**
- Usuários registrados
- Taxa de conversão (12min → autenticação)
- Tempo médio de visualização
- Erros de autenticação

---

**Desenvolvido para o projeto "Prato Frio" - Capturando Histórias em Movimento** 🎬
