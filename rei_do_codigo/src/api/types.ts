export type Linguagem = "JAVA" | "PYTHON" | "CPP";
export type TipoInimigo = "MULTIPLA_ESCOLHA" | "CODIGO";
export type StatusBatalha = "EM_ANDAMENTO" | "VITORIA" | "DERROTA";

export interface Usuario {
  id: number;
  nome: string;
  linguagem: Linguagem;
  progresso: number;
  venceuRei: boolean;
}

export interface Inimigo {
  id: number;
  nome: string;
  ordemNoCorredor: number;
  tipo: TipoInimigo;
  vidaMaxima: number;
  ehRei: boolean;
  descricao: string;
}

export interface Batalha {
  id: number;
  usuarioId: number;
  inimigoId: number;
  nomeInimigo: string;
  tipoInimigo: TipoInimigo;
  vidaJogador: number;
  vidaInimigo: number;
  status: StatusBatalha;
  perguntaAtual: number;
  ehRei: boolean;
}

export interface Pergunta {
  id: number;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  alternativaD: string;
  ordem: number;
}

export interface DesafioCodigo {
  id: number;
  inimigoId: number;
  linguagem: Linguagem;
  enunciado: string;
  codigoInicial: string;
  entradaExemplo: string;
  saidaExemplo: string;
}

export interface ResultadoAcao {
  acertou: boolean;
  vidaJogador: number;
  vidaInimigo: number;
  status: StatusBatalha;
  mensagem: string;
  stdout?: string;
  stderr?: string;
}

export type Alternativa = "A" | "B" | "C" | "D";
