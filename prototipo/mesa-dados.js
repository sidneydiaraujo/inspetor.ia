// Inspetor Jirafalis · dados fictícios da mesa do dia. Nenhum dado real.
// Códigos das regras: R01, R02… na ordem em que aparecem na mesa. Catálogo ilustrativo, com regras comuns de Scrum e Kanban.
const HOJE = "22/11";
const ESPACO = { cards: 312, lido: "15:12", leitura: ["08:00", "19:00"], gravacoes: ["09:00", "14:00", "17:30"] };
// cards das tasks dos times (os mesmos do Investigar): número = 100 + 7 × posição
const PESSOAS = ["André Souza", "Ana Lima", "Bruno Reis", "Carla Mendes", "Diego Prado", "Elisa Rocha", "Fábio Nunes", "Gabriela Dias", "Heitor Alves",
  "Igor Campos", "Júlia Ramos", "Kauê Lopes", "Lara Pinto", "Marcos Teles", "Nina Duarte", "Otávio Melo", "Paula Freitas", "Rafael Costa",
  "Sara Moura", "Tiago Neves", "Úrsula Brito", "Vítor Lemos", "Wanda Sales", "Yara Torres", "Zeca Matos", "Bia Farias", "Caio Vidal"];
const LIDERES = { Pagamentos: "Ana Lima", Onboarding: "Carla Mendes", Plataforma: "Gabriela Dias", Checkout: "Júlia Ramos", Antifraude: "Marcos Teles",
  Mobile: "Paula Freitas", Dados: "Tiago Neves", Parcerias: "Wanda Sales", "Suporte interno": "Bia Farias" };

// ---------- Raia 1: mudanças no quadro ----------
const MUDANCAS = [
  { regra: "R01", nome: "Épico avança quando a primeira história começa", nivel: "pleno", itens: [
    { card: 30, titulo: "Checkout em 1 clique", campo: "Status", de: "A fazer", para: "Em desenvolvimento", motivo: "A história #177 entrou em desenvolvimento em 21/11.", eufaco: true },
    { card: 34, titulo: "App 3.0", campo: "Status", de: "A fazer", para: "Em desenvolvimento", motivo: "A história #219 entrou em desenvolvimento hoje.", eufaco: true } ] },
  { regra: "R02", nome: "Épico concluído com história aberta volta para Em desenvolvimento", nivel: "junior", itens: [
    { card: 27, titulo: "Cobrança recorrente", campo: "Status", de: "Pronto", para: "Em desenvolvimento", motivo: "Ainda tem 3 histórias abertas: #100, #107, #114." } ] },
  { regra: "R03", nome: "PR mergeado: o card vai para Em testes", nivel: "junior", nova: true, itens: [
    { card: 100, titulo: "Criação de endpoint de estorno", campo: "Status", de: "Em desenvolvimento", para: "Em testes", motivo: "PR #20 mergeado há 6 dias úteis; deploy em homologação às 11:12." },
    { card: 163, titulo: "Tokenização do cartão", campo: "Status", de: "Em desenvolvimento", para: "Em testes", motivo: "PR #47 mergeado há 4 dias úteis." },
    { card: 205, titulo: "Biometria no Android", campo: "Status", de: "Em desenvolvimento", para: "Em testes", motivo: "PR #65 mergeado há 3 dias úteis; 1 PR ainda aberto no item." },
    { card: 247, titulo: "Importação do catálogo", campo: "Status", de: "Em desenvolvimento", para: "Em testes", motivo: "PR #83 mergeado há 5 dias úteis." } ] },
];
const EUFIZ = {
  mud: [ { card: 29, titulo: "Ferramentas do atendimento", oque: "Status: Em validação → Pronto (3 de 3 histórias em Pronto)", regra: "R04", em: "09:02" },
         { card: 135, titulo: "E-mail de boas-vindas", oque: "Data de entrega: vazio → 21/11", regra: "R05", em: "09:02" } ],
  com: [ { card: 240, titulo: "Cache por cliente", oque: "Comentário pedindo critério de aceite, com @Úrsula Brito", regra: "R06", em: "09:03" } ],
};

