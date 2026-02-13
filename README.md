<div align="center">

# ✨ Ficha Anátema Profético

**Suite completa de fichas digitais para o RPG autoral Anátema Profético**

[![Astro](https://img.shields.io/badge/Astro-1.0+-333?style=for-the-badge&logo=astro&logoColor=FF5D01)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-7F5AF0?style=for-the-badge)](#-roadmap)
[![License](https://img.shields.io/badge/License-AGPL%203.0-green?style=for-the-badge)](LICENSE)

*Gerencie fichas de personagem e monstro, consulte o lore do sistema e mantenha seus dados sincronizados localmente com uma interface responsiva e performática.*

[Recursos](#-recursos) • [Instalação](#-instalação) • [Uso](#-como-usar) • [Arquitetura](#-arquitetura) • [Contribuir](#-contribuindo)

</div>

---

## 📖 Sobre o Projeto

**Anátema Profético** é um sistema de RPG de terror/mistério ambientado no nosso mundo, com trilhas místicas inspiradas em narrativas como *Lord of Mysteries* e *Shadow Slave*. Este repositório concentra:

- Ficha digital de personagem com salvamento local, exportação/importação em JSON e auto-save.
- Sistema de nivelamento dinâmico com avisos contextuais e popups informativos.
- Página "Página Inicial" com resumo narrativo do sistema e informações essenciais.
- Páginas "Criação de Ficha" e "Cálculos" com guias detalhados em formato de acordeão.
- Referência rápida de regras acessível via popup (botão no topo da página).
- Tema claro/escuro com persistência de preferência.
- Utilidades extras como rolagem de dados com modificadores, aviso de atributos base e controle visual de habilidades.

### 🎯 Objetivo

Oferecer uma experiência de ficha online rápida (alvo de 1–1,5 s de navegação), intuitiva e fiel ao clima misterioso do universo Anátema Profético — tanto para jogadores quanto para mestres.

### ✨ Destaques

- 🔁 **Salvamento Local Seguro**: tudo fica em `localStorage`, com import/export em JSON e auto-save a cada 2 segundos.
- 📊 **Sistema de Nivelamento Dinâmico**: avisos contextuais nos setores relevantes quando você sobe de nível, com popups informativos.
- 🎲 **Dice Roller Avançado**: seleção de dados, modificadores customizáveis, rolagem em lote e notificações empilhadas.
- ⚠️ **Alertas Inteligentes**: aviso automático para atributos base e status responsivos ao nível (Machucado, Morrendo).
- 🧩 **Layout em Abas**: Perícias, Equipamentos, Habilidades e Anotações em abas (inspirado em D&D Beyond e CRIS Ordem Paranormal).
- 📚 **Referência Rápida**: popup acessível via botão no topo da página com todas as regras essenciais (NDs 1-45, ações de combate, condições, etc.).
- 🌓 **Tema Claro/Escuro**: alternância entre temas com persistência de preferência.
- 🧠 **Lore Integrado**: páginas "Página Inicial", "Criação de Ficha" e "Cálculos" com narrativa e guias detalhados.
- ⚡ **Performance Otimizada**: uso de `requestAnimationFrame`, debounce e delegação de eventos.
- 🛡️ **Modo Combate**: página dedicada para mestres com ordem de iniciativa, anotações por personagem/monstro, passar/voltar turno e export/import JSON.
- ❤️ **Calculadoras de Dano e Cura**: aplicação rápida de dano ou cura em Vida, Mana e Sanidade com feedback visual (toast vermelho/verde).
- 🧠 **Sistema de Sanidade**: popup para insanidades (temporária/definitiva) e traumas, com persistência no JSON da ficha.
- 📈 **Barras de Progresso**: indicadores visuais para Vida, Mana e Sanidade.
- ⌨️ **Atalhos de Teclado**: Enter para rolar atributos/perícias, Esc para fechar popups.

---

## 📋 Requisitos

- **Node.js** 18+ (LTS recomendado)
- **npm** 9+ (instalado junto ao Node)
- Navegador moderno (Chrome, Edge, Firefox ou Safari)

---

## 🚀 Instalação

```bash
git clone https://github.com/moonlitrevery/FichaAnatemaProfetico.git
cd FichaAnatemaProfetico
npm install
npm run dev
```

Acesse `http://localhost:4321`.

### Scripts úteis

- `npm run dev` — servidor de desenvolvimento com hot reload.
- `npm run build` — gera a versão otimizada para produção.
- `npm run preview` — valida o build gerado localmente.

---

## 🕹️ Como Usar

1. Abra a aplicação local ou hospedada.
2. Preencha as informações da ficha de personagem (dados básicos, atributos, habilidades etc.).
3. Clique em **Salvar localmente** para persistir no `localStorage`.
4. Use **Exportar JSON** se quiser compartilhar o estado atual.
5. Importe arquivos JSON já salvos para restaurar fichas antigas.
6. Navegue entre as páginas do menu (Sistema, Ficha, Definições, Ficha de Monstro); o estado salvo permanece intacto.

---

## 🧱 Arquitetura

```
.
├── public/
│   └── favicon.svg              # Ícone temático (◊)
├── src/
│   ├── components/              # Header, Attributes, DiceRoller, SaveLoad, etc.
│   ├── layouts/                 # Layout base com metadados
│   ├── pages/                   # index, sistema, definicoes, monstro
│   └── utils/                   # Funções auxiliares (ex.: dice.ts)
├── astro.config.mjs
├── package.json
└── README.md
```

### Principais componentes

- `Header.astro`: informações gerais, status, valores dinâmicos, calculadoras de dano/cura, botões de descanso, barras de progresso.
- `Attributes.astro`: atributos + aviso para rolagens base.
- `Skills.astro`, `Equipment.astro`, `Abilities.astro`, `Notes.astro`: blocos editáveis organizados em abas na ficha principal.
- `SanitySystem.astro`: popup para insanidades e traumas (estilo equipamento/habilidades).
- `DiceRoller.astro`: seletor de dados, popups e lógica de rolagem.
- `SaveLoad.astro`: coleta de dados, salvamento no `localStorage`, export/import, indicador "Salvo há X min".
- `Toast.astro`: notificações visuais (dano, cura, descanso, sucesso).

---

## 💾 Salvamento Local

- **Auto-save**: a ficha é salva automaticamente a cada 2 segundos em `localStorage` (`anatema-profetico-character`).
- Botão **Salvar localmente** → salva manualmente a ficha completa.
- **Exportar JSON** → baixa um arquivo com o estado atual (recomendado para backup no Discord).
- **Importar JSON** → reconstrói a ficha a partir de um arquivo válido.

> **Nota**: O gerenciamento de múltiplas fichas foi removido. Recomenda-se usar o sistema de exportação/importação JSON para gerenciar múltiplas fichas via Discord ou armazenamento local.

> Nenhum dado pessoal é enviado para servidores; tudo acontece no navegador do usuário.

---

## 🚀 Deploy no GitHub Pages

O projeto está configurado para deploy automático via GitHub Actions. Siga os passos abaixo:

### 1. Habilitar GitHub Pages

1. Vá em **Settings** → **Pages** no seu repositório
2. Em **Source**, selecione **GitHub Actions**
3. Salve as alterações

### 2. Configurar Base Path (se necessário)

Se o seu repositório **não** for um user/organization page (ex: `username.github.io`), você precisa configurar o base path:

1. Abra `astro.config.mjs`
2. Descomente a linha `base: '/FichaAnatemaProfetico'`
3. Substitua `FichaAnatemaProfetico` pelo nome do seu repositório
4. Faça commit e push

**Exemplo:**
```javascript
export default defineConfig({
  output: 'static',
  base: '/FichaAnatemaProfetico', // Nome do seu repositório
  // ...
});
```

### 3. Deploy Automático

Após habilitar GitHub Pages, o workflow será executado automaticamente:

- **Push para `main`**: deploy automático
- **Workflow manual**: vá em **Actions** → **Deploy to GitHub Pages** → **Run workflow**

O site estará disponível em:
- User/Org page: `https://username.github.io/`
- Project page: `https://username.github.io/FichaAnatemaProfetico/`

### 4. Verificar Deploy

1. Vá em **Actions** no GitHub para ver o status do build
2. Após o deploy, acesse a URL do GitHub Pages
3. Verifique se todas as páginas carregam corretamente

### Troubleshooting

**Build falha:**
- Verifique os logs em **Actions**
- Execute `npm run build` localmente para identificar erros
- Certifique-se de que todas as dependências estão no `package.json`

**Assets não carregam:**
- Verifique se o `base` path está correto no `astro.config.mjs`
- Limpe o cache do navegador (Ctrl+Shift+R)

**Páginas 404:**
- Confirme que o `base` path corresponde ao nome do repositório
- Verifique se os arquivos foram gerados em `dist/`

---

## 🛣️ Roadmap

- [x] Layout em abas (Perícias, Equipamentos, Habilidades, Anotações).
- [x] Modo Combate com ordem de iniciativa e anotações.
- [x] Calculadoras de dano e cura com feedback visual.
- [x] Sistema de sanidade (insanidades e traumas).
- [x] Barras de progresso para Vida, Mana e Sanidade.
- [x] Atalhos de teclado (Enter, Esc).
- [x] Indicador "Salvo há X min".
- [x] Deploy automatizado via GitHub Actions.
- [ ] Tabela automática de nivelamento (atributos + treinamentos por nível 1–20).
- [ ] Histórico de rolagens persistente.
- [ ] Temas alternativos (alto contraste / visão noturna).
- [ ] Internacionalização (pt-BR → en-US).

Sugestões? Abra uma issue!

---

## 🤝 Contribuindo

1. Faça um fork deste repositório.
2. Crie um branch (`git checkout -b feature/minha-feature`).
3. Siga o padrão de código (Astro + TS + CSS modular, sem emojis).
4. Execute `npm run build` antes de abrir o PR.
5. Descreva claramente as mudanças, screenshots ajudam.

Contribuições de lore, UX e performance são muito bem-vindas.

---

## 📄 Licença

Este projeto é licenciado sob **AGPL-3.0**. Veja o arquivo [LICENSE](LICENSE) para detalhes.

> Qualquer distribuição de versões modificadas deve permanecer aberta sob a mesma licença quando oferecida como serviço ou aplicação hospedada.

---

<div align="center">

⭐ **Se gostou desse projeto, considere deixar uma estrela!** ⭐  
[⬆ Voltar ao topo](#-ficha-anátema-profético)

</div>
