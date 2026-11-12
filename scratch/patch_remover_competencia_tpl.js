const fs = require('fs');

const filePath = 'Analise_orcamentaria_2026_ANALISE_GESTOR_v2.html';
let html = fs.readFileSync(filePath, 'utf8');

console.log('Tamanho inicial:', html.length);

// 1. Remover o bloco de "Competência Padrão de Referência" do modalTextoPadraoEmail
// Opcionalmente substituindo por uma dica informativa elegante mostrando que a competência é puxada automaticamente do Mês Ativo
const blocoCompetenciaOriginal = `<!-- Competência padrão -->
                <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <label class="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                        <i class="fa-regular fa-calendar text-amber-600"></i> Competência Padrão de Referência
                    </label>
                    <div class="flex items-center gap-3">
                        <input id="gestCompetencia" type="text" placeholder="Ex.: 09/2026"
                            class="max-w-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800">
                        <span class="text-[11px] text-slate-500">Usada no preenchimento dinâmico da variável <code class="bg-slate-100 px-1 py-0.5 rounded text-amber-800 font-bold">{competencia}</code></span>
                    </div>
                </div>`;

const blocoCompetenciaNovo = `<!-- Informação da Competência Automática -->
                <div class="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2.5 text-emerald-900 font-medium">
                        <span class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                            <i class="fa-solid fa-calendar-check"></i>
                        </span>
                        <div>
                            <span class="font-bold text-emerald-950">Competência Dinâmica Automática:</span>
                            <span class="text-emerald-800 ml-1">O valor de <code class="bg-emerald-100/90 text-emerald-900 font-bold px-1.5 py-0.5 rounded border border-emerald-300">{competencia}</code> é obtido diretamente do <strong>Mês Ativo selecionado no cabeçalho</strong>.</span>
                        </div>
                    </div>
                    <span id="badgeMesAtivoTpl" class="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 font-mono font-bold rounded-lg text-xs whitespace-nowrap shadow-xs">
                        Mês Ativo: Automático
                    </span>
                </div>`;

if (!html.includes(blocoCompetenciaOriginal)) {
    console.error('ERRO: Não encontrou blocoCompetenciaOriginal no HTML!');
    process.exit(1);
}
html = html.replace(blocoCompetenciaOriginal, blocoCompetenciaNovo);

// 2. Atualizar abrirModalTextoPadraoEmail e fecharModalTextoPadraoEmail no JS
const jsAbrirFecharOriginal = `window.abrirModalTextoPadraoEmail = function () {
            const elComp = document.getElementById('gestCompetencia');
            if (elComp) elComp.value = competenciaAtual;
            carregarModeloNaTela();
            const m = document.getElementById('modalTextoPadraoEmail');
            if (m) {
                m.classList.remove('hidden');
                m.classList.add('flex');
                requestAnimationFrame(() => { m.classList.add('modal-aberto'); });
            }
        };

        window.fecharModalTextoPadraoEmail = function () {
            const elComp = document.getElementById('gestCompetencia');
            if (elComp) {
                competenciaAtual = elComp.value.trim();
                lsSet(LS_COMP, competenciaAtual);
            }
            salvarModeloEmail(false);
            const m = document.getElementById('modalTextoPadraoEmail');
            if (m) {
                m.classList.remove('modal-aberto');
                setTimeout(() => {
                    m.classList.add('hidden');
                    m.classList.remove('flex');
                }, 200);
            }
        };`;

const jsAbrirFecharNovo = `window.abrirModalTextoPadraoEmail = function () {
            const badgeMes = document.getElementById('badgeMesAtivoTpl');
            if (badgeMes) {
                const compVigente = (typeof competenciaAtual !== 'undefined' && competenciaAtual && competenciaAtual !== 'Vigente') ? competenciaAtual : (document.getElementById('selMesAtivo') ? document.getElementById('selMesAtivo').value : '09/2026');
                badgeMes.innerHTML = \`<i class="fa-regular fa-calendar text-emerald-600"></i> Mês Ativo: <strong class="text-emerald-950 font-bold">\${escH(compVigente || '09/2026')}</strong>\`;
            }
            carregarModeloNaTela();
            const m = document.getElementById('modalTextoPadraoEmail');
            if (m) {
                m.classList.remove('hidden');
                m.classList.add('flex');
                requestAnimationFrame(() => { m.classList.add('modal-aberto'); });
            }
        };

        window.fecharModalTextoPadraoEmail = function () {
            salvarModeloEmail(false);
            const m = document.getElementById('modalTextoPadraoEmail');
            if (m) {
                m.classList.remove('modal-aberto');
                setTimeout(() => {
                    m.classList.add('hidden');
                    m.classList.remove('flex');
                }, 200);
            }
        };`;

if (!html.includes(jsAbrirFecharOriginal)) {
    console.error('ERRO: Não encontrou jsAbrirFecharOriginal!');
    process.exit(1);
}
html = html.replace(jsAbrirFecharOriginal, jsAbrirFecharNovo);

// Salvar no arquivo principal e em public/index.html
fs.writeFileSync(filePath, html, 'utf8');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Sucesso! Campo de competência removido do cadastro de texto padrão e vinculado 100% ao Mês Ativo.');

