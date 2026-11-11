const fs = require('fs');

const filePath = 'Analise_orcamentaria_2026_ANALISE_GESTOR_v2.html';
let html = fs.readFileSync(filePath, 'utf8');

console.log('Tamanho original:', html.length);

// 1. Modificar cabeçalho e cards no modalAdminAcessos
const cardOriginal = `<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div onclick="filtrarStatusAdminCard('TODOS')" class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-[#00ab97] transition-all">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Total de Contas</span>
                        <div class="flex items-center justify-between mt-1">
                            <strong id="admCardTotal" class="text-xl font-extrabold text-slate-800">0</strong>
                            <i class="fa-solid fa-users text-slate-400 text-base"></i>
                        </div>
                    </div>`;

const cardNovo = `<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div onclick="filtrarStatusAdminCard('ONLINE')" class="bg-emerald-50/90 p-3.5 rounded-xl border-2 border-emerald-500 shadow-xs cursor-pointer hover:bg-emerald-100/80 transition-all">
                        <span class="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            Online Agora
                        </span>
                        <div class="flex items-center justify-between mt-1">
                            <strong id="admCardOnline" class="text-xl font-extrabold text-emerald-700">0</strong>
                            <i class="fa-solid fa-signal text-emerald-600 text-base"></i>
                        </div>
                    </div>
                    <div onclick="filtrarStatusAdminCard('TODOS')" class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-[#00ab97] transition-all">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Total de Contas</span>
                        <div class="flex items-center justify-between mt-1">
                            <strong id="admCardTotal" class="text-xl font-extrabold text-slate-800">0</strong>
                            <i class="fa-solid fa-users text-slate-400 text-base"></i>
                        </div>
                    </div>`;

if (!html.includes(cardOriginal)) {
    console.error('ERRO: Não encontrou cardOriginal no HTML!');
    process.exit(1);
}
html = html.replace(cardOriginal, cardNovo);

// 2. Modificar o filtro de status <select id="admFiltroStatus"> para incluir "Online Agora"
const selectOriginal = `<select id="admFiltroStatus" onchange="renderTabelaUsuariosAdmin()"
                            class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00ab97]">
                            <option value="TODOS">Todos os Usuários</option>`;

const selectNovo = `<select id="admFiltroStatus" onchange="renderTabelaUsuariosAdmin()"
                            class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00ab97]">
                            <option value="TODOS">Todos os Usuários</option>
                            <option value="ONLINE">🟢 Online Agora</option>`;

if (!html.includes(selectOriginal)) {
    console.error('ERRO: Não encontrou selectOriginal no HTML!');
    process.exit(1);
}
html = html.replace(selectOriginal, selectNovo);

// 3. Modificar o cabeçalho da tabela de usuários
const theadOriginal = `<tr class="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-200">
                                    <th class="p-3">Usuário / E-mail</th>
                                    <th class="p-3">Cadastro / Último Acesso</th>
                                    <th class="p-3">Perfil</th>
                                    <th class="p-3 text-center">Status de Acesso</th>
                                    <th class="p-3 text-center">Ações de Autorização</th>
                                </tr>`;

const theadNovo = `<tr class="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-200">
                                    <th class="p-3">Usuário / E-mail</th>
                                    <th class="p-3">Conexão & Tempo Conectado</th>
                                    <th class="p-3">Último Acesso / Cadastro</th>
                                    <th class="p-3">Perfil</th>
                                    <th class="p-3 text-center">Status de Acesso</th>
                                    <th class="p-3 text-center">Ações de Autorização</th>
                                </tr>`;

if (!html.includes(theadOriginal)) {
    console.error('ERRO: Não encontrou theadOriginal no HTML!');
    process.exit(1);
}
html = html.replace(theadOriginal, theadNovo);

