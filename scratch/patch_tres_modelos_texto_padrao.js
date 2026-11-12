const fs = require('fs');

const filePath = 'Analise_orcamentaria_2026_ANALISE_GESTOR_v2.html';
let html = fs.readFileSync(filePath, 'utf8');

console.log('Tamanho inicial:', html.length);

// -------------------------------------------------------------------------
// 1. ATUALIZAR O HTML DO MODAL modalTextoPadraoEmail COM SELETOR DE 3 ABAS
// -------------------------------------------------------------------------
const idxModalStart = html.indexOf('<!-- MODAL CADASTRO DE TEXTO PADRÃO DO E-MAIL -->');
const idxModalEnd = html.indexOf('<!-- MODAL DO ADMINISTRADOR: CONTROLE E AUTORIZAÇÃO DE ACESSOS -->');

if (idxModalStart === -1 || idxModalEnd === -1) {
    console.error('ERRO: Delimitadores do modalTextoPadraoEmail não encontrados!');
    process.exit(1);
}

const novoModalTextoPadraoHtml = `<!-- MODAL CADASTRO DE TEXTO PADRÃO DO E-MAIL -->
    <div id="modalTextoPadraoEmail"
        class="modal-overlay fixed inset-0 bg-slate-900/70 backdrop-blur-md hidden items-center justify-center z-[10000] p-4">
        <div
            class="modal-content bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <!-- Header -->
            <div class="p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex justify-between items-center border-b border-amber-800">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white text-amber-700 flex items-center justify-center font-bold text-lg shadow">
                        <i class="fa-solid fa-envelope-open-text"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-base">Modelos de Texto Padrão de Notificação (3 Marcos)</h3>
                        <p class="text-[11px] text-amber-100">Personalize o assunto e corpo dos 3 modelos de comunicação enviados aos gestores</p>
                    </div>
                </div>
                <button onclick="fecharModalTextoPadraoEmail()" class="text-white/80 hover:text-white p-1.5 transition-colors">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <!-- Corpo -->
            <div class="p-5 space-y-4 overflow-y-auto text-xs bg-slate-50/50">
                <!-- Informação da Competência Automática -->
                <div class="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2.5 text-emerald-900 font-medium">
                        <span class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                            <i class="fa-solid fa-calendar-check"></i>
                        </span>
                        <div>
                            <span class="font-bold text-emerald-950">Competência Dinâmica Automática:</span>
                            <span class="text-emerald-800 ml-1">A variável <code class="bg-emerald-100/90 text-emerald-900 font-bold px-1.5 py-0.5 rounded border border-emerald-300">{competencia}</code> é obtida automaticamente do <strong>Mês Ativo</strong> selecionado no cabeçalho.</span>
                        </div>
                    </div>
                    <span id="badgeMesAtivoTpl" class="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 font-mono font-bold rounded-lg text-xs whitespace-nowrap shadow-xs">
                        Mês Ativo: Automático
                    </span>
                </div>

                <!-- Seletor dos 3 Modelos de Marcos -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button type="button" id="tabMarcoBtn1" onclick="trocarAbaModeloEmail(1)"
                        class="p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-1 border-amber-500 bg-amber-50/80 shadow-xs">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">1º MARCO • 7º D.U.</span>
                            <i class="fa-solid fa-bell text-amber-600 text-sm"></i>
                        </div>
                        <div class="font-bold text-slate-900 text-xs mt-1">Lembrete (7º Dia Útil)</div>
                        <span class="text-[11px] text-slate-500">Cobrança amigável de encerramento do prazo de 6 d.u.</span>
                    </button>

                    <button type="button" id="tabMarcoBtn2" onclick="trocarAbaModeloEmail(2)"
                        class="p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-1 border-slate-200 bg-white hover:border-orange-300">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white">2º MARCO IMPORTANTE</span>
                            <i class="fa-solid fa-triangle-exclamation text-orange-600 text-sm"></i>
                        </div>
                        <div class="font-bold text-slate-900 text-xs mt-1">Não Realização da Análise</div>
                        <span class="text-[11px] text-slate-500">Cobrança formal com advertência de abertura de RNC.</span>
                    </button>

                    <button type="button" id="tabMarcoBtn3" onclick="trocarAbaModeloEmail(3)"
                        class="p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-1 border-slate-200 bg-white hover:border-rose-300">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">3º MARCO • RNC</span>
                            <i class="fa-solid fa-file-circle-exclamation text-rose-600 text-sm"></i>
                        </div>
                        <div class="font-bold text-slate-900 text-xs mt-1">Abertura de RNC Formal</div>
                        <span class="text-[11px] text-slate-500">Comunicação e abertura de Não Conformidade oficial.</span>
                    </button>
                </div>

                <!-- Painel de Edição do Modelo Selecionado -->
                <div class="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div class="flex items-center gap-2">
                            <span id="labelMarcoAtivoBadge" class="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                                1º Marco (7º Dia Útil)
                            </span>
                            <span class="text-xs text-slate-400">Edição do texto padrão</span>
                        </div>
                        <div class="flex gap-2">
                            <button type="button" onclick="restaurarModeloEmail()"
                                class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1 shadow-xs">
                                <i class="fa-solid fa-rotate-left text-slate-500"></i> Restaurar Este Padrão
                            </button>
                            <button type="button" onclick="salvarModeloEmail(true)"
                                class="px-3.5 py-1.5 bg-[#00ab97] hover:bg-[#008f7e] text-white rounded-lg font-bold transition-colors flex items-center gap-1.5 shadow-xs">
                                <i class="fa-solid fa-floppy-disk"></i> Salvar Modelo
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="font-bold text-slate-700 block mb-1">Assunto do E-mail</label>
                        <input id="tplAssunto" type="text"
                            class="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00ab97] bg-white font-medium text-slate-800 text-xs">
                    </div>

                    <div>
                        <label class="font-bold text-slate-700 block mb-1">Corpo da Mensagem</label>
                        <textarea id="tplCorpo" rows="12"
                            class="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00ab97] bg-white font-mono text-[11px] leading-relaxed text-slate-800"></textarea>
                    </div>

                    <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <p class="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                            <i class="fa-solid fa-code text-[#00ab97]"></i> Variáveis automáticas (clique para inserir no texto):
                        </p>
                        <span id="tplVars" class="inline-flex flex-wrap gap-1.5 align-middle"></span>
                    </div>

                    <div class="flex items-center justify-between pt-1">
                        <span id="tplStatus" class="text-xs text-emerald-700 font-bold"></span>
                        <span class="text-[10px] text-slate-400">As alterações no modelo entram em vigor imediatamente para todos os disparos.</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onclick="fecharModalTextoPadraoEmail()"
                    class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors">
                    Fechar Janela
                </button>
            </div>
        </div>
    </div>

    `;

