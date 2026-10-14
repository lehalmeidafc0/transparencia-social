# Transparência Social

Portal onde ONGs publicam seus documentos e qualquer pessoa consulta como elas funcionam e usam seus recursos.

Proposta de intervenção para a Associação Cultural Filhos da Corrente, desenvolvida por alunas do curso de Ciências Contábeis do Senac.

## Estrutura do projeto

```
transparencia-social/
├── index.html        → as 4 páginas do site (Início, Documentos, Integrantes, Contato)
├── css/style.css     → cores, fontes e layout
├── js/script.js      → documentos, integrantes, busca, filtros e formulários
└── img/              → logo e fotos das integrantes
```

## 1. Abrir e editar no VS Code

1. Descompacte o arquivo `.zip`.
2. No VS Code, vá em **File > Open Folder** e escolha a pasta `transparencia-social`.
3. Para ver o site enquanto edita, instale a extensão **Live Server**. Depois clique com o botão direito em `index.html` e escolha **Open with Live Server**.

### O que dá para editar com facilidade

- **Adicionar um documento:** em `js/script.js`, procure a lista `SEED`. Cada linha é um documento, neste formato:
  ```js
  ["Nome da ONG","categoria","Nome do documento","Descrição curta","https://link-do-documento"],
  ```
  As categorias são `inst` (Institucionais), `termos` (Termos de colaboração), `balancos` (Balanços patrimoniais) e `rel` (Relatórios e certificados).
- **Trocar uma foto:** coloque a nova imagem na pasta `img/` e ajuste o nome do arquivo na lista `MEMBERS`, em `js/script.js`. O ideal é usar uma foto vertical (por exemplo, 480 × 600 pixels).
- **Trocar o e-mail da equipe:** procure por `mariaclaraosouzaz@gmail.com` em `index.html` e em `js/script.js` e substitua.
- **Cores:** ficam no início de `css/style.css` (`--red`, `--blue`, `--yellow`).

## 2. Subir para o GitHub

### Pelo site do GitHub (sem usar comandos)

1. Crie uma conta em [github.com](https://github.com).
2. Clique em **New repository**, dê o nome `transparencia-social`, marque **Public** e clique em **Create repository**.
3. Clique em **uploading an existing file**.
4. Arraste para a página **o conteúdo** da pasta `transparencia-social`: o `index.html`, o `README.md` e as pastas `css`, `js` e `img`. Não arraste a pasta inteira: o `index.html` precisa ficar na raiz do repositório.
5. Clique em **Commit changes**.

### Pelo terminal do VS Code (opcional)

```bash
git init
git add .
git commit -m "Site Transparência Social"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/transparencia-social.git
git push -u origin main
```

## 3. Colocar o site no ar (GitHub Pages)

1. No repositório, vá em **Settings > Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Em **Branch**, escolha **main** e a pasta **/ (root)**. Clique em **Save**.
4. Espere de 1 a 2 minutos e atualize a página. O endereço do site aparece no topo, neste formato:
   `https://SEU-USUARIO.github.io/transparencia-social/`

Esse link abre em qualquer navegador (Google Chrome, celular etc.) e pode ser enviado para qualquer pessoa, sem precisar de conta.

Sempre que vocês alterarem um arquivo no GitHub, o site atualiza sozinho em alguns minutos.

## 4. Aparecer nas buscas do Google (opcional)

O site não aparece na busca do Google logo de cara. Para pedir que o Google o encontre:

1. Acesse o **Google Search Console** e adicione o endereço do site.
2. Siga a verificação indicada (a opção de arquivo HTML funciona com o GitHub Pages: basta subir o arquivo que o Google fornecer para a raiz do repositório).
3. Peça a indexação da página. Pode levar alguns dias para aparecer nos resultados.

## Como funciona o envio de documentos

O formulário **Publique os documentos da sua ONG** abre o e-mail de quem está enviando com uma mensagem pronta para a equipe, com o nome da ONG, a categoria, o nome do documento e o link. A equipe revisa o documento e, se estiver tudo certo, adiciona à lista `SEED` em `js/script.js`.
