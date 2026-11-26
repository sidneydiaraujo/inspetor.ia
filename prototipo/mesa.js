// Inspetor Jirafalis · comportamento da mesa do dia (protótipo). Usa mesa-dados.js.
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plural = (n, s, p = s + "s") => `${n} ${n === 1 ? s : p}`;
const NIVEL = { junior: "júnior", pleno: "pleno", senior: "sênior", sim: "simulação", sem: "sem nível" };
const nivelTag = n => `<span class="nivel ${n === "sem" ? "sim" : n}">${NIVEL[n]}</span>`;
const MOTIVOS = ["valor errado", "item é exceção", "hora errada", "pessoa errada", "já resolvido"];
const TONS = ["#e8b456", "#8fb6dc", "#6cc4b2", "#d9a3c7", "#c8b27a", "#a5d36c"];
const tom = n => TONS[[...n].reduce((s, c) => s + c.charCodeAt(0), 0) % TONS.length];
const iniciais = n => n.split(" ").map(p => p[0]).slice(0, 2).join("");

// Estado do protótipo (no produto, vem do servidor)
const S = {
  dec: {}, com: {}, pre: {}, motivo: {}, chat: {}, vistos: new Set(), fechados: new Set(), desligadas: new Set(["R24"]),
  gravacoes: [...ESPACO.gravacoes], ativo: true, mapa: true, janela: null, pmAbertas: new Set(), pmBusca: "", logBusca: "", saude: {},
  tarja: location.hash === "#tarja", promovidas: new Set(), rascunho: {},
};
MUDANCAS.forEach(g => g.itens.forEach(i => { if (i.eufaco) S.dec[chave("m", g.regra, i.card)] = "liberado"; }));
COMENTARIOS.forEach(g => g.itens.forEach(i => { if (i.eufaco || i.liberado) S.com[chave("c", g.cod, i.card)] = "liberado"; }));
CAMPOS.forEach(g => g.itens.forEach(i => { if (i.dispensado) S.pre[chave("p", g.cod, i.card)] = { estado: "suspenso" }; }));
function chave(t, r, c) { return `${t}|${r}|${c}`; }

