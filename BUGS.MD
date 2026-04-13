> Backend escolhido: backend-express.

# BUGS

## Bug 1 – Autenticação
- Descrição: A rota de autenticação possuía um `authMiddleware` que exigia um token para o usuário poder se autenticar. Isso causava o bug B2 mencionado na tabela de prévia de bugs, pois não importava se o email e a senha estivessem corretos, sempre era retornada a mensagem “Token de autenticação não fornecido”.
- Localização: `backend-express`, arquivo `auth.routes.ts`, linha 6.
- Solução: a solução foi simplesmente remover o `authMiddleware` dessa rota.

## Bug 2 – Autenticação
- Descrição: Na versão original do projeto, todas as rotas, exceto a de auth, não possuíam o `authMiddleware`, ou seja, não era necessário um token para fazer requisições para essas rotas. Um bug grave de segurança.
- Localização: `backend-express`, arquivos `debito.route.ts` e `veiculo.route.ts`.
- Solução: a solução foi simplesmente incluir o `authMiddleware` nas rotas dos arquivos mencionados acima.

## Bug 3 – Geral
- Descrição: A rota responsável pela busca de débitos por placa não retornava os débitos corretamente, mas sim erro. Isso ocorria por que não era usada a palavra-chave `await` antes de `getAsync` dentro da constante veículos na função `buscarDebitosPorPlaca` no arquivo `debito.service.ts`. Ou seja, o valor de veículos era uma `Promise`, isso fazia com que a validação da linha 24 não funcionasse, pois a promise nesse contexto é truthy e mais adiante no código quando o id do veiculo era utilizado como parâmetro na query um erro era gerado, pois não existia a propriedade `id` dentro da `Promise`.
- Localização: `backend-express`, arquivo `debito.service.ts`, linha 19.
- Solução: a solução foi simplesmente incluir a palavra-chave `await` antes de `getAsync` na linha 19, assim o valor da constante veiculo deixou de ser uma `Promise` e passou a ser `undefined` ou um objeto `Veiculo`, e o fluxo de código seguiu normalmente, não estourando mais erros e retornando os débitos existentes.

## Bug 4 – Filtro
- Descrição: A rota responsável “aceitava” os query params `status` e `tipo`, porém não utilizava para filtrar os débitos, assim como mencionado no bug B6 na tabela de prévia de bugs. Na verdade, essa função de filtrar débitos não estava implementada, o que eu fiz foi incluir no projeto essa possibilidade.
- Localização: `backend-express`, os arquivos modificados foram `debito.controller.ts` e `debito.service.ts`.
- Solução: A solução inicialmente foi modificar os parâmetros da função `buscarDebitosPorPlaca` (`debito.service.ts`), incluí mais 2 parâmetros: `status?: string` e `tipo?:string`. Em seguida ao invés de declarar o sql direto na função `queryAsync`, armazenei ele em uma variável e fiz 2 verificações com `if` para incluir ou não os filtros de `status` e `tipo` na cláusula `Where` do sql. No arquivo `debito.schema.ts` criei um zod object para validar o payload que iria vir via query params na rota da api.

## Bug 5 – HTTP
- Descrição: A rota de criação de veiculo (`veiculo.controller.ts`) retorna status `200` (`OK`), ao invés de retornar status `201` (`CREATED`).
- Localização: `backend-express`, arquivo `veiculo.controller.ts`, linha 61.
- Solução: a solução foi simplesmente alterar o código do retorno de `200` para `201` em caso de sucesso na criação.

## Bug 6 – Configuração / Segurança
- Descrição: As validações de payload de todos os controllers do projeto `backend-express` estavam deixando passar payloads inválidos sem retornar erro algum. Isso ocorria pois os zods objects eram declarados usando `z.object`, desse forma a validação ignorava “chaves” no payload que não pertenciam ao objeto e não retornava erro.
- Localização: `backend-express`, todos os arquivos de controller.
- Solução: a solução foi ao invés de declarar os zods objects usando `.object()`, declarar usando `.strictObject()`, essa função é responsável por validar além dos valores, as chaves do objeto. Agora caso uma chave que não tenha sido declarada no zod chegue via payload, um erro de validação é disparado.

