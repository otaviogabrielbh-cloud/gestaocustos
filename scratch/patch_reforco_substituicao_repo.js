const fs = require('fs');

const filePath = 'Analise_orcamentaria_2026_ANALISE_GESTOR_v2.html';
let html = fs.readFileSync(filePath, 'utf8');

console.log('Tamanho inicial:', html.length);

// 1. Melhorar a sincronização com a nuvem (sincronizarCompetenciasComNuvem)
// Se o dado na nuvem ou no arquivo for mais recente (salvoEm mais novo), sobrepõe a versão antiga!
const trechoSyncOriginal = `if (!repoLocal[chave]) {
                                repoLocal[chave] = norm;
                                alterouLocal = true;
                            }`;

const trechoSyncNovo = `if (!repoLocal[chave]) {
                                repoLocal[chave] = norm;
                                alterouLocal = true;
                            } else if (norm && norm.salvoEm && repoLocal[chave].salvoEm && new Date(norm.salvoEm) > new Date(repoLocal[chave].salvoEm)) {
                                // Se a nuvem tem uma versão substituída/mais recente da planilha, atualiza o local
                                repoLocal[chave] = norm;
                                alterouLocal = true;
                            }`;

if (!html.includes(trechoSyncOriginal)) {
    console.error('ERRO: trechoSyncOriginal não encontrado!');
    process.exit(1);
}
html = html.replace(trechoSyncOriginal, trechoSyncNovo);

// 2. Garantir que, ao carregar competências salvas (renderizarTabelaCompetenciasSalvas),
// qualquer base de cálculo anual (baseAnual, baseAnualOrc, baseEficienciaAnual) seja sincronizada com os dados do repositório
const trechoUploadOriginal = `repo[chaveComp] = registro;
                    baseAnual[mes] = dadosLimpos;
                    await salvarCompetenciaUnicaNoFirestore(registro);`;

const trechoUploadNovo = `repo[chaveComp] = registro;
                    baseAnual[mes] = dadosLimpos;
                    if (typeof baseAnualOrc === 'object') baseAnualOrc[mes] = dadosLimpos;
                    if (typeof baseEficienciaAnual === 'object') baseEficienciaAnual[mes] = dadosLimpos;
                    await salvarCompetenciaUnicaNoFirestore(registro);`;

if (!html.includes(trechoUploadOriginal)) {
    console.error('ERRO: trechoUploadOriginal não encontrado!');
    process.exit(1);
}
html = html.replace(trechoUploadOriginal, trechoUploadNovo);

// 3. Ao ativar qualquer competência pelo seletor ou repositório, garantir que se as bases anuais estiverem desatualizadas,
// elas reflitam imediatamente o item do repositório
const trechoAtivarRepoOriginal = `competenciaAtual = chaveComp;
            lsSet(LS_COMP, competenciaAtual);

            carregarDadosProcessados(item.data, item.fileName, true);`;

const trechoAtivarRepoNovo = `competenciaAtual = chaveComp;
            lsSet(LS_COMP, competenciaAtual);

            const mesIdAtivo = chaveComp.split('/')[0];
            if (mesIdAtivo && item.data) {
                baseAnual[mesIdAtivo] = item.data;
                if (typeof baseAnualOrc === 'object') baseAnualOrc[mesIdAtivo] = item.data;
                if (typeof baseEficienciaAnual === 'object') baseEficienciaAnual[mesIdAtivo] = item.data;
            }

            carregarDadosProcessados(item.data, item.fileName, true);`;

if (!html.includes(trechoAtivarRepoOriginal)) {
    console.error('ERRO: trechoAtivarRepoOriginal não encontrado!');
    process.exit(1);
}
html = html.replace(trechoAtivarRepoOriginal, trechoAtivarRepoNovo);

// Salva nos dois arquivos
fs.writeFileSync(filePath, html, 'utf8');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Sucesso! Mecanismo de substituição e sincronização de arquivos do repositório reforçado.');

