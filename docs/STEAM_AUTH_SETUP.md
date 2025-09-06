# Configuração de Autenticação Steam

Este documento explica como configurar a autenticação Steam no frontend e backend.

## Configuração do Backend (API)

1. **Variáveis de Ambiente** - Configure no arquivo `.env` do backend:
```env
STEAM_API_KEY=sua_chave_api_steam
STEAM_RETURN_URL=http://localhost:5757/auth/callback
STEAM_REALM=http://localhost:5757
JWT_SECRET=sua_chave_secreta_jwt
FRONTEND_URL=http://localhost:5757
```

**Arquivo:** `cs2-smokes-hub-api/.env`

2. **Obter Chave da API Steam**:
   - Acesse: https://steamcommunity.com/dev/apikey
   - Faça login com sua conta Steam
   - Crie uma nova chave de API
   - Use o domínio: `localhost` (para desenvolvimento)

## Configuração do Frontend

1. **Variáveis de Ambiente** - Crie um arquivo `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:6969
NEXT_PUBLIC_STEAM_RETURN_URL=http://localhost:5757/auth/callback
NEXT_PUBLIC_STEAM_REALM=http://localhost:5757
```

**Arquivo:** `cs2-smokes/.env`

**Por que usar `.env`:**
- ✅ **Configurações compartilhadas** com a equipe
- ✅ **Valores padrão** do projeto
- ✅ **Fácil de manter** e versionar
- ✅ **Configurações de desenvolvimento** padronizadas

## Fluxo de Autenticação

1. **Usuário clica em "Entrar com Steam"**
   - Redireciona para `/auth/steam` na API
   - API redireciona para Steam OpenID

2. **Steam autentica o usuário**
   - Steam redireciona de volta para `http://localhost:5757/auth/callback`
   - Frontend detecta parâmetros OpenID e faz requisição para API
   - API cria/atualiza usuário no banco de dados
   - API gera JWT token e retorna para frontend

3. **Frontend processa autenticação**
   - Frontend recebe token e dados do usuário da API
   - Token é armazenado no localStorage
   - Usuário é redirecionado para a página inicial

## Endpoints da API

- `GET /auth/steam` - Inicia autenticação Steam
- `GET /auth/steam/return` - Callback do Steam (retorna JWT)
- `GET /auth/me` - Perfil do usuário autenticado (requer JWT)

## Componentes Criados

- `AuthProvider` - Context para gerenciar estado de autenticação
- `SteamLoginButton` - Botão de login/logout
- `SteamCallback` - Página de callback do Steam
- `AuthLoading` - Loading durante autenticação
- `useAuthenticatedFetch` - Hook para requisições autenticadas

## Como Testar

1. **Configure os arquivos `.env`** em ambos os projetos
2. **Inicie o backend**: `npm run start:dev` (porta 6969)
3. **Inicie o frontend**: `npm run dev` (porta 5757)
4. **Acesse**: http://localhost:5757
5. **Clique em "Entrar com Steam"**
6. **Faça login na Steam**
7. **Você será redirecionado de volta com autenticação**

## Estrutura de Arquivos

```
cs2smokeshub-workspace/
├── cs2-smokes/
│   ├── .env                    # Configurações do frontend
│   └── ...
├── cs2-smokes-hub-api/
│   ├── .env                    # Configurações do backend
│   └── ...
└── ...
```

## Troubleshooting

- **Erro 401**: Verifique se o JWT_SECRET está configurado
- **Erro de CORS**: Configure CORS no backend para permitir localhost:5757
- **Steam não redireciona**: Verifique STEAM_RETURN_URL e STEAM_REALM
- **Token inválido**: Verifique se o token está sendo enviado corretamente
- **Variáveis não carregam**: Verifique se o arquivo `.env` está na raiz do projeto
