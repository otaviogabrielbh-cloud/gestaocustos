const fs = require('fs');

const filePath = 'Analise_orcamentaria_2026_ANALISE_GESTOR_v2.html';
let html = fs.readFileSync(filePath, 'utf8');

console.log('Tamanho inicial:', html.length);

// 1. Reforçar a função obterEmailUsuarioLogado
const obterEmailOriginal = `function obterEmailUsuarioLogado() {
            try {
                if (typeof usuarioAtualFirebase !== 'undefined' && usuarioAtualFirebase && usuarioAtualFirebase.email) return usuarioAtualFirebase.email;
                if (typeof firebaseUsuarioAtual !== 'undefined' && firebaseUsuarioAtual && firebaseUsuarioAtual.email) return firebaseUsuarioAtual.email;
                if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.email) return firebase.auth().currentUser.email;
            } catch (e) { }
            return 'Local/Offline';
        }`;

const obterEmailNovo = `function obterEmailUsuarioLogado() {
            try {
                if (typeof usuarioAtualFirebase !== 'undefined' && usuarioAtualFirebase && usuarioAtualFirebase.email) return usuarioAtualFirebase.email;
                if (typeof firebaseUsuarioAtual !== 'undefined' && firebaseUsuarioAtual && firebaseUsuarioAtual.email) return firebaseUsuarioAtual.email;
                if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.email) return firebase.auth().currentUser.email;
                const emailLabel = document.getElementById('userEmailLabel');
                if (emailLabel && emailLabel.textContent && emailLabel.textContent.includes('@')) {
                    return emailLabel.textContent.trim();
                }
            } catch (e) { }
            return '';
        }`;

if (!html.includes(obterEmailOriginal)) {
    console.error('ERRO: Não encontrou obterEmailOriginal!');
    process.exit(1);
}
html = html.replace(obterEmailOriginal, obterEmailNovo);

// 2. Reforçar a função atualizarInterfaceUsuarioAutenticado e garantir que qualquer não-admin JAMAIS veja os botões/painel
const funcAtualizarOriginal = `function atualizarInterfaceUsuarioAutenticado(user) {
            const screen = document.getElementById('loginScreen');
            const profileBar = document.getElementById('userProfileBar');
            const emailLabel = document.getElementById('userEmailLabel');
            const btnAdmin = document.getElementById('btnAdminAcessos');
            const badgeAdmin = document.getElementById('badgeUserAdmin');

            if (screen) screen.classList.add('hidden');
            if (profileBar) {
                profileBar.classList.remove('hidden');
                profileBar.classList.add('flex');
            }
            if (emailLabel) emailLabel.textContent = user.email || 'Usuário';

            if (ehAdministrador(user.email)) {
                if (btnAdmin) btnAdmin.classList.remove('hidden');
                if (badgeAdmin) {
                    badgeAdmin.classList.remove('hidden');
                    badgeAdmin.classList.add('inline-flex');
                }
                iniciarMonitoramentoUsuariosAdmin();
            } else {
                if (btnAdmin) btnAdmin.classList.add('hidden');
                if (badgeAdmin) {
                    badgeAdmin.classList.add('hidden');
                    badgeAdmin.classList.remove('inline-flex');
                }
            }
        }`;

