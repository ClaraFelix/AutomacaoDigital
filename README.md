# AutoInspect - Dashboard de Automação Industrial

Projeto acadêmico para automatizar a inspeção de peças em um processo industrial, substituindo a verificação manual por regras de qualidade, controle de caixas e relatório final.

## Funcionalidades

- Cadastro de peça com ID, peso, cor e comprimento.
- Validação de ID duplicado.
- Validação de peso e comprimento como números positivos.
- Classificação automática como `APROVADA` ou `REPROVADA`.
- Registro de todos os motivos de reprovação.
- Controle automático de caixas com capacidade de 10 peças aprovadas.
- Exclusão de peças com recálculo de caixas, KPIs e relatórios.
- Dashboard responsivo com tabela, cards, gráfico donut e documentação integrada.
- Versão equivalente em Python para execução no terminal.

## Regras de Aprovação

Uma peça é aprovada somente se atender a todos os critérios:

- Peso entre 95g e 105g, inclusive.
- Cor exatamente `azul` ou `verde`, sem diferenciar maiúsculas e minúsculas.
- Comprimento entre 10cm e 20cm, inclusive.

Caso um ou mais critérios falhem, a peça é reprovada e o sistema exibe todos os motivos.

## Como Rodar a Versão Web

Abra o arquivo `index.html` em qualquer navegador moderno.

Não é necessário instalar dependências, compilar ou iniciar servidor.

## Como Rodar a Versão Python

No terminal, execute:

```bash
python main.py
```

Em alguns sistemas, pode ser necessário usar:

```bash
python3 main.py
```

## Exemplos de Entrada e Saída

Entrada aprovada:

```text
ID: P-001
Peso: 100
Cor: azul
Comprimento: 15
```

Saída:

```text
Peça P-001 APROVADA.
```

Entrada reprovada:

```text
ID: P-002
Peso: 90
Cor: vermelho
Comprimento: 25
```

Saída:

```text
Peça P-002 REPROVADA: Peso fora do padrão (90g); Cor inválida ('vermelho'); Comprimento fora do padrão (25cm)
```

## Instruções para a Banca Avaliadora

1. Abra `index.html` no navegador.
2. Cadastre peças válidas e inválidas.
3. Verifique a atualização imediata dos KPIs e do gráfico.
4. Acesse a aba `Peças` para conferir a tabela completa.
5. Exclua uma peça e observe o recálculo automático.
6. Acesse a aba `Caixas` para conferir caixas fechadas e caixa aberta.
7. Acesse a aba `Relatório` para ver os indicadores finais.
8. Acesse a aba `Sobre` para ler a documentação teórica integrada.
9. Execute `python main.py` para avaliar a versão em terminal.

## Estrutura do Projeto

```text
AutomacaoDigital/
├── index.html
├── styles.css
├── app.js
├── main.py
└── README.md
```

## Tecnologias

- HTML5
- CSS3
- JavaScript ES6
- Python 3

## Observações

A versão web usa `localStorage` para manter os dados cadastrados no navegador durante a avaliação. A versão Python mantém os dados em memória enquanto o programa estiver em execução.
