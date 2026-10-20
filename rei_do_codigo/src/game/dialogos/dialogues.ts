import type { Inimigo } from "../../api";
import {
  isCavaleiroInimigo,
  isEsqueletoInimigo,
  isGoblinInimigo,
  isMagoInimigo,
} from "../enemyKind";

export type QuemFala = "jogador" | "inimigo";

export type Fala = {
  quem: QuemFala;
  texto: string;
};

export function falasDoEncontro(inimigo: Inimigo, nomeJogador: string): Fala[] {
  if (inimigo.ehRei) return falasRei(nomeJogador);
  if (inimigo.ordemNoCorredor === 1 || isGoblinInimigo(inimigo)) return falasGoblin();
  if (isEsqueletoInimigo(inimigo)) return falasEsqueleto();
  if (isCavaleiroInimigo(inimigo)) return falasCavaleiro();
  if (isMagoInimigo(inimigo)) return falasMago();
}

function falasGoblin(): Fala[] {
  return [
    {
      quem: "inimigo",
      texto:
        "Parado ai parceiro, este portão guarda o Corredor Real daqui só se chega ao trono com a licença do Rei do Código.",
    },
    {
      quem: "jogador",
      texto:
        "Eu não pedi licença. Vim derrotar o rei, tomar a coroa e trazer paz de volta ao reino.",
    },
    {
      quem: "inimigo",
      texto:
        "Paz? O rei já governa cada linha deste lugar. Quem entra sem se ajoelhar vira aviso para o próximo.",
    },
    {
      quem: "jogador",
      texto:
        "Então que o aviso sera este: eu vou atravessar o corredor e me tornar o Rei do Código, saia do caminho.",
    },
  ];
}

function falasEsqueleto(): Fala[] {
  return [
    {
      quem: "inimigo",
      texto:
        "Eu também quis essa coroa. Errei o caminho, e o corredor me deixou aqui para repetir a queda.",
    },
    {
      quem: "jogador",
      texto: "A minha história não termina numa sala. Eu sigo até o trono.",
    },
    {
      quem: "inimigo",
      texto: "O rei coleciona frases como essa. Se a sua for diferente, prove agora.",
    },
  ];
}

function falasCavaleiro(): Fala[] {
  return [
    {
      quem: "inimigo",
      texto:
        "Eu jurei a espada ao Rei do Código. Ele prometeu ordem, e o reino se calou.",
    },
    {
      quem: "jogador",
      texto: "Ordem calada não é paz. Eu já passei por quem caiu antes de você.",
    },
    {
      quem: "inimigo",
      texto: "Então a sua trajetória acaba aqui, ou continua por cima da minha guarda.",
    },
  ];
}

function falasMago(): Fala[] {
  return [
    {
      quem: "inimigo",
      texto: "Poucos chegam tão perto do trono. O rei já lê o seu nome no corredor.",
    },
    {
      quem: "jogador",
      texto:
        "Deixe que ele leia. Eu atravessei o portão, os mortos e o aço para tirar a coroa dele.",
    },
    {
      quem: "inimigo",
      texto:
        "A coroa só muda de cabeça se o código mudar de dono. Mostre o que essa jornada lhe ensinou.",
    },
  ];
}

function falasRei(nomeJogador: string): Fala[] {
  return [
    {
      quem: "inimigo",
      texto:
        "Você atravessou o Corredor Real sala por sala somente para se ajoelhar pessoamente seu insolente ?",
    },
    {
      quem: "jogador",
      texto: `Meu nome é ${nomeJogador}, eu não vim me ajoelhar, vim te derrotar e devolver a paz ao reino... `,
    },
    {
      quem: "inimigo",
      texto:
        "Paz é a minha coroa. Uma lei, uma vontade, um código. Você só espalhou ruído pelo caminho.",
    },
    {
      quem: "jogador",
      texto: "Eu espalhei uma trajetória. Cada sala vencida foi um passo até este trono.",
    },
    {
      quem: "inimigo",
      texto:
        "Então termine o que começou. Vença, e a coroa é sua. Caia, e o corredor guarda mais um que quase foi rei.",
    },
  ];
}