// 4. Injetar rotinas de Heartbeat e Rastreamento de Sessão na inicialização de login:
const pontoLoginOriginal = `// Atualiza último acesso
            reg.ultimoAcesso = agoraIso;
            if (user.displayName && (!reg.nome || reg.nome === emailNorm.split('@')[0])) {
                reg.nome = user.displayName;
            }
            mapaLocal[emailNorm] = reg;
            salvarUsuariosAcessoLocal(mapaLocal);
            if (dbFirestore && firebaseConectado) {
                try {
                    await dbFirestore.collection(FS_COL_USUARIOS).doc(emailNorm).set({ ultimoAcesso: agoraIso, nome: reg.nome || '' }, { merge: true });
                } catch (e) { }
            }`;

const pontoLoginNovo = `// Atualiza último acesso e inicia dados de sessão ativa
            reg.ultimoAcesso = agoraIso;
            reg.inicioSessaoAtual = agoraIso;
            reg.ultimoHeartbeat = agoraIso;
            reg.online = true;
            if (user.displayName && (!reg.nome || reg.nome === emailNorm.split('@')[0])) {
                reg.nome = user.displayName;
            }
            mapaLocal[emailNorm] = reg;
            salvarUsuariosAcessoLocal(mapaLocal);
            if (dbFirestore && firebaseConectado) {
                try {
                    await dbFirestore.collection(FS_COL_USUARIOS).doc(emailNorm).set({
                        ultimoAcesso: agoraIso,
                        inicioSessaoAtual: agoraIso,
                        ultimoHeartbeat: agoraIso,
                        online: true,
                        nome: reg.nome || ''
                    }, { merge: true });
                } catch (e) { }
            }
            // Dispara rastreamento ativo de heartbeat e tempo conectado
            if (typeof iniciarRastreamentoSessaoUsuario === 'function') {
                iniciarRastreamentoSessaoUsuario(emailNorm);
            }`;

if (!html.includes(pontoLoginOriginal)) {
    console.error('ERRO: Não encontrou pontoLoginOriginal no HTML!');
    process.exit(1);
}
html = html.replace(pontoLoginOriginal, pontoLoginNovo);

// 5. Substituir function atualizarContadoresAdminUI() pelo novo bloco completo com helpers
const pontoAtualizarContadores = `function atualizarContadoresAdminUI() {
            const lista = Object.values(cacheUsuariosAdmin || {});
            const total = lista.length;
            const pendentes = lista.filter(u => u.status === 'pendente' && !ehAdministrador(u.email)).length;
            const aprovados = lista.filter(u => u.status === 'aprovado' || ehAdministrador(u.email)).length;
            const bloqueados = lista.filter(u => u.status === 'bloqueado' && !ehAdministrador(u.email)).length;

            const elTotal = document.getElementById('admCardTotal');
            const elPend = document.getElementById('admCardPendentes');
            const elAprov = document.getElementById('admCardAprovados');
            const elBloq = document.getElementById('admCardBloqueados');
            const badgeSidebar = document.getElementById('badgeAdminPendentesSidebar');

            if (elTotal) elTotal.textContent = total;
            if (elPend) elPend.textContent = pendentes;
            if (elAprov) elAprov.textContent = aprovados;
            if (elBloq) elBloq.textContent = bloqueados;

            if (badgeSidebar) {
                if (pendentes > 0) {
                    badgeSidebar.textContent = pendentes;
                    badgeSidebar.classList.remove('hidden');
                } else {
                    badgeSidebar.classList.add('hidden');
                }
            }
        }`;

