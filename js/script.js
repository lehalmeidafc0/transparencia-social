const BASE = "https://www.associacaocedap.org.br/wp-content/uploads/2022/09/";
const CATS = [
  {id:"inst", name:"Institucionais", color:"#2D7DC0", desc:"Estatuto, atas de eleição e certidões."},
  {id:"termos", name:"Termos de colaboração", color:"#EDB02C", desc:"Parcerias e convênios firmados com o poder público e outras instituições."},
  {id:"balancos", name:"Balanços patrimoniais", color:"#D63A2F", desc:"Demonstrações contábeis e financeiras anuais."},
  {id:"rel", name:"Relatórios e certificados", color:"#5B6573", desc:"Certificações, registros em conselhos e relatórios de atividades."}
];
const catById = Object.fromEntries(CATS.map(c=>[c.id,c]));
const C = "CEDAP", F = "Filhos da Corrente";
const SEED = [
  [F,"balancos","Balanço financeiro e DRE 2024","Balanço e demonstração de resultado","https://filhosdacorrente.blogspot.com/2025/09/balanco-financeiro-e-dre-2024.html"],
  [C,"inst","Estatuto Social","Regras de funcionamento da associação","1-Estatuto-Social-CEDAP-novo.pdf"],
  [C,"inst","Ata do mandato atual","Eleição e composição da diretoria","2-ATA-CEDAP-MANDATO-ATUAL.pdf"],
  [C,"inst","CND Receita Federal","Certidão negativa de débitos federais","CND-receita-federal-cedap.pdf"],
  [C,"termos","CEI Carolina","Termo de colaboração inicial","CAROLINA-TERMO-COLABORACAO-INICIAL.pdf"],
  [C,"termos","CEI Eva Furnari","Termo de colaboração inicial","EVA-FURNARI-TERMO-DE-COLABORACAO-INICIAL.pdf"],
  [C,"termos","CEI Sonho de Criança","Termo de colaboração inicial","SONHO-DE-CRIANCA-TERMO-COLABORACAO-INICIAL.pdf"],
  [C,"termos","CEI Educar","Termo de colaboração","Termo-Colaboração-CEI-Educar.pdf"],
  [C,"termos","CEI Espaço Brincar","Termo de colaboração","Termo-Colaboração-Cei-Espaço-Brincar.pdf"],
  [C,"termos","CEI Sementinha","Termo de colaboração","Termo-de-Colaboraçã-Cei-Sementinha.pdf"],
  [C,"termos","CEI Alecrim","Termo de colaboração","Termo-de-Colaboração-Cei-Alecrim.pdf"],
  [C,"termos","CEI Abraçar","Termo de colaboração","Termo-de-Colaboração-Cei-Abraçar.pdf"],
  [C,"termos","CEI Brincarte","Termo de colaboração","Termo-de-Colaboração-Cei-Brincarte.pdf"],
  [C,"termos","CEI Cantinho Feliz","Termo de colaboração","Termo-de-Colaboração-Cei-Cantinho-Feliz.pdf"],
  [C,"termos","CEI Chácara Jockey","Termo de colaboração","Termo-de-Colaboração-cei-Chacara-Jockey.pdf"],
  [C,"termos","CEI Espaço da Criança II","Termo de colaboração","Termo-de-Colaboração-Cei-Espaço-II.pdf"],
  [C,"termos","CEI Espaço da Criança III","Termo de colaboração","Termo-de-Colaboração-Cei-Espaço-III.pdf"],
  [C,"termos","CEI Espaço da Criança IV","Termo de colaboração","Termo-de-Colaboração-Cei-Espaço-IV.pdf"],
  [C,"termos","CEI Estação Alegria","Termo de colaboração","Termo-de-Colaboração-Cei-Estação-Alegria.pdf"],
  [C,"balancos","Balanço 2020","Balanço patrimonial do exercício de 2020","BALANÇO-2020-CEDAP.pdf"],
  [C,"balancos","Balanço 2019","Balanço patrimonial do exercício de 2019","BALANÇO-2019-CEDAP.pdf"],
  [C,"balancos","Balanço 2018","Balanço e notas explicativas de 2018","BALANÇOS-E-NOTAS-2018.pdf"],
  [C,"rel","Relatório sintético 2021 e 2022","Resumo das atividades do período","RelatorioSintetico-2021e-2022-CEDAP.doc-Documentos-Google.pdf"],
  [C,"rel","Certificação CEBAS","Certificado de Entidade Beneficente de Assistência Social","CERTIFICAÇÃO-CEBAS-CEDAP.pdf"],
  [C,"rel","Certificado CENTS 2022","Cadastro de entidades do terceiro setor","certificado-cents-2022.pdf"],
  [C,"rel","Registro CMDCA","Conselho Municipal dos Direitos da Criança e do Adolescente","CMDCA.pdf"],
  [C,"rel","CRCE","Certificado de regularidade cadastral de entidades","CRCE-CEDAP.pdf"],
  [C,"rel","Diploma de Utilidade Pública","Prefeitura de São Paulo (SEI PMSP)","SEI_PMSP-059007894-Diploma-Utilidade-Pública.pdf"]
].map(([ong,cat,title,desc,file])=>{
  const web = file.startsWith("http");
  return {ong,cat,title,desc,href:web?file:encodeURI(BASE+file),kind:web?"link":"pdf"};
});

