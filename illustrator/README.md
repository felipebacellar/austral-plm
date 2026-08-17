# Illustrator → PLM

Sobe as pranchetas do Illustrator direto para a ficha técnica do PLM. O **nome
da prancheta** decide em qual campo da ficha a imagem entra.

## Arquivos

| Arquivo | O que é |
|---|---|
| `SubirParaPLM.jsx` | O script que o usuário roda (Arquivo > Scripts > SubirParaPLM) |
| `plm-upload.ps1` | Faz login, upload e gravação na ficha. Chamado pelo `.jsx`, não rode à mão |
| `CriarModeloPLM.jsx` | Gera o arquivo-modelo com as pranchetas nomeadas e no tamanho certo |
| `Instalar-PLM.ps1` | Instala tudo na máquina |
| `plm-config.json` | Endereço do Supabase + chave anon. Criado pelo instalador (fora do git) |

## Instalar numa máquina

1. Copie esta pasta para a máquina (pen drive, rede, OneDrive — tanto faz).
2. Abra o **PowerShell como Administrador** na pasta e rode:

```bash
powershell -ExecutionPolicy Bypass -File .\Instalar-PLM.ps1
```

Ele pergunta o endereço do Supabase e a chave anon (as mesmas do
`.env.local` do PLM — na máquina de desenvolvimento ele já lê do arquivo) e
copia os scripts para a pasta de Scripts de toda versão do Illustrator que
achar. Feche e abra o Illustrator depois.

Para instalar em muita gente sem digitar nada, passe as chaves na linha de
comando — dá para pôr num `.bat` na rede:

```bash
powershell -ExecutionPolicy Bypass -File .\Instalar-PLM.ps1 -SupabaseUrl "https://SEU.supabase.co" -AnonKey "eyJ..."
```

## Arquivo-modelo

Rode uma vez `Arquivo > Scripts > CriarModeloPLM` e salve o documento como
**MODELO PLM.ai** na rede. Cada produto novo nasce de uma cópia dele: as
pranchetas já vêm nomeadas e na proporção da moldura correspondente do PLM,
então o desenho não distorce nem sobra borda.

A camada **GUIAS** só tem os rótulos de referência, fora das pranchetas — não
vai para o PLM.

## Usar

1. Abra o arquivo do produto.
2. `Arquivo > Scripts > SubirParaPLM`.
3. Digite a **REF** e desmarque o que não quiser subir.
4. Na primeira vez, entre com o **e-mail e a senha do PLM**. A sessão fica
   guardada na máquina (protegida por DPAPI, por usuário do Windows) e não
   pergunta mais.

Se a REF for de um **clássico** com várias temporadas, o script pergunta em
qual temporada gravar.

## Nomes de prancheta aceitos

As 12 que vêm no arquivo-modelo:

| Prancheta | Vai para | Proporção |
|---|---|---|
| `DESENHO TECNICO` | Desenho da ficha e do PDF (`imagem_url`) | 16:9 |
| `MODELO` | Imagem do modelo (`imagem_modelo`) | 3:4 |
| `ARTE FRENTE` | Estamparia > arte FRENTE | 4:3 |
| `ARTE COSTAS` | Estamparia > arte COSTAS | 4:3 |
| `ARTE TAGLESS` | Estamparia > arte TAGLESS | 3:2 |
| `LOCAL FRENTE` | Estamparia > localização FRENTE | 4:3 |
| `LOCAL COSTAS` | Estamparia > localização COSTAS | 4:3 |
| `LOCAL TAGLESS` | Estamparia > localização TAGLESS | 3:2 |
| `SIMULACAO VAR01`…`VAR06` | Estamparia > simulação da variante | 4:3 |

Três nomes o script aceita mas **não vêm no modelo**, porque esses campos são
preenchidos por outro caminho — o modo de medir vem da tabela de medidas e as
fotos da peça entram direto na ficha. Se um dia precisar subir por aqui, basta
criar a prancheta com o nome:

| Prancheta | Vai para | Proporção |
|---|---|---|
| `MODO DE MEDIR` | Modo de medir (`imagem_modo_medir`) | 4:3 |
| `FOTO FRENTE` | Foto da peça, frente (`imagem_frente`) | 3:4 |
| `FOTO COSTAS` | Foto da peça, costas (`imagem_costas`) | 3:4 |

Acento, minúscula e espaço a mais não atrapalham: `Simulação Var01` funciona.
Alguns apelidos também valem (`DESENHO`, `TAGLESS`, `ESTAMPA FRENTE`,
`LOCALIZACAO FRENTE`, `SIM VAR01`…). Prancheta com nome fora da lista é
ignorada e o script avisa quais foram.

## Detalhes que importam

- **A ficha tem que existir.** O script grava numa ficha já criada no PLM; se
  não achar a REF, avisa e não cria nada.
- **Login por pessoa.** O banco só aceita escrita de usuário autenticado
  (`supabase/004_role_based_rls.sql`), então cada um usa a própria conta — o
  que também deixa o rastro certo de quem subiu. Quem entra no PLM só pelo
  link do e-mail precisa definir uma senha antes.
- **Exporta PNG a 200%**, com transparência, recortado na prancheta. Uma
  prancheta de 240 mm sai com ~1360 px — bom para a tela e para o PDF.
- **Caminho no Storage** igual ao do app (`{REF}/{campo}/{timestamp}.png`), no
  bucket `fichas-imagens`. Excluir o produto no PLM continua limpando as
  imagens junto.
- **Substitui o campo**, não acumula: subir de novo troca a imagem daquele
  campo.