const novoBlocoAdminComTempo = `// Auxiliares de Rastreamento de Sessão e Tempo Conectado
        let timerHeartbeatSessao = null;

        window.formatarDuracaoAmigavel = function (segundosTotais) {
            const s = Math.max(0, Math.floor(Number(segundosTotais) || 0));
            if (s < 60) return s === 1 ? '1 segundo' : (s + ' segundos');
            const minutos = Math.floor(s / 60);
            if (minutos < 60) {
                const segRest = s % 60;
                return segRest > 0 ? (minutos + 'min ' + segRest + 's') : (minutos + ' min');
            }
            const horas = Math.floor(minutos / 60);
            const minRest = minutos % 60;
            if (horas < 24) {
                return minRest > 0 ? (horas + 'h ' + minRest + 'min') : (horas + 'h');
            }
            const dias = Math.floor(horas / 24);
            const horasRest = horas % 24;
            return horasRest > 0 ? (dias + 'd ' + horasRest + 'h') : (dias + ' dias');
        };

        window.formatarDataHoraExata = function (isoStr) {
            if (!isoStr) return '-';
            try {
                const dt = new Date(isoStr);
                if (isNaN(dt.getTime())) return '-';
                return dt.toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
            } catch (e) {
                return '-';
            }
        };

        window.calcularTempoDecorridoRelativo = function (isoStr) {
            if (!isoStr) return '';
            try {
                const agora = Date.now();
                const dt = new Date(isoStr).getTime();
                if (isNaN(dt)) return '';
                const diffSegundos = Math.max(0, Math.floor((agora - dt) / 1000));
                if (diffSegundos < 60) return 'agora há pouco';
                const min = Math.floor(diffSegundos / 60);
                if (min < 60) return ('há ' + min + ' min');
                const hrs = Math.floor(min / 60);
                if (hrs < 24) return ('há ' + hrs + 'h');
                const dias = Math.floor(hrs / 24);
                return ('há ' + dias + 'd');
            } catch (e) {
                return '';
            }
        };

        window.verificarUsuarioOnlineAgora = function (usuario) {
            if (!usuario) return false;
            // Se o próprio usuário logado for este, ele está online
            const emailLogado = normalizarEmailAcesso(obterEmailUsuarioLogado());
            const emailUsuario = normalizarEmailAcesso(usuario.email);
            if (emailLogado && emailLogado === emailUsuario) return true;

            // Heartbeat recente nos últimos 3 minutos (180 segundos)
            const refHeartbeat = usuario.ultimoHeartbeat || usuario.ultimoAcesso;
            if (!refHeartbeat) return false;
            try {
                const dt = new Date(refHeartbeat).getTime();
                if (isNaN(dt)) return false;
                const diffMin = (Date.now() - dt) / (1000 * 60);
                return diffMin <= 3;
            } catch (e) {
                return false;
            }
        };

        window.iniciarRastreamentoSessaoUsuario = function (emailNorm) {
            if (!emailNorm) return;
            const email = normalizarEmailAcesso(emailNorm);
            if (!email) return;

            // Se já houver timer, limpa antes
            if (timerHeartbeatSessao) {
                clearInterval(timerHeartbeatSessao);
                timerHeartbeatSessao = null;
            }

            const chaveInicio = 'sessao_inicio_' + email;
            if (!sessionStorage.getItem(chaveInicio)) {
                sessionStorage.setItem(chaveInicio, new Date().toISOString());
            }

            // Heartbeat a cada 45 segundos
            timerHeartbeatSessao = setInterval(async () => {
                try {
                    const agoraIso = new Date().toISOString();
                    const inicioSessaoIso = sessionStorage.getItem(chaveInicio) || agoraIso;
                    const duracaoSessaoAtualSeg = Math.max(0, Math.floor((Date.now() - new Date(inicioSessaoIso).getTime()) / 1000));

                    // Atualiza localmente
                    const mapa = carregarUsuariosAcessoLocal();
                    if (mapa[email]) {
                        mapa[email].ultimoHeartbeat = agoraIso;
                        mapa[email].ultimoAcesso = agoraIso;
                        mapa[email].online = true;
                        mapa[email].duracaoSessaoAtualSeg = duracaoSessaoAtualSeg;
                        mapa[email].tempoTotalConectadoSeg = (Number(mapa[email].tempoTotalConectadoSeg) || 0) + 45;
                        salvarUsuariosAcessoLocal(mapa);
                    }

                    // Grava no Firestore se conectado
                    if (dbFirestore && firebaseConectado) {
                        await dbFirestore.collection(FS_COL_USUARIOS).doc(email).set({
                            ultimoHeartbeat: agoraIso,
                            ultimoAcesso: agoraIso,
                            online: true,
                            duracaoSessaoAtualSeg: duracaoSessaoAtualSeg,
                            tempoTotalConectadoSeg: firebase.firestore.FieldValue.increment(45)
                        }, { merge: true });
                    }
                } catch (e) {
                    // Silencioso em caso de falha transitória de rede
                }
            }, 45000);

            // Ao fechar ou recarregar a janela, marca como offline
            window.addEventListener('beforeunload', () => {
                try {
                    const agoraIso = new Date().toISOString();
                    if (dbFirestore && firebaseConectado) {
                        dbFirestore.collection(FS_COL_USUARIOS).doc(email).set({
                            ultimoHeartbeat: agoraIso,
                            online: false
                        }, { merge: true });
                    }
                } catch (e) { }
            });
        };

        function atualizarContadoresAdminUI() {
            const lista = Object.values(cacheUsuariosAdmin || {});
            const total = lista.length;
            const pendentes = lista.filter(u => u.status === 'pendente' && !ehAdministrador(u.email)).length;
            const aprovados = lista.filter(u => u.status === 'aprovado' || ehAdministrador(u.email)).length;
            const bloqueados = lista.filter(u => u.status === 'bloqueado' && !ehAdministrador(u.email)).length;
            const online = lista.filter(u => verificarUsuarioOnlineAgora(u)).length;

            const elTotal = document.getElementById('admCardTotal');
            const elPend = document.getElementById('admCardPendentes');
            const elAprov = document.getElementById('admCardAprovados');
            const elBloq = document.getElementById('admCardBloqueados');
            const elOnline = document.getElementById('admCardOnline');
            const badgeSidebar = document.getElementById('badgeAdminPendentesSidebar');

            if (elTotal) elTotal.textContent = total;
            if (elPend) elPend.textContent = pendentes;
            if (elAprov) elAprov.textContent = aprovados;
            if (elBloq) elBloq.textContent = bloqueados;
            if (elOnline) elOnline.textContent = online;

            if (badgeSidebar) {
                if (pendentes > 0) {
                    badgeSidebar.textContent = pendentes;
                    badgeSidebar.classList.remove('hidden');
                } else {
                    badgeSidebar.classList.add('hidden');
                }
            }
        }`;