## Bug 7 – Regra de Negócio
- Descrição: A função `calcularTotais` (`debito.service.ts`) usava como base o `valorComMulta` para calcular o valor dos juros, ao invés do valor original do débito.
- Localização: `backend-express`, arquivo `debito.service.ts`, linha 8.
- Solução: a solução foi na constante `valorJuros`, substituir `valorComMulta` para `debito.valor`.

## Bug 8 – Frontend
- Descrição: Na tela de listagem de débitos no frontend, as datas de cada débito possuem um dia de diferença da retornada pela API. Isso ocorre porque quando a string da data é jogada dentro de `Date()` a data é retornada em UTC (fuso horário base), com horário `00:00:00`, quando interpretada pelo navegador o mesmo tenta trazer a data para o fuso horário configurado nele. Então caso o fuso horário do navegador seja `UTC-3`, 3 horas serão retiradas da data e o dia exibido terá um dia a menos que a data retornada pela API.
- Localização: `frontend`, arquivo `DebitosList.tsx`, linhas 27 - 28.
- Solução: A solução foi simplesmente separar a string recebida como parâmetro em 3 constantes: `ano`, `mes`, `dia`. Reordenar em uma string e retornar no formato `DD/MM/YYYY`. Na prática eu só reordenei uma string, e não utilizei o `Date()`, então configurações de fuso horários não vão interferir no retorno.

## Bug 9 – Frontend
- Descrição: Na tela de listagem de débitos no frontend, o valor exibido de cada débito é o `valor_total`, porém isso pode causar erro de interpretação, pois, quando o débito possui juros e multa, esses valores aparecem logo abaixo do valor principal com um sinal de “+” na frente, dando a entender que a multa e os juros ainda não estão acrescidos no valor do débito. Isso gera uma ambiguidade na leitura da informação, já que o usuário pode entender que o valor mostrado em destaque ainda receberá esses acréscimos. O correto seria exibir o `valor`, e não o `valor_total`, pois assim a composição visual faria mais sentido na tela.
- Localização: `frontend`, arquivo `DebitosList.tsx`, linha 66.
- Solução: Basta mudar a variável que está sendo exibida de `debito.valor_total` para `debito.valor`.

## Bug 10 – Frontend
- Descrição: No card do veículo, o texto “Ver détalhes ->” estava escrito de forma errada.
- Localização: `frontend`, arquivo `VeiculoCard.tsx`, linha 60.
- Solução: Correção de escrita, para “Ver detalhes ->”.

## Bug 11 – Frontend
- Descrição: A filtragem inicial de veículos no frontend era feita apenas sobre os itens já carregados na tela, e não sobre a base completa no backend. Na prática, isso significa que o filtro só atuava sobre os veículos da página atual. Com isso, se o veículo procurado existisse, mas estivesse em outra página da paginação, ele não seria encontrado, mesmo estando cadastrado no sistema. Isso também deixava o comportamento inconsistente com a paginação, já que a quantidade total de registros continuava vindo da API sem considerar o filtro aplicado no frontend.
- Localização: `frontend`, arquivo `app/page.tsx`.
- Solução: A filtragem passou a ser feita no backend, junto da paginação, em vez de ser aplicada localmente no frontend. Dessa forma, a busca e a paginação passaram a operar sobre o mesmo conjunto de dados, evitando inconsistências. Para viabilizar isso, também foi incluída a possibilidade de filtrar por placa na rota `GET /veiculos`.

# MELHORIAS

## Melhoria 1 – Código
- Descrição: No backend removi os schemas de validação zod dos arquivos controllers e movi para uma pasta chamada `schemas`, criei um arquivo para cada domínio (`auth`, `debito`, `veiculo`) e um arquivo para schemas comuns. Isso irá organizar melhor o código e facilitar a leitura do mesmo.

## Melhoria 2 – Validação
- Descrição: A validação de placa agora é feita dentro dos schemas, antes quando precisava validar uma placa, primeiro era validado o schema e depois a placa, ocorria no mínimo 2 processos de validação. Agora como a validação da placa ocorre no schema, é executado 1 processo de validação a menos.

## Melhoria 3 – Notificação
- Descrição: O retorno de algumas requisições (por exemplo, a de quitar débitos) são exibidos em formato de notificação, um feedback visual. 
