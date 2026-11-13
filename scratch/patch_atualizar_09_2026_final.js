const fs = require('fs');

const filePath = 'Analise_orcamentaria_2026_ANALISE_GESTOR_v2.html';
const html = fs.readFileSync(filePath, 'utf8');

// Ler o arquivo real "09 2026 Final.xls"
const p = 'Y:/ORÇAMENTO/Orçamento 2026/ANALISE ORCAMENTARIA/1.1.1- Analise orçamentaria 2026/09 Setembro 2026/09 2026 Final.xls';
const raw = fs.readFileSync(p, 'latin1');
const lines = raw.split(/\r?\n/);

function parseVal(v) {
  if (!v) return 0;
  return parseFloat(String(v).replace(/\./g, '').replace(',', '.')) || 0;
}
const normalize = str => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

let centroAtual = '';
const parsedRows = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const cols = line.split('\t');
  const classif = (cols[0] || '').trim();
  const conta = (cols[1] || '').trim();
  const desc = (cols[2] || '').trim();
  const orcMes = parseVal(cols[3]);
  const realMes = parseVal(cols[4]);
  const just = (cols[13] || '').trim();

  const tokens = classif.split('.');
  if (tokens.length >= 1 && tokens.length <= 4 && tokens.every(t => /^\d+$/.test(t))) {
    centroAtual = desc;
  }

  const normDesc = normalize(desc);
  const normCentro = normalize(centroAtual);

  const isSintetico = (
    conta === '30000' || conta === '40000' || conta === '50000' || conta === '30059' ||
    normDesc === normCentro ||
    normDesc === 'custos' || normDesc === 'despesas' || normDesc === 'receitas' || normDesc === 'hmdcc'
  );

  if (!isSintetico && centroAtual) {
    parsedRows.push({
      centro: centroAtual,
      conta: conta,
      descricao: desc,
      orcado: orcMes,
      realizado: realMes,
      justificativa: just,
      isSintetico: false
    });
  }
}

console.log('Linhas processadas de 09 2026 Final.xls:', parsedRows.length);

function compactar(rows) {
  const centros = [], contas = [], descs = [];
  const cMap = new Map(), ctMap = new Map(), dMap = new Map();
  const getIdx = (map, arr, val) => {
    if (!map.has(val)) { map.set(val, arr.length); arr.push(val); }
    return map.get(val);
  };
  const packed = rows.map(r => {
    const ci = getIdx(cMap, centros, r.centro || '');
    const cti = getIdx(ctMap, contas, r.conta || '');
    const di = getIdx(dMap, descs, r.descricao || '');
    const o = Math.round((Number(r.orcado) || 0) * 100) / 100;
    const rl = Math.round((Number(r.realizado) || 0) * 100) / 100;
    return r.justificativa ? [ci, cti, di, o, rl, String(r.justificativa)] : [ci, cti, di, o, rl];
  });
  return { _c: 1, centros, contas, descs, rows: packed };
}

const compact09 = compactar(parsedRows);

const novoObj09 = {
  chave: '09/2026',
  ano: '2026',
  mes: '09',
  fileName: '09 2026 Final.xls',
  totalLinhas: parsedRows.length,
  dataCompact: compact09,
  salvoEm: new Date().toISOString(),
  usuario: 'otavio.gabriel@hmdcc.com.br'
};

const strNovo09 = JSON.stringify(novoObj09);

const posSeed = html.indexOf('const SEED_COMPETENCIAS_2026 =');
const target09 = '"09/2026":';
const pos09 = html.indexOf(target09, posSeed);
const posFimSeed = html.indexOf('}};', pos09);

if (pos09 === -1 || posFimSeed === -1) {
  console.error('ERRO: Não encontrou delimitadores de 09/2026!');
  process.exit(1);
}

const prefix = html.substring(0, pos09 + target09.length);
const suffix = html.substring(posFimSeed + 1); // preserva "};"

let novoHtml = prefix + strNovo09 + suffix;

// Além disso, para garantir que quando um arquivo novo é substituído ou quando há nova versão de dados oficiais,
// o repositório local dê prioridade para a versão mais recente e permita sincronização:
// Localizar obterRepositorioCompetencias
const trechoRepoOriginal = `// 2. Garante as 9 competências oficiais de 2026 (01/2026 a 09/2026) caso não tenham sido excluídas manualmente
            if (typeof SEED_COMPETENCIAS_2026 === 'object' && SEED_COMPETENCIAS_2026) {
                Object.keys(SEED_COMPETENCIAS_2026).forEach(k => {
                    if (!resultado[k] && !excluidas.has(k)) {
                        const norm = normalizarRegistroCompetencia(k, SEED_COMPETENCIAS_2026[k]);
                        if (norm && norm.data.length > 0) {
                            resultado[norm.chave] = norm;
                            precisouCompactarOuSemear = true;
                        }
                    }
                });
            }`;

const trechoRepoNovo = `// 2. Garante as 9 competências oficiais de 2026 (01/2026 a 09/2026) ou atualiza se a semente oficial for mais recente/revisada
            if (typeof SEED_COMPETENCIAS_2026 === 'object' && SEED_COMPETENCIAS_2026) {
                Object.keys(SEED_COMPETENCIAS_2026).forEach(k => {
                    if (!excluidas.has(k)) {
                        const seedItem = SEED_COMPETENCIAS_2026[k];
                        const normSeed = normalizarRegistroCompetencia(k, seedItem);
                        // Se não existe localmente ou se o arquivo oficial tiver sido substituído/atualizado
                        if (!resultado[k]) {
                            if (normSeed && normSeed.data.length > 0) {
                                resultado[normSeed.chave] = normSeed;
                                precisouCompactarOuSemear = true;
                            }
                        } else if (seedItem && seedItem.salvoEm && resultado[k].salvoEm && new Date(seedItem.salvoEm) > new Date(resultado[k].salvoEm)) {
                            resultado[k] = normSeed;
                            precisouCompactarOuSemear = true;
                        }
                    }
                });
            }`;

if (novoHtml.includes(trechoRepoOriginal)) {
  novoHtml = novoHtml.replace(trechoRepoOriginal, trechoRepoNovo);
}

fs.writeFileSync(filePath, novoHtml, 'utf8');
fs.writeFileSync('public/index.html', novoHtml, 'utf8');
console.log('Sucesso! SEED de 09/2026 e lógica de atualização sincronizados.');

