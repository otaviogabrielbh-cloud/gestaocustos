const fs = require('fs');

const filePath = 'Analise_orcamentaria_2026_ANALISE_GESTOR_v2.html';
let html = fs.readFileSync(filePath, 'utf8');

console.log('Tamanho inicial:', html.length);

// -------------------------------------------------------------
// 1. ADICIONAR NOVO BOTÃO NA BARRA LATERAL (SIDEBAR)
// -------------------------------------------------------------
const btnSidebarOriginal = `<button id="btnConfigGestores" onclick="abrirModalGestores()"
                            title="Cadastro e gerenciamento de gestores"
                            class="w-full px-3.5 py-2.5 text-xs font-semibold rounded text-teal-950 hover:text-white hover:bg-[#008f7e] transition-all flex items-center gap-3 text-left">
                            <i class="fa-solid fa-gear text-teal-900 text-base w-5 text-center flex-shrink-0"></i>
                            <span class="sidebar-text-label truncate">Cadastro de Gestores</span>
                        </button>`;

const btnSidebarNovo = `<button id="btnConfigGestores" onclick="abrirModalGestores()"
                            title="Cadastro e gerenciamento de gestores por centro de custo"
                            class="w-full px-3.5 py-2.5 text-xs font-semibold rounded text-teal-950 hover:text-white hover:bg-[#008f7e] transition-all flex items-center gap-3 text-left">
                            <i class="fa-solid fa-users-gear text-teal-900 text-base w-5 text-center flex-shrink-0"></i>
                            <span class="sidebar-text-label truncate">Cadastro de Gestores</span>
                        </button>

                        <button id="btnTextoPadraoEmail" onclick="abrirModalTextoPadraoEmail()"
                            title="Configurar modelo padrão de e-mail e texto de notificação"
                            class="w-full px-3.5 py-2.5 text-xs font-semibold rounded text-teal-950 hover:text-white hover:bg-[#008f7e] transition-all flex items-center gap-3 text-left">
                            <i class="fa-solid fa-envelope-open-text text-teal-900 text-base w-5 text-center flex-shrink-0"></i>
                            <span class="sidebar-text-label truncate">Texto Padrão de Envio</span>
                        </button>`;

if (!html.includes(btnSidebarOriginal)) {
    console.error('ERRO: btnSidebarOriginal não encontrado!');
    process.exit(1);
}
html = html.replace(btnSidebarOriginal, btnSidebarNovo);

// -------------------------------------------------------------
// 2. SEPARAR O MODAL EM DOIS MODAIS
// modalGestores: limpo, apenas centros e gestores
// modalTextoPadraoEmail: novo modal dedicado para o modelo
// -------------------------------------------------------------
const modalGestoresOriginalIdx = html.indexOf('<!-- MODAL CADASTRO DE GESTORES -->');
const modalAdminAcessosIdx = html.indexOf('<!-- MODAL DO ADMINISTRADOR: CONTROLE E AUTORIZAÇÃO DE ACESSOS -->');

if (modalGestoresOriginalIdx === -1 || modalAdminAcessosIdx === -1) {
    console.error('ERRO: Não encontrou delimitadores do modalGestores!');
    process.exit(1);
}

