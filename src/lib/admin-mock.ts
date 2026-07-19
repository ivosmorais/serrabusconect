export type MonitorStatus = "online" | "offline" | "manutencao";

export type Monitor = {
  id: string;
  nome: string;
  endereco: string;
  regiao: string;
  status: MonitorStatus;
  sinal: number; // 0-100
  ultimaAtualizacao: string;
  temperatura: number; // °C
  versao: string;
  lat: number;
  lng: number;
};

export const MONITORES: Monitor[] = [
  { id: "M-001", nome: "Terminal Laranjeiras", endereco: "Av. Central, 1000 - Laranjeiras", regiao: "Laranjeiras", status: "online", sinal: 92, ultimaAtualizacao: "há 12s", temperatura: 42, versao: "2.4.1", lat: -20.16, lng: -40.24 },
  { id: "M-002", nome: "Praça Serra Sede", endereco: "Praça Central - Serra Sede", regiao: "Serra Sede", status: "online", sinal: 78, ultimaAtualizacao: "há 8s", temperatura: 45, versao: "2.4.1", lat: -20.12, lng: -40.30 },
  { id: "M-003", nome: "Terminal Jacaraípe", endereco: "Rod. do Sol, s/n - Jacaraípe", regiao: "Jacaraípe", status: "offline", sinal: 0, ultimaAtualizacao: "há 42min", temperatura: 0, versao: "2.3.9", lat: -20.14, lng: -40.19 },
  { id: "M-004", nome: "Shopping Mestre Álvaro", endereco: "Av. Eldes S. Brito - Carapina", regiao: "Carapina", status: "online", sinal: 88, ultimaAtualizacao: "há 5s", temperatura: 39, versao: "2.4.1", lat: -20.20, lng: -40.25 },
  { id: "M-005", nome: "Hospital Dório Silva", endereco: "Av. Eldes S. Brito - São Diogo", regiao: "São Diogo", status: "manutencao", sinal: 55, ultimaAtualizacao: "há 3min", temperatura: 51, versao: "2.4.0", lat: -20.22, lng: -40.26 },
  { id: "M-006", nome: "Praia de Nova Almeida", endereco: "Av. Beira Mar - Nova Almeida", regiao: "Nova Almeida", status: "online", sinal: 71, ultimaAtualizacao: "há 20s", temperatura: 47, versao: "2.4.1", lat: -20.02, lng: -40.20 },
  { id: "M-007", nome: "Terminal Carapina", endereco: "Av. Norte-Sul - Carapina", regiao: "Carapina", status: "online", sinal: 95, ultimaAtualizacao: "há 3s", temperatura: 41, versao: "2.4.1", lat: -20.19, lng: -40.27 },
  { id: "M-008", nome: "Feu Rosa", endereco: "Av. Central - Feu Rosa", regiao: "Feu Rosa", status: "online", sinal: 66, ultimaAtualizacao: "há 45s", temperatura: 44, versao: "2.4.0", lat: -20.18, lng: -40.23 },
];

export type Conteudo = {
  id: string;
  titulo: string;
  tipo: "Saúde" | "Obras" | "Educação" | "Turismo" | "Eventos" | "Defesa Civil" | "Comunicados";
  regiao: string;
  inicio: string;
  fim: string;
  horario: string;
  status: "ativo" | "agendado" | "encerrado";
};

export const CONTEUDOS: Conteudo[] = [
  { id: "C-101", titulo: "Campanha de Vacinação Influenza", tipo: "Saúde", regiao: "Todas", inicio: "2026-07-15", fim: "2026-08-30", horario: "06h - 22h", status: "ativo" },
  { id: "C-102", titulo: "Obras Av. Norte-Sul — desvios", tipo: "Obras", regiao: "Carapina", inicio: "2026-07-10", fim: "2026-09-01", horario: "05h - 23h", status: "ativo" },
  { id: "C-103", titulo: "Matrículas rede municipal 2027", tipo: "Educação", regiao: "Todas", inicio: "2026-08-01", fim: "2026-08-31", horario: "07h - 20h", status: "agendado" },
  { id: "C-104", titulo: "Festival de Verão Nova Almeida", tipo: "Turismo", regiao: "Nova Almeida", inicio: "2026-12-15", fim: "2027-01-15", horario: "16h - 23h", status: "agendado" },
  { id: "C-105", titulo: "Alerta chuvas fortes 48h", tipo: "Defesa Civil", regiao: "Todas", inicio: "2026-07-19", fim: "2026-07-21", horario: "24h", status: "ativo" },
  { id: "C-106", titulo: "Show da Virada — praça central", tipo: "Eventos", regiao: "Serra Sede", inicio: "2026-12-31", fim: "2027-01-01", horario: "20h - 02h", status: "agendado" },
];

export type Anuncio = {
  id: string;
  anunciante: string;
  campanha: string;
  duracaoSeg: number;
  janela: string;
  regiao: string;
  exibicoes: number;
  status: "ativo" | "pausado";
};

export const ANUNCIOS: Anuncio[] = [
  { id: "A-201", anunciante: "Supermercado Coqueiral", campanha: "Ofertas de fim de semana", duracaoSeg: 15, janela: "08h - 20h", regiao: "Carapina, Laranjeiras", exibicoes: 12480, status: "ativo" },
  { id: "A-202", anunciante: "Farmácia Popular", campanha: "Genéricos 40% off", duracaoSeg: 10, janela: "06h - 22h", regiao: "Todas", exibicoes: 34210, status: "ativo" },
  { id: "A-203", anunciante: "Auto Escola Serra", campanha: "Matrículas abertas", duracaoSeg: 20, janela: "09h - 18h", regiao: "Serra Sede", exibicoes: 5210, status: "pausado" },
  { id: "A-204", anunciante: "Restaurante Peixe Frito", campanha: "Almoço executivo", duracaoSeg: 15, janela: "10h - 15h", regiao: "Nova Almeida, Jacaraípe", exibicoes: 8730, status: "ativo" },
  { id: "A-205", anunciante: "Clínica Odonto Sorriso", campanha: "Avaliação gratuita", duracaoSeg: 12, janela: "07h - 19h", regiao: "Todas", exibicoes: 21050, status: "ativo" },
];

export const ANUNCIANTES = Array.from(new Set(ANUNCIOS.map(a => a.anunciante)));

export const PONTOS_MOVIMENTADOS = [
  { nome: "Terminal Laranjeiras", passageiros: 4820 },
  { nome: "Terminal Carapina", passageiros: 4210 },
  { nome: "Shopping Mestre Álvaro", passageiros: 3690 },
  { nome: "Praça Serra Sede", passageiros: 2980 },
  { nome: "Hospital Dório Silva", passageiros: 2110 },
];

export const ALERTAS_ATIVOS = [
  { id: "AL-01", tipo: "Defesa Civil", titulo: "Chuvas fortes previstas", regiao: "Todas", inicio: "há 2h" },
  { id: "AL-02", tipo: "Trânsito", titulo: "Bloqueio Av. Norte-Sul", regiao: "Carapina", inicio: "há 45min" },
  { id: "AL-03", tipo: "Operação", titulo: "Linha 523 com atraso", regiao: "Laranjeiras", inicio: "há 12min" },
];