const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const plural = (n,a,b) => `${n} ${n===1?a:b}`;

/* Estado */
let shared = [], dbRef = null, assetsRef = null, myId = null, amOwner = false;
let active = "all";

const sharedDocs = () => shared.filter(r => catById[r.cat] && r.ong && r.title).map(r => {
  const isFile = typeof r.fileId==="string" && /^[0-9a-f]{32}$/.test(r.fileId);
  const okUrl = /^https:\/\//.test(r.url||"");
  return {id:r.id, ong:String(r.ong).trim(), cat:r.cat, title:r.title, desc:r.desc||"", by:r.by, fileId:isFile?r.fileId:null,
    href: isFile ? "/_blob/"+r.fileId : (okUrl ? r.url : "#"), kind: isFile ? "file" : "link", shared:true, createdAt:r.createdAt||0};
});
const allDocs = () => sharedDocs().sort((a,b)=>b.createdAt-a.createdAt).concat(SEED);
const ongNames = () => [...new Set(allDocs().map(d=>d.ong))].sort((a,b)=>a.localeCompare(b,"pt-BR"));

/* Início */
function renderHome(){
  const docs = allDocs(), count = id => docs.filter(d=>d.cat===id).length;
  const max = Math.max(1,...CATS.map(c=>count(c.id)));
  document.getElementById("heroFigures").innerHTML = CATS.map(c=>{
    const n = count(c.id), big = window.innerWidth > 560, h = (big?70:50) + (n/max)*(big?170:100);
    return `<a class="fig" href="#documentos" data-filter="${c.id}" aria-label="${plural(n,"documento","documentos")}: ${c.name}">
      <div class="head" style="background:${c.color}"></div>
      <div class="body" style="background:${c.color};height:${h}px">${n}</div>
      <span class="lbl">${c.name}</span></a>`;
  }).join("");
  document.getElementById("homeCats").innerHTML = CATS.map(c=>`
    <a class="cat" href="#documentos" data-filter="${c.id}">
      <div class="sw" style="background:${c.color}"></div>
      <h3>${c.name}</h3><p>${c.desc}</p>
      <span class="n">${plural(count(c.id),"documento","documentos")}</span>
    </a>`).join("");
  document.getElementById("heroStat").textContent = `${plural(docs.length,"documento publicado","documentos publicados")} por ${plural(ongNames().length,"ONG","ONGs")}.`;
  document.querySelectorAll("[data-filter]").forEach(a=>a.addEventListener("click",()=>{active=a.dataset.filter;document.getElementById("ongSel").value="";renderDocs();}));
}