const novosModaisHtml = `<!-- MODAL CADASTRO DE GESTORES -->
    <div id="modalGestores"
        class="modal-overlay fixed inset-0 bg-slate-900/70 backdrop-blur-md hidden items-center justify-center z-[10000] p-4">
        <div
            class="modal-content bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <!-- Header -->
            <div class="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-base shadow">
                        <i class="fa-solid fa-users-gear"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm">Cadastro de Gestores dos Centros de Custo</h3>
                        <p class="text-[11px] text-slate-300">Vincule os gestores aos seus respectivos centros de custo</p>
                    </div>
                </div>
                <button onclick="fecharModalGestores()" class="text-slate-400 hover:text-white p-1.5 transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- Corpo -->
            <div class="p-5 space-y-4 overflow-y-auto text-xs bg-slate-50/40">
                <!-- Formulário de Gestor -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div>
                        <label class="font-semibold text-slate-700">Centro de Custo</label>
                        <input id="gestCentro" list="dlCentros" type="text" placeholder="Selecione ou digite..."
                            class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00ab97]">
                        <datalist id="dlCentros"></datalist>
                    </div>
                    <div>
                        <label class="font-semibold text-slate-700">Nome do Gestor</label>
                        <input id="gestNome" type="text" placeholder="Ex.: Adriana Silva"
                            class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00ab97]">
                    </div>
                    <div>
                        <label class="font-semibold text-slate-700">E-mail do Gestor</label>
                        <input id="gestEmail" type="email" placeholder="gestor@hmdcc.com.br"
                            class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00ab97]">
                    </div>
                    <button onclick="salvarGestor()"
                        class="md:col-span-3 py-2.5 px-4 bg-[#00ab97] hover:bg-[#008f7e] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs">
                        <i class="fa-solid fa-floppy-disk"></i> Salvar Gestor
                    </button>
                </div>

                <!-- Barra de Ações e Contagem -->
                <div class="flex flex-wrap gap-2 items-center justify-between pt-1">
                    <span id="gestContador" class="font-bold text-slate-700 text-xs"></span>
                    <div class="flex gap-2">
                        <button onclick="exportarGestores()"
                            class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-xs">
                            <i class="fa-solid fa-download text-slate-500"></i> Exportar JSON
                        </button>
                        <button onclick="document.getElementById('gestImportFile').click()"
                            class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-xs">
                            <i class="fa-solid fa-upload text-slate-500"></i> Importar JSON
                        </button>
                        <input type="file" id="gestImportFile" accept=".json" class="hidden"
                            onchange="importarGestores(this.files[0]); this.value=''">
                    </div>
                </div>

                <!-- Tabela de Gestores -->
                <div class="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs max-h-72">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-100/90 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200 sticky top-0">
                                <th class="p-3">Centro de Custo</th>
                                <th class="p-3">Gestor</th>
                                <th class="p-3">E-mail</th>
                                <th class="p-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="gestLista" class="divide-y divide-slate-100"></tbody>
                    </table>
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span class="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <i class="fa-solid fa-cloud-arrow-up text-[#00ab97]"></i> Sincronizado automaticamente no servidor Firebase.
                    </span>
                    <button type="button" onclick="fecharModalGestores(); abrirModalTextoPadraoEmail();"
                        class="text-amber-700 hover:text-amber-800 font-semibold underline flex items-center gap-1">
                        <i class="fa-solid fa-envelope-open-text"></i> Configurar Texto Padrão de Envio →
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL CADASTRO DE TEXTO PADRÃO DO E-MAIL -->
    <div id="modalTextoPadraoEmail"
        class="modal-overlay fixed inset-0 bg-slate-900/70 backdrop-blur-md hidden items-center justify-center z-[10000] p-4">
        <div
            class="modal-content bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <!-- Header -->
            <div class="p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex justify-between items-center border-b border-amber-800">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-white text-amber-700 flex items-center justify-center font-bold text-base shadow">
                        <i class="fa-solid fa-envelope-open-text"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm">Cadastro de Texto Padrão de Envio</h3>
                        <p class="text-[11px] text-amber-100">Configure o modelo oficial de assunto e mensagem disparado aos gestores</p>
                    </div>
                </div>
                <button onclick="fecharModalTextoPadraoEmail()" class="text-white/80 hover:text-white p-1.5 transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- Corpo -->
            <div class="p-5 space-y-4 overflow-y-auto text-xs bg-slate-50/40">
                <!-- Competência padrão -->
                <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <label class="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                        <i class="fa-regular fa-calendar text-amber-600"></i> Competência Padrão de Referência
                    </label>
                    <div class="flex items-center gap-3">
                        <input id="gestCompetencia" type="text" placeholder="Ex.: 09/2026"
                            class="max-w-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800">
                        <span class="text-[11px] text-slate-500">Usada no preenchimento dinâmico da variável <code class="bg-slate-100 px-1 py-0.5 rounded text-amber-800 font-bold">{competencia}</code></span>
                    </div>
                </div>

                <!-- Modelo do E-mail -->
                <div class="space-y-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span class="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                            <i class="fa-solid fa-pen-to-square text-amber-600"></i> Modelo do E-mail Oficial
                        </span>
                        <div class="flex gap-2">
                            <button type="button" onclick="restaurarModeloEmail()"
                                class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1 shadow-xs">
                                <i class="fa-solid fa-rotate-left text-slate-500"></i> Restaurar Padrão
                            </button>
                            <button type="button" onclick="salvarModeloEmail(true)"
                                class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors flex items-center gap-1.5 shadow-xs">
                                <i class="fa-solid fa-floppy-disk"></i> Salvar Modelo
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="font-semibold text-slate-700 block mb-1">Assunto do E-mail</label>
                        <input id="tplAssunto" type="text"
                            class="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium text-slate-800">
                    </div>

                    <div>
                        <label class="font-semibold text-slate-700 block mb-1">Corpo da Mensagem</label>
                        <textarea id="tplCorpo" rows="11"
                            class="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono text-[11px] leading-relaxed text-slate-800"></textarea>
                    </div>

                    <div class="bg-white/80 p-2.5 rounded-lg border border-amber-200/80">
                        <p class="text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                            <i class="fa-solid fa-code text-amber-600"></i> Variáveis disponíveis (clique para inserir no texto):
                        </p>
                        <span id="tplVars" class="inline-flex flex-wrap gap-1.5 align-middle"></span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span id="tplStatus" class="text-xs text-emerald-700 font-bold"></span>
                        <span class="text-[10px] text-slate-400">As alterações no modelo entram em vigor imediatamente para todas as notificações.</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onclick="fecharModalTextoPadraoEmail()"
                    class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors">
                    Fechar
                </button>
            </div>
        </div>
    </div>

    `;

