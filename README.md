# Street 3v3 - BOLA MAIS UM

Sistema de gerenciamento de filas para jogos de basquete 3x3.

## 🏀 Funcionalidades

- **Gerenciamento de Jogadores**: Adicionar e remover jogadores
- **Criação de Times**: Formar times de até 3 jogadores
- **Sistema de Fila**: Rotação automática de times
- **Jogo Atual**: Visualização do jogo em andamento
- **Autenticação Admin**: Controle de acesso para operações administrativas

## 🚀 Tecnologias

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion (animações)
- Lucide React (ícones)
- React Hot Toast (notificações)

### Backend
- PHP 8+
- MySQL
- API RESTful

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- PHP 8+
- MySQL
- Servidor web (Apache/Nginx)

### Configuração do Banco de Dados

1. Crie um banco MySQL na Hostinger
2. Configure as credenciais em `api/config/database.php`:

```php
private $host = 'auth-db720.hstgr.io';
private $dbname = 'u383024317_bola_mais_um';
private $username = 'bolaadm';
private $password = 'Bolamais1';
```

### Deploy na Hostinger

1. **Upload dos arquivos**:
   - Faça build do projeto: `npm run build`
   - Copie o conteúdo da pasta `dist/` para o diretório público
   - Copie a pasta `api/` para o diretório público
   - Copie o arquivo `.htaccess` para o diretório público

2. **Configuração do servidor**:
   - Certifique-se de que o PHP está habilitado
   - Verifique se as extensões PDO e PDO_MySQL estão ativas

3. **Inicialização**:
   - Acesse `seu-dominio.com/api/init.php` para criar as tabelas
   - O sistema estará pronto para uso

## 🔐 Autenticação

**Admin Login**:
- Usuário: `bolaadm`
- Senha: `bola+1adm`

## 📱 Uso

1. **Visitantes**: Podem visualizar jogos, times e fila
2. **Admin**: Pode gerenciar jogadores, times e jogos
3. **Sistema de Fila**: Times vencedores permanecem, perdedores vão para o final da fila

## 🎯 Regras do 3x3

- Cestas normais: 1 ponto
- Cestas de 3 pontos: 2 pontos
- Jogo até 11 pontos ou por tempo
- Sistema de rotação contínua
- Checkball após cestas e faltas

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura do Projeto

```
├── api/                    # Backend PHP
│   ├── config/            # Configuração do banco
│   ├── players.php        # API de jogadores
│   ├── teams.php          # API de times
│   ├── game.php           # API do jogo
│   ├── reset.php          # Reset do sistema
│   └── init.php           # Inicialização
├── src/                   # Frontend React
│   ├── components/        # Componentes React
│   ├── contexts/          # Context API
│   ├── lib/              # Utilitários
│   └── types/            # Tipos TypeScript
└── public/               # Arquivos estáticos
```

## 🔧 Manutenção

- **Reset do Sistema**: Use a senha `admin123` no modal de reset
- **Backup**: Faça backup regular do banco MySQL
- **Logs**: Monitore logs de erro do PHP

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com o administrador do sistema.