// ---------- Raia 2: comentários que marcam pessoas ----------
// desde = dias com o desvio; retorno: "sem" (sem retorno em 16 h) ou { autor, falta }
const COMENTARIOS = [
  { cod: "R06", nome: "História sem critério de aceite", prio: true, nivel: "junior", itens: [
    { card: 121, titulo: "Leitura do CPF", det: "Sem critério de aceite", pessoas: ["Carla Mendes"], desde: 2 },
    { card: 254, titulo: "Cálculo do repasse", det: "Critério de aceite vazio", pessoas: ["Wanda Sales"], desde: 4, retorno: "sem" } ] },
  { cod: "R07", nome: "Card bloqueado sem motivo registrado", prio: true, nivel: "pleno", itens: [
    { card: 18, titulo: "Cadastro em 3 passos", det: "Marcado como bloqueado em 20/11, sem motivo no card", pessoas: ["Carla Mendes", "Diego Prado"], desde: 6, chat: "Onboarding", eufaco: true },
    { card: 21, titulo: "Observabilidade", det: "Marcado como bloqueado hoje, sem motivo no card", pessoas: ["Gabriela Dias"], desde: 3, chat: "Plataforma", eufaco: true } ] },
  { cod: "R08", nome: "Sprint com escopo adicionado depois do início", prio: true, nivel: "junior", itens: [
    { card: 12, titulo: "Painel do cliente v1", det: "Entrou na sprint 24 em 20/11, dois dias depois do início", pessoas: ["Tiago Neves"], desde: 8 } ] },
  { cod: "R09", nome: "Card parado na coluna há mais que a referência", nivel: "junior", pronta: true, itens: [
    { card: 128, titulo: "Captura da selfie", det: "Em testes há 5 dias úteis (referência: 2)", pessoas: ["Diego Prado"], desde: 5 },
    { card: 184, titulo: "Bloqueio por CEP", det: "Em testes há 4 dias úteis (referência: 2)", pessoas: ["Lara Pinto"], desde: 4, retorno: { autor: "Lara Pinto", falta: "Respondeu que espera o time de dados, mas não registrou o bloqueio no card." } },
    { card: 226, titulo: "Exportação assíncrona", det: "Em testes há 6 dias úteis (referência: 2)", pessoas: ["Sara Moura"], desde: 6, retorno: "sem" },
    { card: 240, titulo: "Cache por cliente", det: "Em desenvolvimento há 4 dias úteis (referência: 4)", pessoas: ["Úrsula Brito"], desde: 0 } ] },
  { cod: "R10", nome: "PR mergeado e o card parado em desenvolvimento", nivel: "junior", itens: [
    { card: 100, titulo: "Criação de endpoint de estorno", det: "PR #20 mergeado há 6 dias úteis", pessoas: ["André Souza"], desde: 6 },
    { card: 163, titulo: "Tokenização do cartão", det: "PR #47 mergeado há 4 dias úteis", pessoas: ["Igor Campos"], desde: 4 },
    { card: 205, titulo: "Biometria no Android", det: "PR #65 mergeado há 3 dias úteis", pessoas: ["Otávio Melo"], desde: 3 },
    { card: 247, titulo: "Importação do catálogo", det: "PR #83 mergeado há 5 dias úteis", pessoas: ["Vítor Lemos"], desde: 5 } ] },
  { cod: "R11", nome: "Bug crítico sem responsável", nivel: "junior", itens: [
    { card: 22, titulo: "Score em tempo real", det: "Bug crítico aberto em 21/11 e ainda sem responsável", pessoas: ["Marcos Teles"], desde: 1, chat: "Antifraude" } ] },
  { cod: "R12", nome: "Item pulou a etapa de revisão", nivel: "junior", itens: [
    { card: 212, titulo: "Tema escuro nas telas", det: "Foi de Em desenvolvimento direto para Em testes em 20/11", pessoas: ["Paula Freitas"], desde: 2 } ] },
  { cod: "R13", nome: "Card entrou na sprint sem estimativa", nivel: "junior", itens: [
    { card: 149, titulo: "Padrão de log", det: "Entrou na sprint 24 sem story points", pessoas: ["Gabriela Dias"], desde: 1, liberado: true } ] },
  { cod: "R14", nome: "WIP acima do limite da coluna", nivel: "junior", itens: [
    { card: 31, titulo: "Marketplace", det: "Em desenvolvimento do time Parcerias: 7 cards para um limite de 5", pessoas: ["Wanda Sales"], desde: 4 } ] },
  { cod: "R15", nome: "Escrita fraca confirmada na saúde da escrita", nivel: "junior", itens: [
    { card: 191, titulo: "Cadastro de exceção", det: "Critério de aceite com 1 linha genérica (você confirmou)", pessoas: ["Marcos Teles"], desde: 1 } ] },
];
const SO_VER = [
  { card: 261, titulo: "Assinatura do contrato", det: "R16 · Item sem atualização há 30 dias" },
  { card: 282, titulo: "Linha do tempo do cliente", det: "R16 · Item sem atualização há 30 dias" },
  { card: 33, titulo: "Painel do cliente", det: "R17 · Épico aberto há 40 dias sem nenhuma história filha" },
];
const ACOMPANHAMENTO = { enviado: "21/11 09:00", listas: [
  ["Bugs abertos em produção", "chamados do Suporte ligados a itens entregues", ["#S-41 · Erro no recibo · ligado a #114 · Pagamentos"]],
  ["Cards bloqueados há mais de 2 dias", "marcados como bloqueados, com ou sem motivo", ["#18 · Cadastro em 3 passos · Carla Mendes · Onboarding · 2 dias"]],
  ["Entregas realizadas", "foram ao ar em 21/11", ["#135 · E-mail de boas-vindas · Onboarding", "#156 · Contador de mensagens · Plataforma"]],
] };
const RETORNO = "retorno dos recados em 30 dias: 29 atendidos, 2 com inconsistência, 4 aguardando, 6 sem retorno";