/* Documentos */
const chipsEl = document.getElementById("chips"), ongSel = document.getElementById("ongSel");
function renderOngOptions(){
  const cur = ongSel.value, names = ongNames();
  ongSel.innerHTML = `<option value="">Todas as ONGs</option>` + names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
  ongSel.value = names.includes(cur) ? cur : "";
  const dl = document.getElementById("ongList"); if(dl) dl.innerHTML = names.map(n=>`<option value="${esc(n)}">`).join("");
}
function renderChips(){
  const all = [{id:"all",name:"Todas as categorias",color:null}].concat(CATS);
  chipsEl.innerHTML = all.map(c=>`<button class="chip" type="button" data-id="${c.id}" aria-pressed="${active===c.id}">${c.color?`<i style="background:${c.color}"></i>`:""}${c.name}</button>`).join("");
  chipsEl.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{active=b.dataset.id;renderDocs();});
}
const badge = {pdf:"PDF", file:"ARQ", link:"LINK"}, openTxt = {pdf:"Abrir PDF", file:"Abrir arquivo", link:"Abrir link"};
function renderDocs(){
  renderChips();
  const q = norm(document.getElementById("q").value.trim()), ong = ongSel.value;
  const list = allDocs().filter(d=>(active==="all"||d.cat===active) && (!ong||d.ong===ong) &&
    (!q || norm(d.title+" "+d.desc+" "+d.ong+" "+catById[d.cat].name).includes(q)));
  document.getElementById("count").textContent = plural(list.length,"documento encontrado","documentos encontrados");
  const out = CATS.map(c=>{
    const items = list.filter(d=>d.cat===c.id);
    if(!items.length) return "";
    return `<section class="doc-group" style="--c:${c.color}">
      <div class="doc-group-head"><h2>${c.name}</h2><p>${c.desc}</p></div>
      <ul class="doc-list">${items.map(d=>`<li>
        <a href="${esc(d.href)}" target="_blank" rel="noopener noreferrer">
          <span class="ic">${badge[d.kind]}</span>
          <span><span class="org">${esc(d.ong)}</span><span class="t">${esc(d.title)}</span>${d.desc?`<span class="d">${esc(d.desc)}</span>`:""}</span>
          <span class="open">${openTxt[d.kind]}</span></a>
        ${d.shared && (amOwner || (myId && d.by===myId)) ? `<button class="rm" data-id="${esc(d.id)}" type="button">Remover</button>` : ""}
      </li>`).join("")}</ul></section>`;
  }).join("");
  const box = document.getElementById("docGroups");
  box.innerHTML = out || `<p class="empty">Nenhum documento corresponde à busca. Tente outro termo, escolha "Todas as ONGs" ou "Todas as categorias".</p>`;
  box.querySelectorAll(".rm").forEach(b => b.onclick = async () => {
    if(!confirm("Remover este documento do portal?")) return;
    const row = shared.find(x=>x.id===b.dataset.id);
    try {
      await dbRef.collection("envios").doc(b.dataset.id).delete();
    } catch(e){ alert("Não foi possível remover o documento. Tente novamente."); }
  });
}
document.getElementById("q").addEventListener("input",renderDocs);
ongSel.addEventListener("change",renderDocs);
function renderAll(){ renderOngOptions(); renderHome(); renderDocs(); }

/* Envio de documentos */
document.getElementById("o-cat").innerHTML = CATS.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
const form = document.getElementById("ongForm");

