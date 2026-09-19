name: Deploy NEXUS Forense

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Baixar código
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Instalar dependências
        run: npm ci

      - name: Verificar tipos
        run: npm run check

      - name: Gerar build
        run: npm run build
        env:
          VITE_BASE_PATH: /${{ github.event.repository.name }}/

      - name: Preservar rotas do aplicativo
        run: cp dist/public/index.html dist/public/404.html

      - name: Preparar GitHub Pages
        uses: actions/configure-pages@v5

      - name: Empacotar site
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Publicar no GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