html = html.substring(0, idxModalStart) + novoModalTextoPadraoHtml + html.substring(idxModalEnd);

// -------------------------------------------------------------------------
// 2. ATUALIZAR A LÓGICA JAVASCRIPT DOS 3 MODELOS
// -------------------------------------------------------------------------
// Localizar a definição antiga de MODELO_PADRAO e as funções de modelo:
const idxJsStart = html.indexOf('const LS_TPL = \'hmdcc_modelo_email\';');
const idxJsEnd = html.indexOf('function montarEmailGestor(centro, g, opcaoMarco, protocoloRnc) {');

if (idxJsStart === -1 || idxJsEnd === -1) {
    console.error('ERRO: Delimitadores do JS de templates não encontrados!');
    process.exit(1);
}

const novoBlocoJsTemplates = `const LS_TPL = 'hmdcc_modelo_email';
        const LS_TPL_3MARCOS = 'hmdcc_modelos_email_3marcos_v2';

        const MODELOS_PADRAO_3MARCOS = {
            1: {
                nome: '1º Marco (7º Dia Útil)',
                assunto: '[7º DIA ÚTIL - LEMBRETE DE ANÁLISE] Pendência Orçamentária - {competencia} - {centro}',
                corpo: 'Prezado(a) {gestor},\\n\\n' +
                    'Lembramos que o prazo regulamentar de 6 (seis) dias úteis para a realização da Análise Orçamentária da competência {competencia} encerrou-se, e hoje atingimos o 7º Dia Útil (1º Marco Importante de Lembrete) sem identificarmos a justificativa do centro de custo "{centro}".\\n\\n' +
                    'Resumo do Centro de Custo ({competencia}):\\n' +
                    '• Orçado: {orcado}\\n' +
                    '• Realizado: {realizado}\\n' +
                    '• Variação (Estouro): {variacao}\\n\\n' +
                    'Contas com estouro pendentes de justificativa:\\n{contas}\\n\\n' +
                    'Solicitamos a realização imediata da análise no sistema de Gestão de Custos HMDCC para evitar o avanço ao 2º Marco (Notificação de Não Realização).\\n\\n' +
                    'Atenciosamente,\\nEquipe de Custos e Orçamento - HMDCC'
            },
            2: {
                nome: '2º Marco (Não Realização da Análise)',
                assunto: '[NÃO REALIZAÇÃO DA ANÁLISE ORÇAMENTÁRIA] 2º Marco Importante - {competencia} - {centro}',
                corpo: 'Prezado(a) {gestor},\\n\\n' +
                    'Após o encerramento do prazo inicial de 6 dias úteis e o envio do Lembrete no 7º Dia Útil (1º Marco), constatamos a NÃO REALIZAÇÃO da Análise Orçamentária referente ao centro de custo "{centro}" na competência {competencia}.\\n\\n' +
                    'Resumo do Centro de Custo ({competencia}):\\n' +
                    '• Orçado: {orcado}\\n' +
                    '• Realizado: {realizado}\\n' +
                    '• Variação (Estouro): {variacao}\\n\\n' +
                    'Contas com estouro sem justificativa:\\n{contas}\\n\\n' +
                    'Este comunicado constitui o 2º Marco Importante (Não Realização da Análise Orçamentária). Caso não haja regularização imediata, será emitido o Relatório de Não Conformidade (RNC).\\n\\n' +
                    'Atenciosamente,\\nEquipe de Custos e Orçamento - HMDCC'
            },
            3: {
                nome: '3º Marco (Relatório de Não Conformidade - RNC)',
                assunto: '[RELATÓRIO DE NÃO CONFORMIDADE - {protocolo_rnc}] Ausência de Análise Orçamentária - {competencia} - {centro}',
                corpo: 'Prezado(a) {gestor},\\n\\n' +
                    'Tendo em vista o esgotamento do prazo regulamentar de 6 dias úteis, o lembrete enviado no 7º Dia Útil (1º Marco) e a notificação de Não Realização da Análise Orçamentária (2º Marco) sem resposta no sistema, comunicamos a abertura do RELATÓRIO DE NÃO CONFORMIDADE ({protocolo_rnc}) para o centro de custo "{centro}" na competência {competencia}.\\n\\n' +
                    'Resumo do Desvio Não Justificado ({competencia}):\\n' +
                    '• Protocolo RNC: {protocolo_rnc}\\n' +
                    '• Orçado: {orcado}\\n' +
                    '• Realizado: {realizado}\\n' +
                    '• Variação (Estouro): {variacao}\\n\\n' +
                    'Contas contábeis em não conformidade:\\n{contas}\\n\\n' +
                    'Solicitamos tratativa imediata junto à Controladoria e Gestão de Custos.\\n\\n' +
                    'Atenciosamente,\\nEquipe de Custos e Orçamento - HMDCC'
            }
        };

        const VARIAVEIS_MODELO = ['{gestor}', '{centro}', '{competencia}', '{orcado}', '{realizado}', '{variacao}', '{contas}', '{protocolo_rnc}'];
        
        let marcoModeloAtivo = 1; // 1, 2 ou 3
        let modelosEmail3Marcos = (function () {
            const salvo = lsGet(LS_TPL_3MARCOS, null);
            if (salvo && typeof salvo === 'object') {
                return {
                    1: Object.assign({}, MODELOS_PADRAO_3MARCOS[1], salvo[1] || {}),
                    2: Object.assign({}, MODELOS_PADRAO_3MARCOS[2], salvo[2] || {}),
                    3: Object.assign({}, MODELOS_PADRAO_3MARCOS[3], salvo[3] || {})
                };
            }
            return {
                1: Object.assign({}, MODELOS_PADRAO_3MARCOS[1]),
                2: Object.assign({}, MODELOS_PADRAO_3MARCOS[2]),
                3: Object.assign({}, MODELOS_PADRAO_3MARCOS[3])
            };
        })();

        window.trocarAbaModeloEmail = function (numMarco) {
            // Salva antes de trocar se houver algo editado
            salvarModeloEmail(false);

            marcoModeloAtivo = Number(numMarco) || 1;

            // Atualiza botões das abas
            [1, 2, 3].forEach(n => {
                const btn = document.getElementById('tabMarcoBtn' + n);
                if (btn) {
                    if (n === marcoModeloAtivo) {
                        btn.classList.add('border-amber-500', 'bg-amber-50/80', 'shadow-xs');
                        btn.classList.remove('border-slate-200', 'bg-white');
                    } else {
                        btn.classList.remove('border-amber-500', 'bg-amber-50/80', 'shadow-xs');
                        btn.classList.add('border-slate-200', 'bg-white');
                    }
                }
            });

            // Atualiza label do marco ativo
            const lblBadge = document.getElementById('labelMarcoAtivoBadge');
            if (lblBadge) {
                if (marcoModeloAtivo === 1) {
                    lblBadge.textContent = '1º Marco (7º Dia Útil)';
                    lblBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300';
                } else if (marcoModeloAtivo === 2) {
                    lblBadge.textContent = '2º Marco (Não Realização da Análise)';
                    lblBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-100 text-orange-900 border border-orange-300';
                } else {
                    lblBadge.textContent = '3º Marco (Relatório de Não Conformidade - RNC)';
                    lblBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300';
                }
            }

            carregarModeloNaTela();
        };

        function carregarModeloNaTela() {
            const mod = modelosEmail3Marcos[marcoModeloAtivo] || MODELOS_PADRAO_3MARCOS[marcoModeloAtivo];
            const inpAssunto = document.getElementById('tplAssunto');
            const inpCorpo = document.getElementById('tplCorpo');
            if (inpAssunto) inpAssunto.value = mod.assunto || '';
            if (inpCorpo) inpCorpo.value = mod.corpo || '';

            const box = document.getElementById('tplVars');
            if (box) {
                box.innerHTML = "";
                VARIAVEIS_MODELO.forEach(v => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.textContent = v;
                    b.className = 'px-1.5 py-0.5 bg-white border border-slate-300 text-slate-700 rounded font-mono text-[10px] hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs';
                    b.onclick = () => {
                        const t = document.getElementById('tplCorpo');
                        if (!t) return;
                        const ini = t.selectionStart, fim = t.selectionEnd;
                        t.value = t.value.slice(0, ini) + v + t.value.slice(fim);
                        t.focus();
                        t.selectionStart = t.selectionEnd = ini + v.length;
                    };
                    box.appendChild(b);
                });
            }
            const st = document.getElementById('tplStatus');
            if (st) st.textContent = '';
        }

        window.salvarModeloEmail = function (avisar) {
            const inpAssunto = document.getElementById('tplAssunto');
            const inpCorpo = document.getElementById('tplCorpo');
            if (!inpAssunto || !inpCorpo) return;

            const assunto = inpAssunto.value.trim();
            const corpo = inpCorpo.value;

            if (!assunto || !corpo.trim()) {
                if (avisar) alert('Assunto e corpo do e-mail não podem ficar vazios.');
                return;
            }

            modelosEmail3Marcos[marcoModeloAtivo] = {
                nome: MODELOS_PADRAO_3MARCOS[marcoModeloAtivo].nome,
                assunto: assunto,
                corpo: corpo
            };

            lsSet(LS_TPL_3MARCOS, modelosEmail3Marcos);

            if (avisar) {
                const st = document.getElementById('tplStatus');
                if (st) {
                    st.textContent = \`✓ Modelo do \${modelosEmail3Marcos[marcoModeloAtivo].nome} salvo com sucesso!\`;
                    setTimeout(() => { if (st) st.textContent = ''; }, 3000);
                }
            }
        };

        window.restaurarModeloEmail = function () {
            const nomeMarco = MODELOS_PADRAO_3MARCOS[marcoModeloAtivo].nome;
            if (!confirm(\`Deseja restaurar o texto padrão oficial de fábrica para o "\${nomeMarco}"?\`)) return;

            modelosEmail3Marcos[marcoModeloAtivo] = Object.assign({}, MODELOS_PADRAO_3MARCOS[marcoModeloAtivo]);
            lsSet(LS_TPL_3MARCOS, modelosEmail3Marcos);
            carregarModeloNaTela();

            const st = document.getElementById('tplStatus');
            if (st) {
                st.textContent = '✓ Texto padrão oficial restaurado.';
                setTimeout(() => { if (st) st.textContent = ''; }, 2500);
            }
        };

        `;

