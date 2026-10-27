/* ===== Banco de dados do portal (Supabase) =====
   Projeto: transparencia-social (Supabase > Project Settings > API Keys).
   A chave "publishable" é pública e feita para ficar no site; nunca use aqui a chave "secret". */
const SUPABASE_URL = "https://wyopdojnipyxfpyoqhag.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gmyx0oKcbP9i6oMBKgLjqw_NJeUhgrv";
const db = (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const BUCKET = "documentos";

const CATS = [
  {id:"inst", name:"Institucionais", color:"#2D7DC0", desc:"Estatuto, atas de eleição e certidões."},
  {id:"termos", name:"Termos de colaboração", color:"#EDB02C", desc:"Parcerias e convênios firmados com o poder público e outras instituições."},
  {id:"balancos", name:"Balanços patrimoniais", color:"#D63A2F", desc:"Demonstrações contábeis e financeiras anuais."},
  {id:"rel", name:"Relatórios e certificados", color:"#5B6573", desc:"Certificações, registros em conselhos e relatórios de atividades."}
];
const catById = Object.fromEntries(CATS.map(c=>[c.id,c]));
const F = "Filhos da Corrente";
/* Documentos publicados. Para adicionar um novo, copie a linha abaixo e troque os dados:
   [nome da ONG, categoria (inst | termos | balancos | rel), nome do documento, descrição, link] */
const SEED = [
  [F,"balancos","Balanço financeiro e DRE 2024","Balanço e demonstração de resultado do exercício","https://filhosdacorrente.blogspot.com/2025/09/balanco-financeiro-e-dre-2024.html"]
].map(([ong,cat,title,desc,file])=>{
  const web = file.startsWith("http");
  return {ong,cat,title,desc,href:file,kind:/\.pdf($|\?)/i.test(file)?"pdf":"link"};
});

const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const plural = (n,a,b) => `${n} ${n===1?a:b}`;

/* Estado */
let shared = [], dbRef = null, assetsRef = null, myId = null, amOwner = false, dbDocs = [];
let active = "all";

const sharedDocs = () => shared.filter(r => catById[r.cat] && r.ong && r.title).map(r => {
  const isFile = typeof r.fileId==="string" && /^[0-9a-f]{32}$/.test(r.fileId);
  const okUrl = /^https:\/\//.test(r.url||"");
  return {id:r.id, ong:String(r.ong).trim(), cat:r.cat, title:r.title, desc:r.desc||"", by:r.by, fileId:isFile?r.fileId:null,
    href: isFile ? "/_blob/"+r.fileId : (okUrl ? r.url : "#"), kind: isFile ? "file" : "link", shared:true, createdAt:r.createdAt||0};
});
const allDocs = () => dbDocs.concat(SEED);
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
  const order = [...CATS].sort((x,y)=>(list.some(d=>d.cat===y.id)?1:0)-(list.some(d=>d.cat===x.id)?1:0));
  const out = order.map(c=>{
    const items = list.filter(d=>d.cat===c.id);
    const filtering = q || ong || active!=="all";
    if(!items.length && (filtering && active!==c.id)) return "";
    if(!items.length) return `<section class="doc-group" style="--c:${c.color}">
      <div class="doc-group-head"><h2>${c.name}</h2><p>${c.desc}</p></div>
      <p class="empty-cat">Nenhum documento publicado nesta categoria ainda. <a href="#publicar">Envie o da sua ONG</a>.</p></section>`;
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
const fileIn = document.getElementById("o-file"), drop = form.querySelector(".drop");
const mode = () => form.querySelector('input[name="Forma de envio"]:checked').value;
const syncMode = () => {
  document.getElementById("pane-link").hidden = mode()!=="link";
  document.getElementById("pane-file").hidden = mode()!=="arquivo";
};
form.querySelectorAll('input[name="Forma de envio"]').forEach(r=>r.addEventListener("change",syncMode));
const pick = f => {
  const nm = document.getElementById("o-file-name");
  if(!f){ nm.textContent = "Escolher arquivo do dispositivo"; drop.classList.remove("has"); return; }
  nm.textContent = f.name + " (" + (f.size/1048576).toFixed(1).replace(".",",") + " MB)";
  drop.classList.add("has");
};
fileIn.addEventListener("change",()=>pick(fileIn.files[0]));
["dragover","dragenter"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault(); drop.classList.add("over");}));
["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,()=>drop.classList.remove("over")));
drop.addEventListener("drop",e=>{ e.preventDefault(); const f=e.dataTransfer.files[0]; if(f){ const dt=new DataTransfer(); dt.items.add(f); fileIn.files=dt.files; pick(f);} });
const OK_EXT = ["pdf","jpg","jpeg","png"];
if(db){ const em=document.getElementById("o-email"); em.closest("form").querySelector('label[for="o-email"]').remove(); em.remove(); }
form.addEventListener("submit", async e => {
  const g = id => document.getElementById(id), msg = g("o-msg");
  msg.className = "form-msg err";
  const fail = t => { e.preventDefault(); msg.textContent = t; };
  const ong = g("o-ong").value.trim(), title = g("o-title").value.trim();
  if(!ong || !title) return fail("Preencha o nome da ONG e o nome do documento.");
  if(!db && (!g("o-email").checkValidity() || !g("o-email").value.trim())) return fail("Informe um e-mail válido para a equipe responder.");
  if(mode()==="arquivo"){
    const f = fileIn.files[0];
    if(!f) return fail("Escolha um arquivo do seu dispositivo.");
    if(!OK_EXT.includes((f.name.split(".").pop()||"").toLowerCase())) return fail("Envie o arquivo em PDF, JPG ou PNG. Se for Word ou Excel, salve como PDF antes.");
    if(f.size > 5*1048576) return fail("O arquivo passa de 5 MB. Reduza o tamanho ou envie um link.");
    g("o-url").value = "";
  } else {
    if(!/^https:\/\/[^\s]+\.[^\s]+/.test(g("o-url").value.trim())) return fail("Cole um link válido que comece com https://.");
    fileIn.value = "";
  }
  if(!g("o-ok").checked) return fail("Confirme que o documento não contém informações sensíveis.");
  if(db){
    e.preventDefault();
    g("o-btn").disabled = true; msg.className = "form-msg"; msg.textContent = "Enviando…";
    try {
      let arquivo_path = null, link = null;
      if(mode()==="arquivo"){
        const f = fileIn.files[0], ext = f.name.split(".").pop().toLowerCase();
        const slug = norm(ong).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "ong";
        arquivo_path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
        const up = await db.storage.from(BUCKET).upload(arquivo_path, f, {contentType: f.type || (ext==="pdf"?"application/pdf":"image/"+(ext==="jpg"?"jpeg":ext)), upsert:false});
        if(up.error) throw up.error;
      } else { link = g("o-url").value.trim(); }
      const ins = await db.from("documentos").insert({ong, categoria:g("o-cat").value, titulo:title, descricao:g("o-desc").value.trim()||null, link, arquivo_path, confirmado:true});
      if(ins.error) throw ins.error;
      form.reset(); pick(null); syncMode(); g("o-ong").value = ong;
      msg.className = "form-msg ok"; msg.textContent = "Documento publicado! Ele já aparece na lista de documentos.";
      await loadDbDocs();
    } catch(err){
      console.error(err);
      msg.className = "form-msg err"; msg.textContent = "Não foi possível enviar agora. Confira a conexão e tente de novo.";
    } finally { g("o-btn").disabled = false; }
    return;
  }
  g("o-subject").value = "[Transparência Social] Novo documento: " + ong;
  g("o-cat-name").value = catById[g("o-cat").value].name;
  msg.className = "form-msg"; msg.textContent = "Enviando…";
  g("o-btn").disabled = true;
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


/* Carrega os documentos enviados pelas ONGs */
async function loadDbDocs(){
  if(!db) return;
  const { data, error } = await db.from("documentos").select("id,created_at,ong,categoria,titulo,descricao,link,arquivo_path").order("created_at",{ascending:false}).limit(500);
  if(error){ console.error(error); return; }
  dbDocs = data.filter(r=>catById[r.categoria]).map(r=>{
    const href = r.arquivo_path ? db.storage.from(BUCKET).getPublicUrl(r.arquivo_path).data.publicUrl : (/^https:\/\//.test(r.link||"") ? r.link : "#");
    return {ong:r.ong, cat:r.categoria, title:r.titulo, desc:r.descricao||"", href, kind: r.arquivo_path ? (/\.pdf$/i.test(r.arquivo_path)?"pdf":"file") : "link"};
  });
  renderAll();
}

/* Navegação */
const pages = ["home","documentos","integrantes","contato"];
const nav = document.getElementById("nav"), menuBtn = document.querySelector(".menu-btn");
function route(){
  const h = location.hash.slice(1);
  const p = (h==="publicar"||h==="enviado") ? "documentos" : (pages.includes(h) ? h : "home");
  pages.forEach(x=>document.getElementById("page-"+x).classList.toggle("active",x===p));
  document.querySelectorAll("[data-link]").forEach(a=>{a.dataset.link===p?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
  if(p==="documentos") renderDocs();
  nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded","false");
  if(h==="enviado"){ const m=document.getElementById("o-msg"); m.className="form-msg ok"; m.textContent="Documento enviado! A equipe vai revisar e publicar no portal em breve."; }
  if(h==="publicar"||h==="enviado") requestAnimationFrame(()=>document.getElementById("publicar").scrollIntoView());
  else window.scrollTo(0,0);
}
menuBtn.onclick=()=>{const o=nav.classList.toggle("open");menuBtn.setAttribute("aria-expanded",o)};
window.addEventListener("hashchange",route);
renderAll();
route();
loadDbDocs();
