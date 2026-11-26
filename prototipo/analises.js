// Inspetor Jirafalis · protótipo. Dados fictícios. © Sidney de Araújo Silva.
// Causa da falha, escrita do ticket e revisão: o que o Investigar (caso a caso) e a aba "Origem, causas e skills"
// (visão de conjunto) mostram. Usado por escala.html e regras.html.
window.JF = (() => {
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const NAT = { processo: "Processo", pessoa: "Pessoa", ia: "IA", falso: "Sinal falso", indef: "Indefinido" };
  const COR_NAT = { processo: "#6cc4b2", pessoa: "#e8b456", ia: "#8fb6dc", falso: "#d9cdb8", indef: "#5e5040" };
  const ESC = { humano: "Humano", revisada: "IA revisada", semrev: "IA sem revisão", indef: "Indefinido" };
  const COR_ESC = { humano: "#d9cdb8", revisada: "#8fb6dc", semrev: "#f2a38a", indef: "#5e5040" };
  const n = p => +String(p.id).replace(/\D/g, "") || 0;

  // ---------- Caso a caso (Investigar) ----------
  /** A árvore da causa (doc 99 §4): os pares fazem o mesmo? a IA fez? a pessoa repete? senão, indefinido. */
  function lerCausa(p, pd) {
    if (pd) return { nat: "processo", conf: 85, sinais: [`O mesmo desvio aparece em ${pd.quem.length} pessoas de times diferentes.`], acao: "Ajustar o processo: regra candidata ou mudança na etapa. Não pesa na pessoa." };
    if (p.tipo === "processo") return { nat: "processo", conf: 70, sinais: ["A etapa acumula itens em mais de um time: falta quem pegue, não falta quem faça."], acao: "Ajustar o processo: regra candidata ou mudança na etapa. Não pesa na pessoa." };
    return [
      { nat: "ia", conf: 60, origem: "IA provável (ritmo de agente)", sinais: ["A mesma conta mexeu em 6 cards em 2 minutos.", "A descrição veio no molde da skill, sem nenhuma edição depois."], acao: "Ver qual skill ou agente fez e levar ao dono da skill. Não pesa na pessoa." },
      { nat: "pessoa", conf: 60, sinais: [`${p.primeiro} repetiu o mesmo desvio 2 vezes em 30 dias; os colegas da etapa cumprem a regra.`], acao: "Perguntar à pessoa primeiro, sem bronca. Só conta na ficha se você confirmar." },
      { nat: "indef", conf: 0, sinais: ["Primeira vez nos últimos 30 dias: só a pergunta, não conta."], acao: "Fazer a pergunta: a sua resposta ensina o Jirafalis a ler os próximos casos." },
    ][[0, 1, 2, 1][n(p) % 4]]; // exemplos fictícios: um caso de cada leitura entre os isolados
  }

  function causa(p, pd) {
    if (!p.leitura) return "";
    const c = lerCausa(p, pd);
    return `<div class="jf-causa ${c.nat}"><span><b>Causa provável: ${NAT[c.nat]}</b> <small>· ${c.conf ? `confiança ${c.conf}%` : "na dúvida, o Jirafalis não diz"}</small></span>
      ${c.origem ? `<small>Quem mexeu: ${c.origem}</small>` : ""}<ul>${c.sinais.map(s => `<li>${esc(s)}</li>`).join("")}</ul><span>${esc(c.acao)}</span></div>`;
  }

  /** Quem escreveu cada parte do ticket e se houve revisão. Certeza só com o marcador da skill ou o diário do Jirafalis. */
  const PERFIS = [
    [["Descrição", "skill criar-historias v2.1", "certeza", "editada pelo dev 2 h depois (pequena)", "ok"],
     ["Critérios de aceite", "IA provável (rajada)", "provavel", "nenhum rastro", "alerta"],
     ["Comentários (4)", "3 humano · 1 IA provável", "", "—", ""],
     ["Status → Em testes", "skill mover-card v1.0", "certeza", "aprovada pelo dev no marcador", "ok"],
     ["Campo Time", "Jirafalis (regra R23)", "certeza", "—", ""]],
    [["Descrição", "IA provável (molde de skill)", "provavel", "nenhum rastro", "alerta"],
     ["Critérios de aceite", "IA provável (molde de skill)", "provavel", "nenhum rastro", "alerta"],
     ["Filhos (6)", "IA provável: 6 criados em 2 min", "provavel", "nenhum rastro", "alerta"],
     ["Status → Em desenvolvimento", "humano", "", "—", ""]],
    [["Descrição", "humano", "", "revisada por outra pessoa antes de avançar", "ok"],
     ["Critérios de aceite", "skill criar-historias v2.1", "certeza", "aprovada pelo dev no marcador", "ok"],
     ["Comentários (2)", "humano", "", "—", ""],
     ["Status → Em testes", "indefinido", "", "—", ""]],
  ];
  // A escrita conta a mesma história da causa: IA → tudo da IA sem revisão; pessoa → escrita humana; o resto, misto.
  const PERFIL_DA_CAUSA = { ia: 1, pessoa: 2 };
  function escrita(p, pd) {
    const linhas = PERFIS[PERFIL_DA_CAUSA[lerCausa(p, pd).nat] ?? 0], semRev = linhas.filter(l => l[4] === "alerta").length;
    return `<div><h3>Escrita do ticket <span class="jf-n">quem escreveu e se alguém conferiu</span></h3>
      <table class="jf-escrita"><thead><tr><th>Parte</th><th>Origem</th><th>Revisão</th></tr></thead><tbody>
      ${linhas.map(([parte, origem, grau, rev, est]) => `<tr><td>${parte}</td><td>${origem}${grau ? ` <span class="jf-grau ${grau}">${grau === "certeza" ? "certeza" : "provável"}</span>` : ""}</td>
        <td class="${est}">${est === "alerta" ? "⚠ " : ""}${rev}</td></tr>`).join("")}</tbody></table>
      ${semRev ? `<p class="jf-nota">${semRev} ${semRev > 1 ? "partes escritas" : "parte escrita"} pela IA sem nenhum rastro de revisão humana. Só características são guardadas, nunca o texto.</p>` : ""}</div>`;
  }

  const RESP = [["processo", "Falha do processo", "Fecha o caso e vira regra candidata. Não pesa na pessoa"],
    ["pessoa", "Falha da pessoa", "Fecha o caso e conta para a pessoa: a regra é clara e os colegas cumprem"],
    ["ia", "Falha da IA", "Fecha o caso: foi o agente, a skill ou a ferramenta. Vai ao dono da skill"],
    ["correto", "Está correto", "Fecha como sinal falso: a regra que acendeu precisa de ajuste"],
    ["ajuda", "Precisa de ajuda", "Para casos complexos: pede o motivo e deixa o sinal aceso"]];
  const respostas = () => `<div><h3>De quem é a falha?</h3><div class="botoes">${RESP.map(([k, t, d]) => `<button class="btn" data-resp="${k}" title="${d}">${t}</button>`).join("")}</div>
    <div class="jf-motivo" hidden><label>Qual é o motivo? <small>O que torna este caso difícil</small><textarea maxlength="300"></textarea></label>
      <div class="botoes"><button class="btn forte" data-resp-motivo>Marcar: precisa de ajuda</button><button class="btn" data-resp-cancela>Cancelar</button></div></div>
    <p class="jf-nota">A resposta ensina o Jirafalis: 3 respostas iguais no mesmo tipo de caso mudam a leitura dos próximos.</p></div>`;

  function ligar(raiz, p, pd, toast) {
    const motivo = raiz.querySelector(".jf-motivo");
    raiz.querySelectorAll("[data-resp]").forEach(b => b.onclick = () => {
      const k = b.dataset.resp;
      if (k === "ajuda") { motivo.hidden = false; motivo.querySelector("textarea").focus(); return; }
      toast({ processo: `Caso fechado: falha do processo. ${pd ? "Conta como evidência para o padrão." : "Vira regra candidata, nasce júnior."}`,
        pessoa: `Caso fechado: falha da pessoa. Entra na ficha de ${p.primeiro}, que toda a gestão vê, sem ranking.`,
        ia: "Caso fechado: falha da IA. Vai ao dono da skill com o exemplo; não pesa na pessoa.",
        correto: "Caso fechado como sinal falso: a regra que acendeu ganha um ajuste sugerido." }[k]);
    });
    raiz.querySelector("[data-resp-cancela]").onclick = () => { motivo.hidden = true; };
    raiz.querySelector("[data-resp-motivo]").onclick = () => {
      const t = motivo.querySelector("textarea").value.trim();
      if (!t) { toast("Diga o motivo: o que torna este caso difícil?"); return; }
      motivo.hidden = true; toast(`Caso continua aceso e marcado: precisa de ajuda (${t}).`);
    };
  }

  // ---------- Visão de conjunto (aba Origem, causas e skills) ----------
  const TIMES = ["Pagamentos", "Onboarding", "Plataforma", "Checkout", "Antifraude", "Mobile", "Dados", "Parcerias", "Suporte interno"];
  // falhas nos últimos 14 dias: processo, pessoa, IA, sinal falso, indefinido
  const CAUSAS = [[5, 1, 3, 1, 2], [2, 1, 1, 0, 1], [6, 0, 7, 1, 2], [4, 2, 3, 1, 1], [3, 1, 1, 0, 2], [5, 1, 6, 1, 1], [4, 0, 6, 2, 1], [2, 2, 1, 0, 1], [1, 1, 0, 0, 1]];
  // escrita: humano, IA revisada, IA sem revisão, indefinido (% das partes escritas)
  const ESCRITA = [[40, 30, 22, 8], [55, 25, 12, 8], [27, 23, 42, 8], [43, 27, 20, 10], [50, 26, 14, 10], [35, 20, 37, 8], [30, 22, 40, 8], [58, 24, 10, 8], [64, 20, 8, 8]];
  // contrato de dados: cumprimento %, frescor (horas entre o trabalho e o card), origem conhecida %
  const CONTRATO = [[86, 6, 58], [91, 4, 49], [68, 19, 41], [82, 8, 52], [88, 5, 47], [71, 16, 45], [70, 14, 43], [93, 3, 51], [95, 2, 39]];
  const ETAPAS_FALHA = [["Em testes", 4, "o card não vai para testes depois do merge"], ["Pronto para publicação", 3, "chega sem o link da mudança"], ["Em definição", 2, "história criada sem critério de aceite"]];

  const pilha = (vals, cores, nomes, sufixo = "") => {
    const tot = vals.reduce((a, b) => a + b, 0) || 1;
    return `<div class="pilha">${vals.map((v, i) => v ? `<i style="width:${v / tot * 100}%;background:${cores[i]}" title="${nomes[i]}: ${v}${sufixo}"></i>` : "").join("")}</div>`;
  };
  const legenda = (nomes, cores) => `<div class="leg-origem">${nomes.map((t, i) => `<span><i style="background:${cores[i]}"></i>${t}</span>`).join("")}</div>`;
  const cor = (v, bom, mau, maior = true) => (maior ? v >= bom : v <= bom) ? "" : (maior ? v < mau : v > mau) ? "feito nao" : "jf-meio";

  function secoes() {
    const kNat = Object.keys(NAT), kEsc = Object.keys(ESC);
    return `<h3>De quem é a causa das falhas (últimos 14 dias)</h3>
      <p class="sub">A árvore da cultura justa lê cada sinal: se os colegas fazem o mesmo, é processo; se a IA fez, é IA; se só a pessoa repete, é pessoa. Na dúvida, indefinido. Processo e IA nunca pesam na pessoa.</p>
      ${legenda(kNat.map(k => NAT[k]), kNat.map(k => COR_NAT[k]))}
      <table><tbody>${TIMES.map((t, i) => { const v = CAUSAS[i], tot = v.reduce((a, b) => a + b, 0);
        return `<tr><td style="width:120px">${t}</td><td>${pilha(v, kNat.map(k => COR_NAT[k]), kNat.map(k => NAT[k]), " falhas")}</td><td class="num mudo" style="width:160px">${tot} falhas · ${Math.round(v[0] / tot * 100)}% processo</td></tr>`; }).join("")}</tbody></table>
      <div class="cartao" style="margin-top:8px"><div class="linha1"><b>O processo falha aqui</b><span class="tag">3 ou mais times</span></div>
        ${ETAPAS_FALHA.map(([e, nt, o]) => `<div class="evid"><b>${e}</b> · ${nt} times · ${o}</div>`).join("")}</div>

      <h3>Escrita e revisão por time</h3>
      <p class="sub">Quem escreveu cada parte dos tickets (descrição, critérios, comentários, campos) e se alguém conferiu. Certeza com o marcador da skill; nos outros casos, provável.</p>
      ${legenda(kEsc.map(k => ESC[k]), kEsc.map(k => COR_ESC[k]))}
      <table><tbody>${TIMES.map((t, i) => `<tr><td style="width:120px">${t}</td><td>${pilha(ESCRITA[i], kEsc.map(k => COR_ESC[k]), kEsc.map(k => ESC[k]), "%")}</td>
        <td class="num ${ESCRITA[i][2] >= 30 ? "feito nao" : "mudo"}" style="width:160px">${ESCRITA[i][2]}% sem revisão</td></tr>`).join("")}</tbody></table>
      <div class="cartao" style="margin-top:8px"><div class="linha1"><b>Cruzamento: onde a IA sem revisão vira falha</b><span class="tag">Plataforma · Mobile · Dados</span></div>
        <div class="evid">Nesses 3 times, 7 de cada 10 falhas de processo estão em partes escritas pela IA sem nenhuma revisão. Nos outros, a IA revisada falha tanto quanto a escrita humana.</div>
        <div class="evid"><b>Leitura:</b> o problema não é usar IA, é a skill gravar sem o dev conferir. Proposta para a skill <code>criar-historias</code>: mostrar o rascunho e pedir o ok antes de gravar, registrando a revisão no marcador.</div></div>

      <h3>Os times me dão os dados?</h3>
      <p class="sub">O contrato de cada time vem do mapa do processo: os campos, etapas e evidências que a gestão usa.</p>
      <table><thead><tr><th>Time</th><th class="num">Cumprimento</th><th class="num">Frescor</th><th class="num">Origem conhecida</th><th>Leitura</th></tr></thead><tbody>
      ${TIMES.map((t, i) => { const [c, f, o] = CONTRATO[i];
        const leit = c < 75 && ESCRITA[i][2] >= 30 ? "dados fracos: a IA grava sem revisão" : c < 75 ? "dados fracos: cobrar o contrato" : f > 12 ? "card atrasado em relação ao trabalho" : "dá para confiar";
        return `<tr><td>${t}</td><td class="num ${cor(c, 85, 75)}">${c}%</td><td class="num ${cor(f, 8, 12, false)}">${f} h</td><td class="num mudo">${o}%</td><td>${leit}</td></tr>`; }).join("")}</tbody></table>`;
  }

  const lado = () => `<h3>Como o Jirafalis lê a causa</h3>
    <ol class="jf-arvore"><li><b>O sinal é real?</b> Se não, sinal falso: a regra do Jirafalis é que se ajusta.</li>
      <li><b>A IA ou o próprio Jirafalis fez?</b> Marcador da skill, rajada da mesma conta, diário do Jirafalis.</li>
      <li><b>Os colegas fazem o mesmo?</b> 3 ou mais times, ou 30% das pessoas da etapa: processo.</li>
      <li><b>A regra é clara e os colegas cumprem?</b> 80% ou mais cumprem e a pessoa repete: pessoa.</li>
      <li><b>Senão, indefinido:</b> vira pergunta, e a resposta ensina.</li></ol>
    <h3>Rastros de revisão</h3>
    <dl class="kv"><dt>Marcador da skill</dt><dd>a skill mostra o rascunho e grava "aprovada", "editada pelo dev" ou "sem revisão" (certeza)</dd>
      <dt>Edição depois</dt><dd>edição pequena e pontual, minutos ou horas depois, fora de rajada</dd>
      <dt>Outra pessoa</dt><dd>comentou ou editou antes de o card avançar</dd>
      <dt>Nenhum</dt><dd>a IA escreveu e o card andou sem toque humano</dd></dl>`;

  const marcador = `jirafalis.origem = {
  "skill": "criar-historias", "versao": "2.2",
  "acao": "descricao", "resultado": "ok",
  "revisao": "editada pelo dev", "em": "…"
}`;

  return { causa, escrita, respostas, ligar, secoes, lado, marcador };
})();