function formUnavailable(){
  document.getElementById("ongFormWrap").innerHTML = `<div class="unavail">Para publicar documentos, a ONG precisa de acesso de colaborador ao portal. Peça o acesso pela página de <a href="#contato">contato</a>.</div>`;
}
form.addEventListener("submit", e => {
  e.preventDefault();
  const g = id => document.getElementById(id), msg = g("o-msg");
  msg.className = "form-msg err";
  const ong = g("o-ong").value.trim().replace(/\s+/g," "), title = g("o-title").value.trim(), url = g("o-url").value.trim();
  if(!ong || !title){ msg.textContent = "Preencha o nome da ONG e o nome do documento."; return; }
  if(!/^https:\/\/[^\s]+\.[^\s]+/.test(url)){ msg.textContent = "Cole um link válido que comece com https://."; return; }
  if(!g("o-ok").checked){ msg.textContent = "Confirme que o documento não contém informações sensíveis."; return; }
  const cat = catById[g("o-cat").value].name, desc = g("o-desc").value.trim();
  const body = `ONG: ${ong}\nCategoria: ${cat}\nDocumento: ${title}\nDescrição: ${desc || "-"}\nLink: ${url}\n\nConfirmo que o documento não contém dados pessoais, bancários ou outras informações sensíveis.`;
  window.location.href = `mailto:mariaclaraosouzaz@gmail.com?subject=${encodeURIComponent("[Transparência Social] Novo documento: "+ong)}&body=${encodeURIComponent(body)}`;
  msg.className = "form-msg"; msg.textContent = "Seu aplicativo de e-mail abriu com os dados do documento. Envie a mensagem e a equipe adiciona o documento ao portal depois de revisar.";
});



/* Integrantes */
const MEMBERS = [
  ["Ana Júlia Queiroz Martins","img/ana-julia.jpg"],
  ["Giovana Moreira","img/giovana.jpg"],
  ["Manoela Santos Campos","img/manoela.jpg"],
  ["Maria Clara Oliveira Souza","img/maria-clara.jpg"],
  ["Rafaela Reis dos Santos","img/rafaela.jpg"],
  ["Raissa Stefani Lemos da Silva Paz","img/raissa.jpg"]
];
const palette = ["#D63A2F","#2D7DC0","#EDB02C"];
document.getElementById("members").innerHTML = MEMBERS.map(([n,foto],i)=>{
  const c = palette[i%3];
  const inner = foto
    ? `<img src="${foto}" alt="Foto de ${n}">`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg><span>Espaço para foto</span>`;
  return `<div class="member" style="--c:${c}"><div class="photo${foto?" has":""}">${inner}</div><h3>${n}</h3><p>Ciências Contábeis, Senac</p></div>`;
}).join("");

/* Contato -> e-mail */
document.getElementById("contactForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f = e.target, msg = document.getElementById("formMsg");
  if(!f.nome.value.trim()||!f.email.checkValidity()||!f.msg.value.trim()){
    msg.className="form-msg err"; msg.textContent="Preencha nome, um e-mail válido e a mensagem para enviar."; return;
  }
  const body = `${f.msg.value}\n\n${f.nome.value}\n${f.email.value}`;
  window.location.href = `mailto:mariaclaraosouzaz@gmail.com?subject=${encodeURIComponent("[Transparência Social] "+f.assunto.value)}&body=${encodeURIComponent(body)}`;
  msg.className="form-msg"; msg.textContent="Mensagem preparada. Confira e envie pelo seu aplicativo de e-mail.";
});

/* Navegação */
const pages = ["home","documentos","integrantes","contato"];
const nav = document.getElementById("nav"), menuBtn = document.querySelector(".menu-btn");
function route(){
  const h = location.hash.slice(1);
  const p = h==="publicar" ? "documentos" : (pages.includes(h) ? h : "home");
  pages.forEach(x=>document.getElementById("page-"+x).classList.toggle("active",x===p));
  document.querySelectorAll("[data-link]").forEach(a=>{a.dataset.link===p?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
  if(p==="documentos") renderDocs();
  nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded","false");
  if(h==="publicar") requestAnimationFrame(()=>document.getElementById("publicar").scrollIntoView());
  else window.scrollTo(0,0);
}
menuBtn.onclick=()=>{const o=nav.classList.toggle("open");menuBtn.setAttribute("aria-expanded",o)};
window.addEventListener("hashchange",route);
renderAll();
route();