///NOVAS FRASE
// function falasGoblin(): Fala[] {
//   return [
//     {
//       quem: "inimigo",
//       texto:
//         "Alto lá, viajante! Este é o Corredor Real. Ninguém chega ao trono sem enfrentar aqueles que juraram proteger o Rei do Código.",
//     },
//     {
//       quem: "jogador",
//       texto:
//         "Então não vou perder tempo pedindo passagem. Vim derrotar o rei, tomar sua coroa e devolver a paz a este reino.",
//     },
//     {
//       quem: "inimigo",
//       texto:
//         "Devolver a paz? O rei controla cada canto deste lugar. Muitos vieram com esse mesmo sonho... e nenhum deles chegou ao fim.",
//     },
//     {
//       quem: "jogador",
//       texto:
//         "Talvez porque todos tenham desistido antes da hora. Eu vou atravessar este corredor, enfrentar o rei e provar que este reino merece um novo governante!",
//     },
//   ];
// }

// function falasEsqueleto(): Fala[] {
//   return [
//     {
//       quem: "inimigo",
//       texto:
//         "Um intruso no Corredor Real! Por ordem do Rei do Código, nenhum invasor pode avançar.",
//     },
//     {
//       quem: "jogador",
//       texto:
//         "Não vou deixar que as ordens de um tirano impeçam minha passagem. Saia do meu caminho!",
//     },
//     {
//       quem: "inimigo",
//       texto:
//         "Não sinto medo, não conheço piedade e não descansarei até que todos os invasores sejam eliminados!",
//     },
//     {
//       quem: "jogador",
//       texto:
//         "Então prepare-se! Se é isso que está entre mim e o Rei do Código, você será derrotado aqui!",
//     },
//   ];
// }

// function falasCavaleiro(): Fala[] {
//   return [
//     {
//       quem: "inimigo",
//       texto:
//         "Sou o guardião desta passagem. Jurei minha espada ao Rei do Código em troca de ordem e segurança. Não permitirei que você ameace o que construímos.",
//     },
//     {
//       quem: "jogador",
//       texto:
//         "Que tipo de ordem precisa ser protegida pela força? O reino vive com medo, e você chama isso de segurança. Eu chamo de prisão.",
//     },
//     {
//       quem: "inimigo",
//       texto:
//         "Palavras corajosas não derrubam reis. Se deseja mudar o destino deste reino, terá que passar pela minha espada!",
//     },
//   ];
// }

// function falasMago(): Fala[] {
//   return [
//     {
//       quem: "inimigo",
//       texto:
//         "Você chegou longe demais, aventureiro! Minhas magias foram criadas pelo próprio Rei do Código para impedir que intrusos alcancem seu trono.",
//     },
//     {
//       quem: "jogador",
//       texto:
//         "Já enfrentei seus guardiões e superei cada obstáculo deste corredor. Não será a sua magia que vai me impedir de chegar até o rei!",
//     },
//     {
//       quem: "inimigo",
//       texto:
//         "Arrogância! Você acredita que vencer algumas batalhas o torna capaz de enfrentar o poder do rei? Minha magia será o fim da sua jornada!",
//     }
//   ];
// }

// function falasRei(nomeJogador: string): Fala[] {
//   return [
//     {
//       quem: "inimigo",
//       texto:
//         `Então é você quem atravessou meu corredor, derrotou meus guardiões. Diga-me "aventureiro", veio até aqui para morrer ou para se ajoelhar?`,
//     },
//     {
//       quem: "jogador",
//       texto: `Meu nome é ${nomeJogador}, enfrentei cada obstáculo deste corredor e aprendi com cada batalha. Não cheguei até aqui para me ajoelhar. Vim acabar com seu domínio e devolver a liberdade a este reino!`,
//     }, 
//     {
//       quem: "inimigo",
//       texto:
//         "Liberdade? Foi a minha vontade que impôs ordem a este reino! Um único código, uma única lei, um único rei. Sem mim, tudo voltará ao caos!",
//     }, 
//     {
//       quem: "jogador",
//       texto:
//         "Você confunde obediência com paz e medo com respeito. Um reino não precisa de um rei que controle tudo, mas de alguém que lute por aqueles que não podem lutar por si mesmos.",
//     },
//     {
//       quem: "inimigo",
//       texto:
//         "Belo discurso! Mas palavras não sustentam uma coroa. Você derrotou meus guardiões, atravessou meu corredor e chegou ao meu trono. Agora, mostre se toda essa jornada realmente fez de você alguém capaz de me superar!",
//     },
//     {
//       quem: "jogador",
//       texto:
//         "Esta batalha não é apenas pela coroa. É por todos que perderam a esperança, por aqueles que caíram antes de mim e por um futuro em que ninguém precise viver sob as suas linhas. Chegou a hora de compilar um novo destino para este reino!",
//     },
//   ];
// }