html = html.substring(0, idxJsStart) + novoBlocoJsTemplates + html.substring(idxJsEnd);

// -------------------------------------------------------------------------
// 3. ATUALIZAR montarEmailGestor PARA CONSUMIR OS 3 MODELOS PERSONALIZADOS
// -------------------------------------------------------------------------
// Localizar a função montarEmailGestor e fazer ela utilizar os modelos de modelosEmail3Marcos
const idxMontarStart = html.indexOf('function montarEmailGestor(centro, g, opcaoMarco, protocoloRnc) {');
const idxMontarFim = html.indexOf('function mostrarAviso(html, ms) {');

if (idxMontarStart === -1 || idxMontarFim === -1) {
    console.error('ERRO: Delimitadores de montarEmailGestor não encontrados!');
    process.exit(1);
}

const novaFuncaoMontarEmail = `function montarEmailGestor(centro, g, opcaoMarco, protocoloRnc) {
            const it = (window.listaAtualJustificativa || []).find(i => i.centro === centro);
            const contas = rawExcelData.filter(r =>
                normC(r.centro) === normC(centro) && contasSelecionadasJust.has(r.conta) &&
                !(r.conta && r.conta.startsWith('3')) && (r.realizado - r.orcado) > 0.01 &&
                !(r.justificativa && r.justificativa.trim() && r.justificativa.trim() !== '-')
            ).sort((a, b) => (b.realizado - b.orcado) - (a.realizado - a.orcado));

            let listaContasTxt = "";
            let usadas = 0;
            for (const c of contas) {
                const linha = \`- \${c.conta} \${c.descricao}: \${formatMoeda(c.realizado - c.orcado)} acima\\n\`;
                if (listaContasTxt.length + linha.length > 950) break;
                listaContasTxt += linha;
                usadas++;
            }
            if (contas.length > usadas) {
                listaContasTxt += \`... e mais \${contas.length - usadas} conta(s). Consulte o detalhamento no sistema.\\n\`;
            }
            const textoContasFinal = listaContasTxt.trimEnd() || '(nenhuma conta listada)';

            const comp = (typeof competenciaAtual !== 'undefined' && competenciaAtual && competenciaAtual !== 'Vigente') ? competenciaAtual : (document.getElementById('selMesAtivo') ? document.getElementById('selMesAtivo').value : '09/2026');
            const orcadoStr = it ? formatMoeda(it.orcado) : '-';
            const realizadoStr = it ? formatMoeda(it.realizado) : '-';
            const variacaoStr = it ? formatMoeda(it.variacao) : '-';
            const nomeGestor = g && g.nome ? g.nome : 'Gestor(a)';
            const codRnc = protocoloRnc || \`RNC-\${String(comp).replace(/\\//g, '')}\`;

            // Seleciona o modelo configurado para o marco (1, 2 ou 3)
            const numMarco = (opcaoMarco === 2 || opcaoMarco === 3) ? opcaoMarco : 1;
            const tplAtivo = (modelosEmail3Marcos && modelosEmail3Marcos[numMarco]) 
                ? modelosEmail3Marcos[numMarco] 
                : MODELOS_PADRAO_3MARCOS[numMarco];

            const mapa = {
                '{gestor}': nomeGestor,
                '{centro}': centro,
                '{competencia}': comp,
                '{orcado}': orcadoStr,
                '{realizado}': realizadoStr,
                '{variacao}': variacaoStr,
                '{contas}': textoContasFinal,
                '{protocolo_rnc}': codRnc
            };

            const aplicar = txt => Object.keys(mapa).reduce((t, k) => t.split(k).join(mapa[k]), String(txt || ''));

            const assunto = aplicar(tplAtivo.assunto);
            const corpo = aplicar(tplAtivo.corpo);
            return { assunto, corpo };
        }

        `;

html = html.substring(0, idxMontarStart) + novaFuncaoMontarEmail + html.substring(idxMontarFim);

// Salva arquivos
fs.writeFileSync(filePath, html, 'utf8');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Sucesso! Implementados os 3 modelos de texto padrão integrados aos 3 Marcos de Notificação.');