// ---------- Raia 3: campos vazios ----------
const CAMPOS = [
  { cod: "R18", nome: "Épico sem prioridade", itens: [ { card: 31, titulo: "Marketplace", campo: "Prioridade", opcoes: ["Alta", "Média", "Baixa"] } ] },
  { cod: "R19", nome: "Épico sem data alvo", itens: [
    { card: 32, titulo: "Score em tempo real", campo: "Data alvo", data: true }, { card: 33, titulo: "Painel do cliente", campo: "Data alvo", data: true },
    { card: 35, titulo: "Ferramentas do atendimento 2", campo: "Data alvo", data: true } ] },
  { cod: "R20", nome: "Épico sem componente", itens: [ { card: 32, titulo: "Score em tempo real", campo: "Componente", opcoes: ["Web", "App", "API"] } ] },
  { cod: "R21", nome: "Épico em andamento sem dono de produto", itens: [
    { card: 34, titulo: "App 3.0", campo: "Dono de produto", opcoes: ["Paula Freitas", "Júlia Ramos", "Wanda Sales"] },
    { card: 30, titulo: "Checkout em 1 clique", campo: "Dono de produto", opcoes: ["Paula Freitas", "Júlia Ramos", "Wanda Sales"] },
    { card: 31, titulo: "Marketplace", campo: "Dono de produto", opcoes: ["Paula Freitas", "Júlia Ramos", "Wanda Sales"], dispensado: true } ] },
  { cod: "R22", nome: "Épico sem versão de release", itens: [
    { card: 36, titulo: "Conciliação automática", campo: "Versão", opcoes: ["3.1", "3.2", "4.0"] },
    { card: 37, titulo: "Portal do parceiro", campo: "Versão", opcoes: ["3.1", "3.2", "4.0"], dispensado: true } ] },
];