function toast(t) { const d = document.createElement("div"); d.className = "toast"; d.textContent = t; $("toasts").appendChild(d); setTimeout(() => d.remove(), 3800); }
function confirmar({ titulo, texto = "", itens = [], ok = "Confirmar" }) {
  return new Promise(res => {
    const c = $("confirmar");
    c.firstElementChild.innerHTML = `<h3>${esc(titulo)}</h3><p>${esc(texto)}</p>${itens.length ? `<ul>${itens.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
      <div class="botoes"><button class="btn" data-r="0">Cancelar</button><button class="btn forte" data-r="1">${esc(ok)}</button></div>`;
    c.classList.add("on");
    c.onclick = ev => { const b = ev.target.closest("[data-r]"); if (!b && ev.target !== c) return; c.classList.remove("on"); res(b?.dataset.r === "1"); };
  });
}
// Card: abre o caso no Investigar (task de um time) ou a visão geral (épico)
const idPessoa = n => (n - 100) % 7 === 0 && n >= 100 && (n - 100) / 7 < 27 ? (n - 100) / 7 : null;
const card = n => `<button class="k" data-card="${n}" title="${idPessoa(n) !== null ? "Abrir o caso no Investigar" : "Abrir no Investigar"}">#${n}</button>`;
const rostos = ps => `<span class="rostos" title="Marca: ${esc(ps.join(", "))}">${ps.slice(0, 3).map(p => `<span class="rosto" style="background:${tom(p)}">${iniciais(p)}</span>`).join("")}</span>`;
const ico = (txt, titulo, dados, cls = "") => `<button class="ico ${cls}" title="${esc(titulo)}" aria-label="${esc(titulo)}" ${dados}>${txt}</button>`;
const quando = () => S.ativo ? `às ${proxima()}` : "quando você gravar (agenda desligada)";
function proxima() { const agora = "15:12"; return [...S.gravacoes].sort().find(h => h > agora) || S.gravacoes[0]; }

// ---------- Topo ----------
function topo() {
  $("sub").textContent = `${ESPACO.cards} cards lidos · 9 times`;
  $("ronda").innerHTML = ronda();
  const q = SAUDE, r = 15, volta = 2 * Math.PI * r, cor = q.pct >= 85 ? "var(--acacia)" : q.pct >= 65 ? "var(--ambar)" : "var(--perigo)";
  $("disco").innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="${r}" class="trilho"/><circle cx="20" cy="20" r="${r}" class="arco" style="stroke:${cor}" stroke-dasharray="${(volta * q.pct / 100).toFixed(1)} ${volta.toFixed(1)}" transform="rotate(-90 20 20)"/><text x="20" y="21.5" text-anchor="middle" dominant-baseline="middle">${q.pct}%</text></svg>
    <span><b>Saúde da escrita</b><small>${plural(q.criticos, "crítico")} · ${q.cards} cards</small></span>`;
  $("ag-ativo").checked = S.ativo;
}
const emH = s => { const [a, b] = s.split(":").map(Number); return a + b / 60; };
function ronda() {
  const ini = 7, fim = 21, x = v => ((v - ini) / (fim - ini) * 100).toFixed(2) + "%", agora = emH("15:12"), [li, lf] = ESPACO.leitura.map(emH);
  let s = `<svg role="img" aria-label="Ronda do dia"><line x1="0" x2="100%" y1="24" y2="24" stroke="var(--linha)" stroke-width="2"/>
    <line x1="0" x2="${x(agora)}" y1="24" y2="24" stroke="var(--ambar-escuro)" stroke-width="2"/>
    <rect x="${x(li)}" y="15" width="${((lf - li) / (fim - ini) * 100).toFixed(2)}%" height="18" rx="9" fill="rgba(243,233,218,.04)" stroke="var(--linha)" stroke-dasharray="3 3"><title>Lê a ferramenta sozinho das ${ESPACO.leitura[0]} às ${ESPACO.leitura[1]}</title></rect>`;
  for (let t = li; t <= lf; t += .5) s += `<circle cx="${x(t)}" cy="24" r="${t % 1 ? 1.6 : 2.4}" fill="${t <= agora ? "var(--ambar)" : "var(--apagado)"}"/>`;
  for (let t = 8; t <= 20; t += 2) s += `<text x="${x(t)}" y="47" text-anchor="middle" fill="var(--apagado)" font-size="10.5">${t}h</text>`;
  s += `<line x1="${x(agora)}" x2="${x(agora)}" y1="12" y2="32" stroke="var(--ambar)" stroke-width="2"/><text x="${x(agora)}" y="9" text-anchor="middle" fill="var(--ambar)" font-size="11" font-weight="700">lido ${ESPACO.lido}</text>`;
  const cor = S.ativo ? "var(--acacia)" : "var(--apagado)";
  S.gravacoes.forEach(g => { s += `<g class="ponto" data-grav="${g}"><title>Gravação das ${g} (clique para tirar)</title><rect x="${x(emH(g))}" y="17" width="13" height="13" rx="3" fill="${cor}" style="transform-box:fill-box;transform-origin:center;transform:translateX(-6.5px) rotate(45deg)"/><text x="${x(emH(g))}" y="9" text-anchor="middle" fill="${cor}" font-size="11" font-weight="700">grava ${g}</text></g>`; });
  return s + (S.ativo ? "" : `<text x="100%" y="47" text-anchor="end" fill="var(--apagado)" font-size="10.5">gravação desligada</text>`) + "</svg>";
}

// ---------- Avisos e tarja ----------
function avisos() {
  const a = [];
  if (S.tarja) a.push(`<div class="tarja" role="alert"><div><b>Regra R23 · Time herdado do épico · sênior · gravou o valor errado</b>
    <small>Onde: #219 "Push de pedido", Time = Plataforma, hoje 14:05 · Como soube: verificação depois de gravar (o responsável é do time Mobile)</small>
    <small>Já feito: valor desfeito (voltou a vazio) · a ação voltou a júnior · o cérebro abriu uma proposta de melhoria</small></div>
    <div class="acoes"><button class="btn mini" data-janela="log">Ver no log</button><a class="btn mini" href="regras.html#cerebro">Ver a proposta</a><button class="btn mini" id="tarja-vi">Vi</button></div></div>`);
  AUTONOMIA.filter(f => f[7] && !S.promovidas.has(f[0])).forEach(f => a.push(`<div class="aviso">A regra ${f[0]} (${esc(f[1])}) está pronta para pleno no ${f[2]}: ${esc(f[6].split(": ")[1])}. Promova no Mapa das regras, em Autonomia.</div>`));
  if (!S.ativo) a.push(`<div class="aviso">Gravação agendada desligada: nada é gravado sozinho até você ligar de novo. A leitura continua.</div>`);
  $("avisos").innerHTML = a.join("");
}

// ---------- Grupo (cabeçalho que abre e fecha, com ações do grupo) ----------
function grupo(raia, cod, nome, n, linhas, acoes = "", extra = "", prio = false) {
  const id = `${raia}-${cod}`, f = S.fechados.has(id);
  return `<div class="grupo ${f ? "fechado" : ""} ${prio ? "prio" : ""}" id="g-${id}"><div class="grupo-cab" data-grupo="${id}">
    <span class="seta">▾</span><span class="cod">${esc(cod)}</span><span class="nome" title="${esc(nome)}">${esc(nome)}</span><span class="qt">${n}${extra}</span><span class="dir">${acoes}</span></div>
    <div class="linhas">${linhas}</div></div>`;
}
const duplo = (st, dados, sim = "✓", rotSim = "Liberar") =>
  ico(sim, st === "liberado" ? `Liberado: grava ${quando()} (clique para desfazer)` : rotSim, `${dados} data-st="${st === "liberado" ? "pendente" : "liberado"}"`, "sim" + (st === "liberado" ? " on" : "")) +
  ico("❚❚", "Suspender (não conta contra a regra)", `${dados} data-st="suspenso"`, "nao");
function linhaSuspensa(k, c, titulo) {
  return `<div class="linha suspenso">${card(c)}<div class="t"><div>${esc(titulo)}</div><div class="det">Suspenso: sai da tela e fica no log.</div></div><span></span>
    <div class="acoes">${ico("↶", "Trazer de volta", `data-k="${k}" data-st="pendente"`)}</div>
    <div class="motivos">Por quê? (opcional, ensina o cérebro): ${MOTIVOS.map(m => `<button data-motivo="${k}" data-m="${m}" class="${S.motivo[k] === m ? "on" : ""}">${m}</button>`).join("")}</div></div>`;
}
const seloPleno = n => n === "pleno" ? ` · <span class="selo-pleno">🤖 pleno</span>` : "";
function euFiz(raia) {
  const fs = EUFIZ[raia].filter(f => !S.vistos.has(raia + f.card + f.regra));
  if (!fs.length) return "";
  return grupo(raia, "Eu fiz", "o que o Jirafalis gravou sozinho (pleno)", fs.length,
    fs.map(f => `<div class="linha feito">${card(f.card)}<div class="t"><div>${esc(f.titulo)}</div><div class="det">${esc(f.oque)} · regra ${f.regra}</div></div><span></span>
      <div class="acoes"><span class="carimbo">🤖 Eu fiz ${f.em}</span>${ico("↶", "Desfazer (foto do antes; a ação volta a júnior)", `data-desfazer="${f.card}"`)}${ico("◌", "Ok, vi", `data-visto="${raia + f.card + f.regra}"`)}</div></div>`).join(""),
    ico("✓✓", "Ok, vi todos", `data-vistos="${raia}"`));
}

// ---------- Raias ----------
function raia(n, titulo, sub, corpo, extra = "") {
  return `<div class="raia-topo"><span class="n">${n}</span><div><h2>${titulo}</h2><p>${sub}</p></div><div class="acoes">${extra}</div></div><div class="raia-corpo">${corpo}</div>`;
}
function raiaMudancas() {
  let n = 0, susp = 0;
  const grupos = MUDANCAS.filter(g => !S.desligadas.has(g.regra)).map(g => {
    const linhas = g.itens.map(i => {
      const k = chave("m", g.regra, i.card), st = S.dec[k] || "pendente";
      if (st === "suspenso") { susp++; return linhaSuspensa(k, i.card, i.titulo); }
      n++;
      const acoes = i.eufaco && st === "liberado" ? `<span class="carimbo eufaco" title="Regra pleno: liberou sozinho e grava ${quando()}">🤖 Eu faço</span>${ico("❚❚", "Suspender (o Jirafalis não faz)", `data-k="${k}" data-st="suspenso"`, "nao")}` : duplo(st, `data-k="${k}"`);
      return `<div class="linha ${st}">${card(i.card)}<div class="t"><div title="${esc(i.motivo)}">${esc(i.titulo)}</div>
        <div class="det"><span class="valor">${esc(i.campo)}: <span class="de">${esc(i.de)}</span>→<span class="para">${esc(i.para)}</span></span></div></div><span></span><div class="acoes">${acoes}</div></div>`;
    }).join("");
    const ks = esc(JSON.stringify(g.itens.map(i => chave("m", g.regra, i.card))));
    return grupo("mud", g.regra, g.nome, g.itens.length, linhas, ico("✓✓", "Liberar todas", `data-lote="liberado" data-ks='${ks}'`, "sim") + ico("❚❚", "Suspender todas", `data-lote="suspenso" data-ks='${ks}'`, "nao"), seloPleno(g.nivel) + (g.nova ? " · nova" : ""));
  });
  return raia(n, "Mudanças no quadro", `o Jirafalis grava o que você liberar${susp ? `, ${plural(susp, "suspensa")} (no log)` : ""}`, euFiz("mud") + grupos.join(""));
}
function desvio(d) { return `<span class="desvio ${d >= 10 ? "velho" : d >= 3 ? "medio" : ""}" title="Com o desvio há ${d} dias">${d ? `há ${d}d` : "hoje"}</span>`; }
function situacao(i) {
  if (i.retorno === "sem") return `<span class="semretorno">Sem retorno ao recado de 21/11 09:03 (enviar de novo)</span>`;
  if (i.retorno) return `<span class="respondido">Recado atendido por ${esc(i.retorno.autor)}, com inconsistência:</span> ${esc(i.retorno.falta)}`;
  return esc(i.det);
}
function botaoChat(g, i) {
  if (!i.chat) return "";
  const k = chave("t", g.cod, i.card);
  return S.chat[k] ? `<span class="chat-btn feito" title="Já enviado: não sai de novo">✓ chat ${S.chat[k]}</span>`
    : `<button class="chat-btn" data-chat="${k}" data-onde="${esc(i.chat)}" title="Enviar ao chat do time ${esc(i.chat)}. Não comenta no item.">➤ chat</button>`;
}
function raiaComentarios() {
  let n = 0, susp = 0, nPrio = 0;
  const vis = COMENTARIOS.filter(g => !S.desligadas.has(g.cod));
  const html = vis.map(g => {
    const linhas = g.itens.map(i => {
      const k = chave("c", g.cod, i.card), st = S.com[k] || "pendente";
      if (st === "suspenso") { susp++; return linhaSuspensa(k, i.card, i.titulo); }
      n++; if (g.prio) nPrio++;
      const acoes = botaoChat(g, i) + (i.eufaco && st === "liberado" ? `<span class="carimbo eufaco">🤖 Eu faço</span>${ico("❚❚", "Suspender", `data-k="${k}" data-st="suspenso"`, "nao")}` : duplo(st, `data-k="${k}"`, "💬", "Liberar comentário"));
      return `<div class="linha ${st}">${card(i.card)}<div class="t"><div>${desvio(i.desde)}${esc(i.titulo)}</div><div class="det">${situacao(i)}</div></div>${rostos(i.pessoas)}<div class="acoes">${acoes}</div></div>`;
    }).join("");
    const ks = esc(JSON.stringify(g.itens.map(i => chave("c", g.cod, i.card))));
    const lib = g.itens.filter(i => S.com[chave("c", g.cod, i.card)] === "liberado").length;
    return { prio: g.prio, html: grupo("com", g.cod, g.nome, g.itens.length, linhas, ico("💬", "Liberar comentário de todos", `data-lote="liberado" data-ks='${ks}'`, "sim") + ico("❚❚", "Suspender todos", `data-lote="suspenso" data-ks='${ks}'`, "nao"), (lib ? `, ${lib} liberado${lib > 1 ? "s" : ""}` : "") + seloPleno(g.nivel), g.prio) };
  });
  const prio = html.filter(h => h.prio).map(h => h.html).join(""), resto = html.filter(h => !h.prio).map(h => h.html).join("");
  const soVer = grupo("com", "Só ver", "Relatório, sem comentário", SO_VER.length, SO_VER.map(s => `<div class="linha">${card(s.card)}<div class="t"><div>${esc(s.titulo)}</div><div class="det">${esc(s.det)}</div></div><span></span><span></span></div>`).join(""));
  const gs = grupo("com", "R27", "Acompanhamento diário no chat da gestão", 4, `<div class="gs">${ACOMPANHAMENTO.listas.map(([t, e, l]) => `<b>${t}</b><span>${e}</span>${l.map(x => `<div>${esc(x)}</div>`).join("")}`).join("")}</div>`,
    `<span class="chat-btn feito">✓ chat ${ACOMPANHAMENTO.enviado}</span><button class="chat-btn" data-g01="1">➤ Enviar o acompanhamento</button>`);
  const sub = `${nPrio} obrigatórios ou urgentes · um por card, com @ de quem resolve · ${RETORNO}${susp ? `, ${plural(susp, "suspenso")} (no log)` : ""} · 17 antigos fora da janela de recência`;
  return raia(n, "Comentários que marcam pessoas", sub, euFiz("com") + (prio ? `<div class="divisa prio">▲ Obrigatório ou urgente: resolver primeiro (${nPrio})</div>${prio}` : "") + `<div class="divisa">Os demais</div>${resto}${soVer}${gs}`);
}
function raiaCampos() {
  let total = 0;
  const html = CAMPOS.filter(g => !S.desligadas.has(g.cod)).map(g => {
    const ver = S.verDisp?.has(g.cod);
    const disp = g.itens.filter(i => S.pre[chave("p", g.cod, i.card)]?.estado === "suspenso").length;
    total += g.itens.length;
    const linhas = g.itens.map(i => {
      const k = chave("p", g.cod, i.card), p = S.pre[k] || {}, st = p.estado || "pendente";
      if (st === "suspenso" && !ver) return "";
      const valor = S.rascunho[k] ?? p.valor ?? "";
      const campo = i.data ? `<input type="date" data-pre="${k}" value="${esc(valor)}" aria-label="${esc(i.campo)}">`
        : i.opcoes.map(o => `<label class="pilula"><input type="radio" name="${k}" data-pre="${k}" value="${esc(o)}" ${valor === o ? "checked" : ""}>${esc(o)}</label>`).join("");
      const det = st === "liberado" ? `<span class="carimbo">✓ grava “${esc(p.valor)}” ${quando()}</span>` : st === "suspenso" ? "dispensado" : esc(i.campo);
      return `<div class="linha dupla ${st}">${card(i.card)}<div class="t"><div>${esc(i.titulo)}</div><div class="det">${det}</div></div>
        <div class="campo-pre">${campo}</div><div class="acoes">${ico("✓", "Liberar", `data-pk="${k}" data-st="${st === "liberado" ? "pendente" : "liberado"}"`, "sim" + (st === "liberado" ? " on" : ""))}${ico("✕", st === "suspenso" ? "Trazer de volta" : "Dispensar", `data-pk="${k}" data-st="${st === "suspenso" ? "pendente" : "suspenso"}"`, "nao" + (st === "suspenso" ? " on" : ""))}</div></div>`;
    }).join("") || `<div class="vazio">Todos dispensados.</div>`;
    return grupo("cam", g.cod, g.nome, g.itens.length, linhas, disp ? ico(ver ? "◌" : "◉", `${ver ? "Esconder" : "Mostrar"} os dispensados (${disp})`, `data-verdisp="${g.cod}"`) : "", disp ? `, ${disp} dispensado${disp > 1 ? "s" : ""}` : "");
  }).join("");
  return raia(total, "Campos vazios", "escreva o que já sabe e o Jirafalis grava", html);
}

// ---------- Mapa das regras ----------
const FORMAS = ["22px 30px 18px 34px / 26px 20px 30px 22px", "30px 18px 32px 20px / 20px 30px 18px 28px", "18px 34px 24px 26px / 30px 18px 28px 20px", "26px 22px 34px 16px / 18px 28px 22px 32px"];
function manchas(raia, grupos, cor) {
  return `<div class="manchas">${grupos.map((g, i) => `<button class="mancha ${g.feito ? "feita" : ""}" data-ir="${raia}-${g.cod}" style="--cor:${cor};--peso:${Math.min(g.n, 25)};--forma:${FORMAS[i % 4]}" title="${esc(g.nome)}"><b>${g.n}</b><span>${esc(g.cod)} ${esc(g.nome)}</span></button>`).join("")}</div>`;
}
function mapa() {
  const mud = MUDANCAS.filter(g => !S.desligadas.has(g.regra)).map(g => ({ cod: g.regra, nome: g.nome, n: g.itens.length, feito: g.itens.every(i => S.dec[chave("m", g.regra, i.card)]) }));
  const com = COMENTARIOS.filter(g => !S.desligadas.has(g.cod)).map(g => ({ cod: g.cod, nome: g.nome, n: g.itens.length, feito: g.itens.every(i => S.com[chave("c", g.cod, i.card)]) }));
  const cam = CAMPOS.map(g => ({ cod: g.cod, nome: g.nome, n: g.itens.length, feito: g.itens.every(i => S.pre[chave("p", g.cod, i.card)]) }));
  const fichas = AUTONOMIA.map(f => {
    const [cod, nome, acao, cls, nv0, barra, texto, pronta] = f, nv = S.promovidas.has(cod) && pronta ? "pleno" : nv0;
    const botao = pronta && !S.promovidas.has(cod) ? ico("🎓", "Promover a pleno", `data-promover="${cod}"`, "sim") : nv === "pleno" ? ico("↶", "Voltar a júnior", `data-rebaixar="${cod}"`) : "";
    return `<div class="ficha ${nv} ${pronta && !S.promovidas.has(cod) ? "pronta" : ""}"><span class="cod">${cod}</span><div class="t"><b>${esc(nome)}</b> <span class="risco">${cls}</span> <span class="det">${acao}</span><div class="det">${esc(nv !== nv0 ? "promovida a pleno agora" : texto)}</div></div>
      <span>${nivelTag(nv)}${botao}</span><div class="barra"><i style="width:${Math.round((nv !== nv0 ? 0 : barra) * 100)}%"></i></div></div>`;
  }).join("");
  return `<button class="entrada" data-janela="permissoes"><span class="ic">⛨</span><span><b>Permissões</b><small>${S.desligadas.size ? plural(S.desligadas.size, "regra desligada", "regras desligadas") : "todas as regras ligadas"}</small></span><span class="seta">›</span></button>
    <div><h3>✎ Mudanças no quadro</h3>${manchas("mud", mud, "var(--mud)")}</div>
    <div><h3>💬 Comentários que marcam pessoas</h3>${manchas("com", com, "var(--com)")}</div>
    <div><h3>▭ Campos vazios</h3>${manchas("cam", cam, "var(--cam)")}</div>
    <div><h3>🎓 Autonomia das regras · por ação</h3><div class="fichas">${fichas}</div></div>
    <div style="display:grid;gap:6px"><a class="link-apoio" href="regras.html#cerebro">Cérebro: 2 propostas de melhoria <span>›</span></a>
      <a class="link-apoio" href="regras.html#nova">Nova regra (com o Claude ou pelo formulário) <span>›</span></a>
      <a class="link-apoio" href="regras.html#regras">Ficha completa de cada regra <span>›</span></a></div>
    <p class="det" style="color:var(--apagado);font-size:11.5px;margin:0">Sênior faz sozinho e não reporta: não aparece na mesa. Se errar com efeito, vira a tarja vermelha no topo (<a href="mesa.html#tarja" onclick="setTimeout(()=>location.reload())" style="color:var(--perigo)">ver exemplo</a>).</p>`;
}

// ---------- Rodapé ----------
function rodape() {
  const regras = ["R01", "R02", "R03", "R04", "R05", "R06", "R07", "R09", "R10", "R13", "R23", "R25"].map(c => {
    const sim = c === "R25", tem = MUDANCAS.some(g => g.regra === c) || COMENTARIOS.some(g => g.cod === c);
    return `<span class="selinho ${tem ? "tem" : ""} ${sim ? "sim" : ""}" title="Regra ${c}${sim ? " · em simulação: só mostra o que faria (hoje: 3 itens)" : ""}"><i></i>${c}</span>`;
  }).join("");
  const b = (j, t, cls = "") => `<button class="btn mini ${cls} ${S.janela === j ? "sel" : ""}" data-janela="${j}">${t}</button>`;
  return `<span>⛨ Regras que gravam</span><div class="selinhos">${regras}</div><div class="dir">
    ${b("conferir", `☑ Conferir ${CONFERIR.length}`)}${b("times", `◔ Confiança por time ${TIMES_NOTA.length}`)}${b("entregas", `🚀 Entregas de ontem ${ENTREGAS.reduce((s, g) => s + g[2].length, 0)}`, "alerta")}${b("depois", `⏱ Depois ${DEPOIS.length}`)}${b("log", "☰ Log")}${b("chat", "💬 Chat")}</div>`;
}

// ---------- Janelas ----------
function janela(qual) {
  const cab = (t, p) => `<div class="j-cab"><div><h2>${t}</h2>${p}</div><button class="ico" data-fechar="1" aria-label="Fechar">✕</button></div>`;
  if (qual === "permissoes") {
    const b = S.pmBusca.toLowerCase(), todas = TEMAS.flatMap(t => t[1]);
    const corpo = TEMAS.map(([tema, rs]) => {
      const l = rs.filter(r => !b || (r[0] + " " + r[1] + " " + tema).toLowerCase().includes(b));
      if (!l.length) return "";
      return `<h3>${tema} <span style="text-transform:none;font-weight:400">· ${plural(l.length, "regra")}</span></h3>` + l.map(([c, n, nv]) => {
        const off = S.desligadas.has(c), ab = S.pmAbertas.has(c);
        return `<div class="pm ${off ? "desligada" : ""} ${ab ? "aberta" : ""}"><div class="pm-topo"><span class="cod">${c}</span><button class="nome" data-pm="${c}" style="border:0;background:none;text-align:left;padding:0"><b>${esc(n)}</b> ${nivelTag(nv)}<small>${off ? "desligada desde 20/11" : "ligada"}</small></button>
          <label class="switch" title="${off ? "Desligada: clique para ligar" : "Ligada: clique para desligar"}"><input type="checkbox" data-perm="${c}" ${off ? "" : "checked"}><i></i></label></div>
          <div class="pm-texto"><b>O que faz:</b> ${esc(n)}. <b>Tema:</b> ${tema}. <b>Nível:</b> ${NIVEL[nv]}. Desligada, a regra não é avaliada nas leituras: some da mesa o que ela achou, não grava e não envia ao chat.</div></div>`;
      }).join("");
    }).join("");
    return cab("Permissões", `<p>${todas.length - S.desligadas.size} de ${todas.length} regras ligadas. Clique na regra para ler o texto completo.</p><input class="busca" id="pm-busca" type="search" placeholder="Buscar por código, nome ou tema" value="${esc(S.pmBusca)}">`) + `<div class="j-corpo" id="pm-corpo">${corpo}</div>`;
  }
  if (qual === "saude") {
    const q = SAUDE, abertos = q.achados.filter(a => !S.saude[a.card]);
    return cab("Saúde da escrita dos campos", `<p>${q.cards} cards avaliados · <i class="g critico"></i> ${q.criticos} · <i class="g urgente"></i> ${q.urgentes} · <i class="g atencao"></i> ${q.atencao}</p><p>Crítico ou confirmado por você vira comentário com @ (regra R15). Cada decisão vira experiência: o inspetor aprende o que é problema no seu processo.</p>`)
      + `<div class="j-corpo">${abertos.map(a => `<div class="cartao"><div class="topo-c">${card(a.card)}<b>${esc(a.titulo)}</b><span class="chip">${a.status}</span><span style="margin-left:auto;font-weight:700">${a.saude}%</span></div>
        ${a.itens.map(([g, campo, porque, exp]) => `<div><i class="g ${g}"></i> <b>${campo}</b><div>${esc(porque)}</div><small>${esc(exp)}</small></div>`).join("")}
        <div class="acoes" style="justify-content:flex-start">${a.card === 254 ? `<button class="btn mini" data-saude="${a.card}" data-d="guardar">✓ É cliente: guardar</button><button class="btn mini" data-saude="${a.card}" data-d="cobrar">✕ Não é cliente: cobrar</button>` : `<button class="btn mini" data-saude="${a.card}" data-d="aceitar">✓ Aceitar: é um problema</button><button class="btn mini" data-saude="${a.card}" data-d="ignorar">✕ Ignorar</button>`}</div></div>`).join("") || `<div class="vazio"><b>Nada para decidir</b>Tudo o que apareceu você já decidiu.</div>`}</div>`;
  }
  if (qual === "times") {
    const anel = n => { const r = 22, v = 2 * Math.PI * r, c = n >= 75 ? "var(--acacia)" : n >= 50 ? "var(--ambar)" : "var(--perigo)";
      return `<svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="${r}" fill="none" stroke="var(--linha)" stroke-width="5"/><circle cx="28" cy="28" r="${r}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(v * n / 100).toFixed(1)} ${v.toFixed(1)}" transform="rotate(-90 28 28)"/><text x="28" y="30" text-anchor="middle" fill="var(--ink)" font-size="12" font-weight="700">${n}%</text></svg>`; };
    const media = Math.round(TIMES_NOTA.reduce((s, t) => s + t[1], 0) / TIMES_NOTA.length);
    return cab("Confiança dos dados por time", `<p>${TIMES_NOTA.length} times · média ${media}% · quanto do que cada time escreve deixa medir o trabalho (regras, telas, integrações, riscos). Boa a partir de 75%, parcial a partir de 50%.</p>`)
      + `<div class="j-corpo"><div class="grade-times">${TIMES_NOTA.map(([t, n, nv, falta]) => `<div class="time-nota">${anel(n)}<div><b>${t}</b><span style="color:var(--mudo)">${nv}</span></div><small>${falta ? "Falta: " + falta : "Nada relevante faltando."}</small></div>`).join("")}</div></div>`;
  }
  if (qual === "entregas") {
    const cor = { nao: "var(--perigo)", pend: "var(--ambar)", ok: "var(--acacia)" };
    return cab("Entregas de ontem", `<p>O que devia ter ido para produção no último dia útil (21/11). Abre sozinha uma vez por dia quando há algo para olhar. Onde uma regra já cobra a falha, o Liberar daqui é o mesmo da mesa.</p>`)
      + `<div class="j-corpo">${ENTREGAS.map(([g, t, its]) => `<h3 style="color:${cor[g]}">${t} · ${its.length}</h3>${its.map(i => `<div class="cartao"><div class="topo-c">${card(i.card)}<b>${esc(i.titulo)}</b></div><small>${esc(i.sub)}</small>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${i.ch.map(([n, ok, txt]) => `<span class="chip ${ok ? "ok" : "falha"}" title="${esc(txt)}">${ok ? "✓" : "✕"} ${n}</span>`).join("")}</div>
        ${i.ch.filter(c => !c[1]).map(c => `<div>• ${esc(c[2])}</div>`).join("")}${i.regra ? `<div class="acoes" style="justify-content:space-between"><small>Regra ${esc(i.regra)}</small><button class="btn mini">💬 Liberar comentário</button></div>` : ""}</div>`).join("")}`).join("")}</div>`;
  }
  if (qual === "log") {
    const b = S.logBusca.toLowerCase().replace(/^r(?=\d)/, "");
    const corpo = LOG.map(([h, ex, orig, ls]) => {
      const l = ls.filter(x => !b || (x[1] + " " + x[2] + " " + x[3] + " " + x[5]).toLowerCase().includes(b));
      if (!l.length) return "";
      return `<div class="exec"><b>Execução ${ex} · ${h}</b><small style="color:var(--mudo)">${orig} · ${plural(l.length, "escrita")}</small><button class="btn mini" style="margin-left:auto" data-desfazexec="${ex}">↶ Desfazer esta execução</button></div>`
        + l.map(([hh, r, c, oque, res, mot]) => `<div class="lg"><span class="h">${hh}</span><span class="cod">${r}</span><div>${card(c)} ${esc(oque)}<small><span class="r-${res}">${res}</span>${mot ? " · " + esc(mot) : ""}</small></div></div>`).join("");
    }).join("");
    return cab("Log de escritas", `<p>Tudo o que o Jirafalis gravou, pulou ou errou, por execução, com a foto do antes. Inclui o que as regras sênior fizeram sem reportar e o que você suspendeu (com o motivo, se deu).</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><input class="busca" id="log-busca" type="search" placeholder="Buscar regra (16, R21) ou card (#247)" value="${esc(S.logBusca)}"><span class="chip" style="align-self:center;margin-top:6px">de 19/11 a 22/11 ▾</span></div>`) + `<div class="j-corpo" id="log-corpo">${corpo || `<div class="vazio">Nada com essa busca.</div>`}</div>`;
  }
  if (qual === "chat") {
    const modo = m => `<select>${[["automatico", "Automático"], ["agendado", "Agendado"], ["botao", "Pelo botão"]].map(([v, t]) => `<option ${v === m ? "selected" : ""}>${t}</option>`).join("")}</select>`;
    return cab("Chat do time", `<p>Como cada regra fala no chat (Slack, Teams, Google Chat): automático depois de cada leitura, agendado ou só pelo seu botão. A agenda do chat é própria: não segue a linha do tempo das gravações.</p>`)
      + `<div class="j-corpo"><h3>Regras</h3>${CHAT_REGRAS.map(([c, n, m, d, ag]) => `<div class="tm"><span class="cod">${c}</span><b>${esc(n)}</b>${modo(m)}<small style="color:var(--mudo)">${esc(d)} · ${ag}</small></div>`).join("")}
        <h3>Chats</h3>${CHATS.map(([n, st, usos]) => `<div class="cartao"><div class="topo-c"><b>${esc(n)}</b><span class="chip ${st === "pronto" ? "ok" : "falha"}">${st === "pronto" ? "endereço cadastrado" : "sem endereço"}</span><small>${usos ? "usado por " + usos : ""}</small><span style="margin-left:auto"><button class="btn mini">Editar</button> <button class="btn mini">Testar</button></span></div></div>`).join("")}
        <h3>Remover post</h3><div class="cartao"><small>Cole o link do post para trocá-lo por "Mensagem removida pelo Inspetor Jirafalis." (o chat não deixa apagar o que a automação postou).</small></div></div>`;
  }
  const lista = qual === "conferir" ? ["Para você conferir", CONFERIR] : ["Ficam para a rodada seguinte", DEPOIS];
  return cab(lista[0], "") + `<div class="j-corpo">${lista[1].map(([c, t]) => `<div class="cartao"><div class="topo-c">${card(c)}<span>${esc(t)}</span></div></div>`).join("")}</div>`;
}
function abrir(qual) {
  S.janela = qual; $("janela").innerHTML = qual ? janela(qual) : ""; $("janela").classList.toggle("on", !!qual); $("fundo").classList.toggle("on", !!qual);
  $("rodape").innerHTML = rodape();
}

// ---------- Desenho geral ----------
function desenhar() {
  topo(); avisos();
  $("corpo").classList.toggle("sem-mapa", !S.mapa);
  const nM = $("raia-mud") && MUDANCAS.reduce((s, g) => s + g.itens.length, 0), nC = COMENTARIOS.reduce((s, g) => s + g.itens.length, 0), nP = CAMPOS.reduce((s, g) => s + g.itens.length, 0);
  const peso = n => n <= 3 ? .75 : n <= 10 ? 1 : 1.25;
  $("mesa").style.setProperty("--colunas", `minmax(280px, ${peso(nM)}fr) minmax(380px, ${peso(nC) * 1.3}fr) minmax(320px, ${peso(nP)}fr)`);
  $("raia-mud").innerHTML = raiaMudancas(); $("raia-com").innerHTML = raiaComentarios(); $("raia-cam").innerHTML = raiaCampos();
  $("mapa").innerHTML = mapa(); $("rodape").innerHTML = rodape();
  if (S.janela) $("janela").innerHTML = janela(S.janela);
}
function liberadas() {
  const l = [];
  MUDANCAS.forEach(g => g.itens.forEach(i => S.dec[chave("m", g.regra, i.card)] === "liberado" && l.push(`#${i.card} · ${i.campo}: ${i.de} → ${i.para}${i.eufaco ? " (pleno)" : ""}`)));
  CAMPOS.forEach(g => g.itens.forEach(i => S.pre[chave("p", g.cod, i.card)]?.estado === "liberado" && l.push(`#${i.card} · ${i.campo}: ${S.pre[chave("p", g.cod, i.card)].valor}`)));
  COMENTARIOS.forEach(g => g.itens.forEach(i => S.com[chave("c", g.cod, i.card)] === "liberado" && l.push(`#${i.card} · comentário ${g.cod} com @${i.pessoas.join(", @")}`)));
  return l;
}

// ---------- Cliques ----------
document.addEventListener("click", async ev => {
  const cab = ev.target.closest(".grupo-cab"), b = ev.target.closest("button, [data-grav]");
  if (cab && !ev.target.closest("button")) { const id = cab.dataset.grupo; S.fechados.has(id) ? S.fechados.delete(id) : S.fechados.add(id); return desenhar(); }
  if (ev.target.closest(".ronda") && !ev.target.closest("[data-grav]")) {
    const svg = $("ronda").querySelector("svg"), r = svg.getBoundingClientRect(), t = Math.round((7 + (ev.clientX - r.left) / r.width * 14) * 4) / 4;
    const novo = `${String(Math.floor(t)).padStart(2, "0")}:${String(Math.round(t % 1 * 60)).padStart(2, "0")}`;
    if (S.gravacoes.includes(novo)) return;
    if (S.gravacoes.length >= 6) return toast("No máximo 6 gravações por dia.");
    if (await confirmar({ titulo: `Criar um ponto de gravação às ${novo}?`, texto: "O Jirafalis grava, sozinho, as liberadas nesse horário.", itens: [...S.gravacoes, novo].sort(), ok: "Criar" })) { S.gravacoes.push(novo); desenhar(); }
    return;
  }
  if (!b) return;
  const d = b.dataset;
  if (d.grav) {
    if (S.gravacoes.length === 1) return toast("Deixe pelo menos um ponto de gravação, ou desligue a gravação na chave.");
    if (await confirmar({ titulo: `Tirar a gravação das ${d.grav}?`, texto: "O Jirafalis deixa de gravar as liberadas nesse horário.", ok: "Tirar" })) { S.gravacoes = S.gravacoes.filter(g => g !== d.grav); desenhar(); }
    return;
  }
  if (d.card) { const id = idPessoa(+d.card); location.href = id !== null ? `escala.html#p${id}` : "escala.html"; return; }
  if (d.fechar || b.id === "fechar-x") return abrir(null);
  if (d.janela) return abrir(S.janela === d.janela ? null : d.janela);
  if (b.id === "disco") return abrir(S.janela === "saude" ? null : "saude");
  if (b.id === "marca" || b.id === "fechar-mapa") { S.mapa = !S.mapa; return desenhar(); }
  if (b.id === "tarja-vi") { S.tarja = false; history.replaceState(null, "", "mesa.html"); return desenhar(); }
  if (b.id === "ler") { toast("Lendo a ferramenta e o git. A mesa atualiza quando terminar."); return; }
  if (b.id === "gravar") {
    const l = liberadas();
    if (!l.length) return toast("Nada liberado.");
    if (await confirmar({ titulo: "Gravar agora na ferramenta?", texto: "Relê cada item antes de gravar, guarda a foto do antes e grava de uma vez. Se a lista mudar com esta caixa aberta, não grava.", itens: l, ok: "Gravar" })) toast(`Gravando ${plural(l.length, "item", "itens")}. Tudo fica no log, por execução, com desfazer.`);
    return;
  }
  if (d.k) { const t = d.k[0] === "m" ? S.dec : S.com; t[d.k] = d.st; if (d.st !== "suspenso") delete S.motivo[d.k]; return desenhar(); }
  if (d.lote) { const ks = JSON.parse(d.ks), t = ks[0][0] === "m" ? S.dec : S.com; ks.forEach(k => t[k] = d.lote); return desenhar(); }
  if (d.motivo) { S.motivo[d.motivo] = S.motivo[d.motivo] === d.m ? undefined : d.m; toast(S.motivo[d.motivo] ? `Motivo guardado: ${d.m}. Suspender continua não contando contra a regra; o motivo alimenta o cérebro.` : "Motivo retirado."); return desenhar(); }
  if (d.chat) { if (await confirmar({ titulo: "Enviar ao chat do time?", texto: `Chat: ${d.onde}. Isso não comenta no item.`, ok: "Enviar" })) { S.chat[d.chat] = "22/11 15:14"; desenhar(); } return; }
  if (d.g01) { if (await confirmar({ titulo: "Enviar o acompanhamento diário?", texto: "Chat: Gestão de produto. Já saiu em 21/11 09:00; este é um novo envio.", itens: ACOMPANHAMENTO.listas.map(l => `${l[2].length} · ${l[0]}`), ok: "Enviar" })) toast("Acompanhamento enviado ao chat da gestão."); return; }
  if (d.pk) {
    const v = lerCampo(d.pk);
    if (d.st === "liberado" && !v) return toast("Preencha o campo antes de liberar, ou dispense se não tiver o valor.");
    S.pre[d.pk] = { estado: d.st, valor: d.st === "liberado" ? v : undefined }; delete S.rascunho[d.pk]; return desenhar();
  }
  if (d.verdisp) { S.verDisp ??= new Set(); S.verDisp.has(d.verdisp) ? S.verDisp.delete(d.verdisp) : S.verDisp.add(d.verdisp); return desenhar(); }
  if (d.visto) { S.vistos.add(d.visto); return desenhar(); }
  if (d.vistos) { EUFIZ[d.vistos].forEach(f => S.vistos.add(d.vistos + f.card + f.regra)); return desenhar(); }
  if (d.desfazer) { if (await confirmar({ titulo: `Desfazer o que foi gravado em #${d.desfazer}?`, texto: "Volta a foto do antes. Desfazer conta como erro cheio: a ação volta a júnior.", ok: "Desfazer" })) toast("Desfeito pela foto do antes. A ação voltou a júnior."); return; }
  if (d.ir) { const id = d.ir; S.fechados.delete(id); desenhar(); const el = $("g-" + id); if (el) { el.scrollIntoView({ block: "start", behavior: "smooth" }); el.classList.remove("pisca"); void el.offsetWidth; el.classList.add("pisca"); } return; }
  if (d.promover) { if (await confirmar({ titulo: `Promover a regra ${d.promover} a pleno?`, texto: "O Jirafalis passa a liberar sozinho os itens dela. Grava só nos pontos de gravação e aparece como \"Eu fiz\". Depois de 10 dias úteis em pleno, com todos os portões abertos, vira sênior sozinha.", ok: "Promover" })) { S.promovidas.add(d.promover); toast(`Regra ${d.promover} promovida a pleno.`); desenhar(); } return; }
  if (d.rebaixar) { if (await confirmar({ titulo: `Voltar a regra ${d.rebaixar} a júnior?`, texto: "Tudo dela volta a esperar o seu Liberar.", ok: "Voltar a júnior" })) toast(`Regra ${d.rebaixar} de volta a júnior.`); return; }
  if (d.pm) { S.pmAbertas.has(d.pm) ? S.pmAbertas.delete(d.pm) : S.pmAbertas.add(d.pm); $("pm-corpo").outerHTML = janela("permissoes").match(/<div class="j-corpo" id="pm-corpo">[\s\S]*$/)[0]; return; }
  if (d.saude) { S.saude[d.saude] = d.d; toast({ aceitar: "Guardado: o inspetor acertou; vira experiência e comentário R15.", ignorar: "Guardado: este valor não é mais cobrado.", guardar: "Guardado: é cliente; não cobro mais este nome.", cobrar: "Guardado: não é cliente; o aviso fica." }[d.d]); return abrir("saude"); }
  if (d.desfazexec) { if (await confirmar({ titulo: `Desfazer a execução ${d.desfazexec}?`, texto: "Cada escrita volta à foto do antes, se o item não mudou depois.", ok: "Desfazer" })) toast(`Execução ${d.desfazexec} desfeita.`); return; }
});
function lerCampo(k) { const els = [...document.querySelectorAll(`[data-pre="${CSS.escape(k)}"]`)]; if (!els.length) return S.rascunho[k] || ""; return els[0].type === "date" ? els[0].value : (els.find(x => x.checked)?.value || ""); }
document.addEventListener("input", ev => {
  const t = ev.target;
  if (t.dataset.pre) S.rascunho[t.dataset.pre] = lerCampo(t.dataset.pre);
  if (t.id === "pm-busca") { S.pmBusca = t.value; $("pm-corpo").outerHTML = janela("permissoes").match(/<div class="j-corpo" id="pm-corpo">[\s\S]*$/)[0]; }
  if (t.id === "log-busca") { S.logBusca = t.value; $("log-corpo").outerHTML = janela("log").match(/<div class="j-corpo" id="log-corpo">[\s\S]*$/)[0]; }
});
document.addEventListener("change", async ev => {
  const t = ev.target;
  if (t.dataset.perm) {
    const c = t.dataset.perm;
    if (!t.checked && !await confirmar({ titulo: `Desligar a regra ${c}?`, texto: "Ela deixa de ser avaliada nas leituras. O que ela achou sai da mesa, inclusive o que já estava liberado, e nada dela é gravado nem enviado ao chat até você ligar de novo.", ok: "Desligar" })) { t.checked = true; return; }
    t.checked ? S.desligadas.delete(c) : S.desligadas.add(c); toast(t.checked ? `Regra ${c} ligada. Volta na próxima leitura.` : `Regra ${c} desligada.`); return desenhar();
  }
  if (t.id === "ag-ativo") {
    const liga = t.checked;
    if (!await confirmar(liga ? { titulo: "Ligar a gravação agendada?", texto: "O Jirafalis passa a gravar, sozinho, o que estiver liberado em cada ponto de gravação.", itens: S.gravacoes.map(h => `Grava às ${h}`), ok: "Ligar" }
      : { titulo: "Desligar a gravação agendada?", texto: "Nada é gravado sozinho até você ligar de novo. A leitura continua.", ok: "Desligar" })) { t.checked = !liga; return; }
    S.ativo = liga; return desenhar();
  }
});
$("fundo").addEventListener("click", () => abrir(null));
document.addEventListener("keydown", ev => {
  if (ev.target.matches("input, select, textarea")) return;
  if (ev.key === "Escape") abrir(null);
  if (ev.key.toLowerCase() === "m") { S.mapa = !S.mapa; desenhar(); }
});
desenhar();
const h = location.hash.slice(1);
if (["permissoes", "saude", "times", "entregas", "log", "chat", "conferir", "depois"].includes(h)) abrir(h);