if (!html.includes(pontoAtualizarContadores)) {
    console.error('ERRO: Não encontrou pontoAtualizarContadores no HTML!');
    process.exit(1);
}
html = html.replace(pontoAtualizarContadores, novoBlocoAdminComTempo);

// 6. Substituir a função renderTabelaUsuariosAdmin original
const idxRenderStart = html.indexOf('window.renderTabelaUsuariosAdmin = function () {');
const idxRenderEnd = html.indexOf('window.alterarStatusUsuarioAdmin = async function (email, novoStatus) {');

if (idxRenderStart === -1 || idxRenderEnd === -1) {
    console.error('ERRO: Não encontrou delimitadores de renderTabelaUsuariosAdmin!');
    process.exit(1);
}

const renderNovoCodigo = `window.renderTabelaUsuariosAdmin = function () {
            const tbody = document.getElementById('admTabelaUsuariosBody');
            if (!tbody) return;

            const filtroStatus = (document.getElementById('admFiltroStatus') ? document.getElementById('admFiltroStatus').value : 'TODOS');
            const termo = (document.getElementById('admBuscaInput') ? document.getElementById('admBuscaInput').value : '').toLowerCase().trim();

            let lista = Object.values(cacheUsuariosAdmin || {});

            // Ordena: primeiro quem está Online agora, depois pendentes, depois admin, depois por último acesso mais recente
            lista.sort((a, b) => {
                const onlineA = verificarUsuarioOnlineAgora(a);
                const onlineB = verificarUsuarioOnlineAgora(b);
                if (onlineA && !onlineB) return -1;
                if (!onlineA && onlineB) return 1;
                if (a.status === 'pendente' && b.status !== 'pendente') return -1;
                if (a.status !== 'pendente' && b.status === 'pendente') return 1;
                if (ehAdministrador(a.email)) return -1;
                if (ehAdministrador(b.email)) return 1;
                return String(b.ultimoAcesso || b.solicitadoEm || '').localeCompare(String(a.ultimoAcesso || a.solicitadoEm || ''));
            });

            if (filtroStatus === 'ONLINE') {
                lista = lista.filter(u => verificarUsuarioOnlineAgora(u));
            } else if (filtroStatus !== 'TODOS') {
                lista = lista.filter(u => {
                    const st = ehAdministrador(u.email) ? 'aprovado' : (u.status || 'pendente');
                    return st === filtroStatus;
                });
            }

            if (termo) {
                lista = lista.filter(u =>
                    String(u.email || '').toLowerCase().includes(termo) ||
                    String(u.nome || '').toLowerCase().includes(termo)
                );
            }

            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-400 font-medium"><i class="fa-solid fa-users-slash text-2xl mb-2 block text-slate-300"></i>Nenhum usuário encontrado para o filtro selecionado.</td></tr>';
                return;
            }

            tbody.innerHTML = lista.map(u => {
                const email = normalizarEmailAcesso(u.email);
                const isAdm = ehAdministrador(email);
                const nome = u.nome || email.split('@')[0];
                const status = isAdm ? 'aprovado' : (u.status || 'pendente');
                const isOnline = verificarUsuarioOnlineAgora(u);

                // Datas formatadas
                const dtSolic = formatarDataHoraExata(u.solicitadoEm);
                const dtUlt = formatarDataHoraExata(u.ultimoAcesso);
                const relUlt = calcularTempoDecorridoRelativo(u.ultimoAcesso);

                // Tempos de conexão
                let tempoSessaoAtual = 0;
                if (isOnline) {
                    if (u.duracaoSessaoAtualSeg) {
                        tempoSessaoAtual = Number(u.duracaoSessaoAtualSeg);
                    } else if (u.inicioSessaoAtual) {
                        tempoSessaoAtual = Math.max(0, Math.floor((Date.now() - new Date(u.inicioSessaoAtual).getTime()) / 1000));
                    }
                }
                const tempoTotalSeg = Math.max(tempoSessaoAtual, Number(u.tempoTotalConectadoSeg) || 0);

                // Badge de Conexão
                let badgeConexao = '';
                if (isOnline) {
                    const durSessaoTxt = formatarDuracaoAmigavel(tempoSessaoAtual);
                    badgeConexao = '<div class="flex flex-col gap-0.5">' +
                        '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">' +
                            '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>' +
                            '🟢 Online Agora' +
                        '</span>' +
                        '<span class="text-[11px] text-emerald-700 font-semibold mt-0.5">' +
                            '<i class="fa-regular fa-clock"></i> Sessão atual: <strong>' + durSessaoTxt + '</strong>' +
                        '</span>' +
                        (tempoTotalSeg > tempoSessaoAtual ? ('<span class="text-[10px] text-slate-500">Total acumulado: ' + formatarDuracaoAmigavel(tempoTotalSeg) + '</span>') : '') +
                    '</div>';
                } else {
                    const totalTxt = tempoTotalSeg > 0 ? formatarDuracaoAmigavel(tempoTotalSeg) : 'Não registrado';
                    badgeConexao = '<div class="flex flex-col gap-0.5">' +
                        '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 w-fit">' +
                            '<i class="fa-solid fa-circle text-slate-400 text-[8px]"></i> Offline / Desconectado' +
                        '</span>' +
                        '<span class="text-[11px] text-slate-600 mt-0.5">' +
                            'Tempo acumulado: <strong class="text-slate-700">' + totalTxt + '</strong>' +
                        '</span>' +
                    '</div>';
                }

                let badgeStatus = '';
                if (status === 'aprovado') {
                    badgeStatus = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><i class="fa-solid fa-check-circle"></i> Autorizado</span>';
                } else if (status === 'bloqueado') {
                    badgeStatus = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200"><i class="fa-solid fa-ban"></i> Bloqueado</span>';
                } else {
                    badgeStatus = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"><i class="fa-solid fa-hourglass-half"></i> Pendente</span>';
                }

                const badgePerfil = isAdm
                    ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"><i class="fa-solid fa-crown text-amber-600"></i> Administrador</span>'
                    : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"><i class="fa-solid fa-user"></i> Usuário</span>';

                let acoesHtml = '';
                if (isAdm) {
                    acoesHtml = '<span class="text-[11px] text-slate-400 italic font-medium">Acesso Permanente</span>';
                } else {
                    const btnAprovar = status !== 'aprovado'
                        ? ('<button type="button" onclick="alterarStatusUsuarioAdmin(\\'' + escH(email) + '\\', \\'aprovado\\')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-xs flex items-center gap-1"><i class="fa-solid fa-check"></i> Autorizar</button>')
                        : '';
                    const btnBloquear = status !== 'bloqueado'
                        ? ('<button type="button" onclick="alterarStatusUsuarioAdmin(\\'' + escH(email) + '\\', \\'bloqueado\\')" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-xs flex items-center gap-1"><i class="fa-solid fa-ban"></i> Bloquear</button>')
                        : '';
                    const btnExcluir = '<button type="button" onclick="excluirUsuarioAdmin(\\'' + escH(email) + '\\')" title="Excluir registro" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors"><i class="fa-solid fa-trash-can"></i></button>';

                    acoesHtml = '<div class="flex items-center justify-center gap-1.5">' + btnAprovar + btnBloquear + btnExcluir + '</div>';
                }

                return '<tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">' +
                    '<td class="p-3">' +
                        '<div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">' +
                            (isOnline ? '<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>' : '') +
                            escH(nome) +
                        '</div>' +
                        '<div class="text-[11px] text-slate-500 font-mono">' + escH(email) + '</div>' +
                    '</td>' +
                    '<td class="p-3">' + badgeConexao + '</td>' +
                    '<td class="p-3 text-[11px] text-slate-600">' +
                        '<div>Último: <strong class="text-slate-800">' + dtUlt + '</strong> ' + (relUlt ? ('<span class="text-emerald-700 font-semibold">(' + relUlt + ')</span>') : '') + '</div>' +
                        '<div class="text-slate-400 text-[10px]">Cadastro: ' + dtSolic + '</div>' +
                    '</td>' +
                    '<td class="p-3">' + badgePerfil + '</td>' +
                    '<td class="p-3 text-center">' + badgeStatus + '</td>' +
                    '<td class="p-3 text-center">' + acoesHtml + '</td>' +
                '</tr>';
            }).join('');
        };

        `;

html = html.substring(0, idxRenderStart) + renderNovoCodigo + html.substring(idxRenderEnd);

// 7. Também inicializar o rastreamento na autenticação automática
const trechoAuthSuccess = `atualizarInterfaceUsuarioLogado(user, dadosAcesso.role);
                        iniciarMonitoramentoUsuariosAdmin();`;
const trechoAuthSuccessNovo = `atualizarInterfaceUsuarioLogado(user, dadosAcesso.role);
                        iniciarMonitoramentoUsuariosAdmin();
                        if (typeof iniciarRastreamentoSessaoUsuario === 'function') {
                            iniciarRastreamentoSessaoUsuario(normalizarEmailAcesso(user.email));
                        }`;

if (html.includes(trechoAuthSuccess)) {
    html = html.replace(trechoAuthSuccess, trechoAuthSuccessNovo);
}

// Grava
fs.writeFileSync(filePath, html, 'utf8');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Sucesso! Arquivos atualizados com sucesso.');