// ---------- Autonomia: a confiança de cada ação de cada regra ----------
// [regra, nome, ação, classe, nível, barra 0..1, texto do que falta]
const AUTONOMIA = [
  ["R23", "Time herdado do épico", "campo", "R1", "senior", 1, "sênior por tempo · 5 dias úteis em pleno, portões abertos"],
  ["R06", "História sem critério de aceite", "alerta", "R0", "senior", 1, "leitura nasce sênior · 2 falsos positivos em 96"],
  ["R05", "Data de entrega ao chegar em Pronto", "campo", "R1", "pleno", .4, "2 de 5 dias úteis em pleno para sênior"],
  ["R01", "Épico avança com a história", "status", "R2", "pleno", .4, "4 de 10 dias úteis em pleno · rebaixado em Parcerias (status novo)"],
  ["R07", "Card bloqueado sem motivo", "comentário", "R2", "pleno", .7, "7 de 10 dias úteis em pleno"],
  ["R07", "Card bloqueado sem motivo", "chat do time", "R3", "junior", .6, "ensaio: 31 de ~52 rascunhos aprovados sem edição"],
  ["R09", "Card parado há mais que a referência", "comentário", "R2", "junior", 1, "pronta para pleno: 34 liberações, confiança 0,93 ≥ 0,92", true],
  ["R02", "Épico concluído com história aberta", "status", "R2", "junior", .3, "9 de ~32 liberações limpas"],
  ["R03", "PR mergeado: card vai para Em testes", "status", "R2", "junior", .2, "6 de ~32 liberações · nasceu de um padrão entre times"],
];

// ---------- Permissões: todas as regras por tema ----------
const TEMAS = [
  ["Status", [["R01", "Épico avança quando a primeira história começa", "pleno"], ["R04", "Épico fecha quando todas as histórias estão em Pronto", "pleno"], ["R02", "Épico concluído com história aberta volta para Em desenvolvimento", "junior"], ["R03", "PR mergeado: o card vai para Em testes", "junior"]]],
  ["Campos gravados", [["R23", "Time herdado do épico (só se vazio)", "senior"], ["R05", "Data de entrega ao chegar em Pronto", "pleno"]]],
  ["Preencher", [["R18", "Épico sem prioridade", "sem"], ["R19", "Épico sem data alvo", "sem"], ["R20", "Épico sem componente", "sem"], ["R21", "Épico em andamento sem dono de produto", "sem"], ["R22", "Épico sem versão de release", "sem"]]],
  ["Sprint e WIP", [["R08", "Sprint com escopo adicionado depois do início", "junior"], ["R14", "WIP acima do limite da coluna", "junior"], ["R26", "Coluna sem limite de WIP definido", "junior"]]],
  ["Bugs", [["R11", "Bug crítico sem responsável", "junior"], ["R24", "Bug reaberto mais de uma vez", "junior", true]]],
  ["Andamento", [["R09", "Card parado na coluna há mais que a referência", "junior"], ["R12", "Item pulou a etapa de revisão", "junior"], ["R10", "PR mergeado e card parado em desenvolvimento", "junior"], ["R07", "Card bloqueado sem motivo registrado", "pleno"], ["R29", "Entregue sem link do deploy", "junior"]]],
  ["Cadastro", [["R06", "História sem critério de aceite", "junior"], ["R25", "Em testes sem responsável de testes (em simulação)", "sim"], ["R13", "Card entrou na sprint sem estimativa", "junior"]]],
  ["Qualidade da escrita", [["R15", "Escrita fraca confirmada na saúde da escrita", "junior"]]],
  ["Relatórios", [["R16", "Item sem atualização há 30 dias (só ver)", "senior"], ["R17", "Épico sem história filha (só ver)", "senior"]]],
  ["Chat do time", [["R27", "Acompanhamento diário no chat da gestão", "pleno"], ["R28", "Ocorrência em produção no chat da gestão", "pleno"]]],
];

// ---------- Janelas do rodapé ----------
const SAUDE = { pct: 91, criticos: 3, urgentes: 5, atencao: 9, cards: 48, achados: [
  { card: 191, titulo: "Cadastro de exceção", status: "Em desenvolvimento", saude: 58, itens: [["critico", "Critério de aceite", "Uma linha genérica: \"funcionar corretamente\". Não diz o que conferir.", "Já vi 14 critérios assim virarem retrabalho no teste."]] },
  { card: 233, titulo: "Seletor de datas", status: "Em validação", saude: 72, itens: [["urgente", "Link do PR", "O link aponta para um repositório que não existe mais.", "Link verificado na leitura das 15:12."]] },
  { card: 254, titulo: "Cálculo do repasse", status: "Em desenvolvimento", saude: 64, itens: [["atencao", "Cliente afetado", "\"Loja Teste 2\" não está entre os clientes conhecidos.", "É cliente? Se for, guardo o nome e não cobro mais."]] },
] };
const TIMES_NOTA = [["Pagamentos", 82, "boa", ""], ["Onboarding", 77, "boa", "riscos do épico"], ["Plataforma", 69, "parcial", "integrações e entidades"], ["Checkout", 74, "parcial", "telas do fluxo"],
  ["Antifraude", 88, "boa", ""], ["Mobile", 61, "parcial", "estados das telas e textos"], ["Dados", 55, "parcial", "regras e riscos"], ["Parcerias", 47, "fraca", "regras, integrações, riscos"], ["Suporte interno", 79, "boa", ""]];