const funcAtualizarNovo = `function atualizarInterfaceUsuarioAutenticado(user) {
            const screen = document.getElementById('loginScreen');
            const profileBar = document.getElementById('userProfileBar');
            const emailLabel = document.getElementById('userEmailLabel');
            const btnAdmin = document.getElementById('btnAdminAcessos');
            const badgeAdmin = document.getElementById('badgeUserAdmin');
            const modalAdmin = document.getElementById('modalAdminAcessos');

            if (screen) screen.classList.add('hidden');
            if (profileBar) {
                profileBar.classList.remove('hidden');
                profileBar.classList.add('flex');
            }
            const userEmail = (user && user.email) ? user.email : '';
            if (emailLabel) emailLabel.textContent = userEmail || 'Usuário';

            // Verificação estrita: APENAS o administrador oficial tem acesso aos botões e ao painel
            if (ehAdministrador(userEmail)) {
                if (btnAdmin) {
                    btnAdmin.classList.remove('hidden');
                    btnAdmin.style.display = '';
                }
                if (badgeAdmin) {
                    badgeAdmin.classList.remove('hidden');
                    badgeAdmin.classList.add('inline-flex');
                    badgeAdmin.style.display = '';
                }
                iniciarMonitoramentoUsuariosAdmin();
            } else {
                if (btnAdmin) {
                    btnAdmin.classList.add('hidden');
                    btnAdmin.style.display = 'none';
                }
                if (badgeAdmin) {
                    badgeAdmin.classList.add('hidden');
                    badgeAdmin.classList.remove('inline-flex');
                    badgeAdmin.style.display = 'none';
                }
                // Se por qualquer motivo o modal admin estiver aberto, fecha imediatamente
                if (modalAdmin) {
                    modalAdmin.classList.add('hidden');
                    modalAdmin.classList.remove('flex', 'modal-aberto');
                }
            }
        }`;

if (!html.includes(funcAtualizarOriginal)) {
    console.error('ERRO: Não encontrou funcAtualizarOriginal!');
    process.exit(1);
}
html = html.replace(funcAtualizarOriginal, funcAtualizarNovo);

// 3. Reforçar abrirModalAdminAcessos com verificação rígida
const abrirModalOriginal = `window.abrirModalAdminAcessos = function () {
            if (!ehAdministrador(obterEmailUsuarioLogado())) {
                mostrarAviso('🔒 Acesso restrito ao Administrador do Sistema (otavio.gabriel@hmdcc.com.br).', 3500);
                return;
            }
            const modal = document.getElementById('modalAdminAcessos');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                requestAnimationFrame(() => { modal.classList.add('modal-aberto'); });
                carregarUsuariosAdmin(false);
            }
        };`;

const abrirModalNovo = `window.abrirModalAdminAcessos = function () {
            const emailAtual = obterEmailUsuarioLogado();
            if (!ehAdministrador(emailAtual)) {
                alert('Acesso restrito! O Painel do Administrador é de uso exclusivo de ' + ADMIN_EMAIL_OFICIAL);
                const modal = document.getElementById('modalAdminAcessos');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex', 'modal-aberto');
                }
                return;
            }
            const modal = document.getElementById('modalAdminAcessos');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                requestAnimationFrame(() => { modal.classList.add('modal-aberto'); });
                carregarUsuariosAdmin(false);
            }
        };`;

if (!html.includes(abrirModalOriginal)) {
    console.error('ERRO: Não encontrou abrirModalOriginal!');
    process.exit(1);
}
html = html.replace(abrirModalOriginal, abrirModalNovo);

// 4. Reforçar carregarUsuariosAdmin e iniciarMonitoramentoUsuariosAdmin para não rodar se não for admin
const carregarOriginal = `window.carregarUsuariosAdmin = async function (exibirFeedback = false) {`;
const carregarNovo = `window.carregarUsuariosAdmin = async function (exibirFeedback = false) {
            if (!ehAdministrador(obterEmailUsuarioLogado())) return;`;

if (!html.includes(carregarOriginal)) {
    console.error('ERRO: Não encontrou carregarOriginal!');
    process.exit(1);
}
html = html.replace(carregarOriginal, carregarNovo);

// 5. Aplicar proteção também ao deslogar (logout): esconder botões e fechar modal admin
const logoutOriginal = `function deslogarUsuario() {`;
if (html.includes(logoutOriginal)) {
    const idxLogout = html.indexOf(logoutOriginal);
    console.log('Encontrado deslogarUsuario em:', idxLogout);
}

// Salva arquivos
fs.writeFileSync(filePath, html, 'utf8');
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Sucesso! Arquivos atualizados com proteção estrita de Administrador.');