html = html.substring(0, modalGestoresOriginalIdx) + novosModaisHtml + html.substring(modalAdminAcessosIdx);

// -------------------------------------------------------------
// 3. ATUALIZAR FUNÇÕES JAVASCRIPT
// - Adicionar abrirModalTextoPadraoEmail e fecharModalTextoPadraoEmail
// - Limpar abrirModalGestores e fecharModalGestores para não dependerem do tpl
// -------------------------------------------------------------
const idxJsAbrirGestores = html.indexOf('window.abrirModalGestores = function (centroPre) {');
const idxJsFecharGestores = html.indexOf('window.fecharModalGestores = function () {');

if (idxJsAbrirGestores === -1 || idxJsFecharGestores === -1) {
    console.error('ERRO: Não encontrou funções abrirModalGestores / fecharModalGestores no JS!');
    process.exit(1);
}

const trechoJsOriginal = html.substring(idxJsAbrirGestores, html.indexOf('function renderListaGestores() {'));

const novoBlocoJsModais = `window.abrirModalGestores = function (centroPre) {
            document.getElementById('dlCentros').innerHTML = centrosDisponiveis.map(c => \`<option value="\${escH(c)}">\`).join('');
            const g = centroPre ? getGestor(centroPre) : null;
            document.getElementById('gestCentro').value = centroPre || "";
            document.getElementById('gestNome').value = g ? g.nome : "";
            document.getElementById('gestEmail').value = g ? g.email : "";
            renderListaGestores();
            const m = document.getElementById('modalGestores');
            if (m) {
                m.classList.remove('hidden');
                m.classList.add('flex');
                requestAnimationFrame(() => { m.classList.add('modal-aberto'); });
            }
        };

        window.fecharModalGestores = function () {
            const m = document.getElementById('modalGestores');
            if (m) {
                m.classList.remove('modal-aberto');
                setTimeout(() => {
                    m.classList.add('hidden');
                    m.classList.remove('flex');
                }, 200);
            }
            if (!document.getElementById('modalDetalhes').classList.contains('hidden') && window.centroModalAtual) {
                atualizarBotaoNotificar(window.centroModalAtual, true);
            }
        };

        window.abrirModalTextoPadraoEmail = function () {
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
        };

        `;

html = html.replace(trechoJsOriginal, novoBlocoJsModais);

// Salva nos dois arquivos
fs.writeFileSync(filePath, html, 'utf8');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Sucesso! Cadastro de Gestores e Texto Padrão de Envio separados com êxito.');

