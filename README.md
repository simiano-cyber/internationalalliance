# International Alliance

MVP web demonstrativo para uma comunidade internacional de maçons, criado apenas com HTML5, CSS3 e JavaScript puro em módulos ES6.

Este projeto está na Fase 1: estrutura inicial, página inicial, camada de dados local e layout responsivo. Não há backend, banco de dados, login real ou dados pessoais verdadeiros.

## Estado atual

- Ambiente demonstrativo com dados fictícios.
- Estrutura preparada para GitHub Pages.
- Dados persistidos localmente apenas via camada de servico.
- Nenhuma credencial ou informação pessoal real deve ser adicionada ao projeto.

## Como executar

Durante o desenvolvimento, abra a pasta no VS Code e use a extensao Live Server no arquivo `index.html`.

Também é possível hospedar os arquivos estáticos em GitHub Pages futuramente, sem etapa de build.

## Estrutura

```text
src/
  config/
  data/
  modules/
  services/
  styles/
  utils/
```

## Observacoes

O `localStorage` é usado somente no MVP e deve ser acessado exclusivamente por `src/services/localStorageAdapter.js`.