const ENTREGAS = [
  ["nao", "Não entregues: a data chegou e o item não foi para produção", [{ card: 170, titulo: "Validação do cupom", sub: "Data de entrega 21/11 · ainda em Aguardando deploy", ch: [["status", false, "Continua em Aguardando deploy"], ["dia", false, "Nenhum deploy em 21/11"]] }]],
  ["pend", "Entregues com pendência", [{ card: 156, titulo: "Contador de mensagens", sub: "Entrou em produção em 21/11 às 18:40", ch: [["status", true, "Em produção"], ["quem", true, "Movido pela infra"], ["dia", true, "21/11 18:40"], ["evidência", false, "Sem link do deploy"], ["campos", true, "Ok"]], regra: "R29 · comentário com @Heitor Alves" }]],
  ["ok", "Entregues sem pendência", [{ card: 135, titulo: "E-mail de boas-vindas", sub: "Entrou em produção em 21/11 às 18:12", ch: [["status", true, ""], ["quem", true, ""], ["dia", true, ""], ["evidência", true, ""], ["campos", true, ""]] }]],
];
const LOG = [
  ["14:00", 412, "agendada", [["14:00", "R03", 247, "Status: Em desenvolvimento → Em testes", "feito", "liberado por você"], ["14:00", "R09", 184, "Comentário com @Lara Pinto", "feito", ""], ["14:00", "R05", 233, "Data de entrega: vazio → 21/11", "pulado", "o item mudou: alguém preencheu antes"]]],
  ["09:00", 411, "agendada", [["09:02", "R04", 29, "Status: Em validação → Pronto", "feito", "pleno · Eu fiz"], ["09:02", "R05", 135, "Data de entrega: vazio → 21/11", "feito", "pleno · Eu fiz"], ["09:03", "R06", 240, "Comentário com @Úrsula Brito", "feito", "pleno"], ["09:01", "R23", 177, "Time: vazio → Checkout", "feito", "sênior (sem reporte)"]]],
  ["ontem 17:30", 410, "agendada", [["17:31", "R01", 21, "Status: A fazer → Em desenvolvimento", "feito", "pleno"], ["17:31", "R19", 32, "Data alvo: vazio → 15/03/27", "feito", "você preencheu"]]],
];
const CHAT_REGRAS = [["R27", "Acompanhamento diário", "agendado", "Gestão de produto", "seg a sex, 09:00"], ["R28", "Ocorrência em produção", "automatico", "Gestão de produto", "a cada leitura"],
  ["R07", "Card bloqueado sem motivo", "botao", "chat do time de cada item", "—"], ["R11", "Bug crítico sem responsável", "botao", "chat do time de cada item", "—"]];
const CHATS = [["Gestão de produto", "pronto", "R27, R28"], ["Onboarding", "pronto", "R07, R11"], ["Plataforma", "pronto", "R07, R11"], ["Antifraude", "pronto", "R11"], ["Parcerias", "sem endereço", ""]];
const CONFERIR = [[29, "Épico fechado pela regra R04 com uma história cancelada: confira se o cancelamento foi combinado."], [212, "Revisão pulada pela segunda vez no mesmo item."], [31, "Data alvo anterior à data de criação do épico."]];
const DEPOIS = [[233, "Data de entrega: o item mudou na leitura das 14:00; fica para a próxima rodada."], [128, "Comentário com @Diego Prado: uma pessoa mudou o item há menos de 24 h."]];
