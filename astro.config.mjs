import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Se o repositório não for um user/organization page (ex: username.github.io),
  // descomente a linha abaixo e substitua 'FichaAnatemaProfetico' pelo nome do seu repositório
  // base: '/FichaAnatemaProfetico',
  build: {
    assets: 'assets'
  }
});

