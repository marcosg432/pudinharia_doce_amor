/**
 * pedido.js - Finalização de pedido e envio para WhatsApp
 * Sistema de pedidos reutilizável para cardápios digitais
 */

let regrasModalPendingConfirm = null;

/**
 * Monta a mensagem do pedido no formato especificado
 * @returns {string}
 */
function montarMensagemPedido() {
    const nome = (document.getElementById('nome') || {}).value?.trim();
    const telefone = (document.getElementById('telefone') || {}).value?.trim();
    const tipo = (document.getElementById('tipo') || {}).value?.trim();
    const endereco = (document.getElementById('endereco') || {}).value?.trim();
    const pagamento = (document.getElementById('pagamento') || {}).value?.trim();
    const observacao = (document.getElementById('observacao') || {}).value?.trim();

    let msg = 'NOVO PEDIDO\n\n';
    msg += 'ITENS:\n';
    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        msg += `${item.quantidade}x ${item.nome} - R$ ${formatarPreco(subtotal)}\n`;
    });
    msg += `\nTotal: R$ ${formatarPreco(calcularTotal())}\n\n`;
    msg += `Tipo: ${tipo || 'Não informado'}\n`;
    if (tipo === 'Entrega') {
        msg += `Endereço: ${endereco || '-'}\n`;
    }
    msg += `\nPagamento: ${pagamento || '-'}\n`;
    msg += `Observações: ${observacao || '-'}\n\n`;
    msg += `Nome: ${nome}\n`;
    msg += `Telefone: ${telefone}\n`;
    msg += '-------------';

    return msg;
}

/**
 * Valida os dados do formulário
 * @returns {string|null} Mensagem de erro ou null se válido
 */
function validarFormulario() {
    const nome = (document.getElementById('nome') || {}).value?.trim();
    const telefone = (document.getElementById('telefone') || {}).value?.trim();
    const tipo = (document.getElementById('tipo') || {}).value?.trim();
    const endereco = (document.getElementById('endereco') || {}).value?.trim();

    if (!nome) return 'Preencha o nome do cliente.';
    if (!telefone) return 'Preencha o telefone.';
    if (!tipo) return 'Selecione Entrega ou Retirada.';
    if (tipo === 'Entrega' && !endereco) return 'Preencha o endereço para entrega.';

    return null;
}

function regrasEncomendaAtivas() {
    try {
        const items =
            typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.regrasEncomendaItens)
                ? CONFIG.regrasEncomendaItens
                : [];
        return items.length > 0 && items.some((s) => String(s).trim());
    } catch {
        return false;
    }
}

function garantirModalRegras() {
    let modal = document.getElementById('modal-regras-encomenda');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'modal-regras-encomenda';
    modal.className = 'modal-overlay modal-regras-encomenda-overlay';
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
        <div class="modal-regras-box">
            <h2 class="modal-regras-titulo"></h2>
            <ul class="modal-regras-lista"></ul>
            <div class="modal-regras-rodape">
                <p class="modal-regras-rodape-script"></p>
                <a class="modal-regras-wa-link" href="#" target="_blank" rel="noopener noreferrer"></a>
            </div>
            <label class="modal-regras-checkbox-label">
                <input type="checkbox" id="modal-regras-aceito" />
                <span>Li e concordo com as regras acima.</span>
            </label>
            <div class="modal-regras-acoes">
                <button type="button" class="btn modal-regras-voltar">Voltar</button>
                <button type="button" class="btn btn-primary modal-regras-continuar" disabled>Enviar no WhatsApp</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function fecharModalRegras() {
    const modal = document.getElementById('modal-regras-encomenda');
    if (!modal) return;
    modal.classList.remove('ativo');
    modal.setAttribute('aria-hidden', 'true');
    const chk = modal.querySelector('#modal-regras-aceito');
    if (chk) chk.checked = false;
    const btnCont = modal.querySelector('.modal-regras-continuar');
    if (btnCont) btnCont.disabled = true;
    regrasModalPendingConfirm = null;
}

function abrirModalRegras(onConfirm) {
    const modal = garantirModalRegras();
    const titulo = modal.querySelector('.modal-regras-titulo');
    const ul = modal.querySelector('.modal-regras-lista');

    if (titulo) {
        titulo.textContent =
            (typeof CONFIG !== 'undefined' && CONFIG.regrasEncomendaTitulo) || 'Regras de encomenda';
    }
    if (ul) {
        ul.innerHTML = '';
        (typeof CONFIG !== 'undefined' && CONFIG.regrasEncomendaItens
            ? CONFIG.regrasEncomendaItens
            : []
        ).forEach((text) => {
            const t = String(text).trim();
            if (!t) return;
            const li = document.createElement('li');
            li.textContent = t;
            ul.appendChild(li);
        });
    }

    const rodape = modal.querySelector('.modal-regras-rodape');
    const rodapeScript = modal.querySelector('.modal-regras-rodape-script');
    const rodapeWa = modal.querySelector('.modal-regras-wa-link');
    const ctaRodape =
        typeof CONFIG !== 'undefined' && CONFIG.regrasEncomendaRodapeCursive
            ? String(CONFIG.regrasEncomendaRodapeCursive).trim()
            : '';
    const labelTel =
        typeof CONFIG !== 'undefined' && CONFIG.regrasEncomendaRodapeTelefoneLabel
            ? String(CONFIG.regrasEncomendaRodapeTelefoneLabel).trim()
            : '';
    const telDigits =
        typeof CONFIG !== 'undefined' && CONFIG.telefoneWhatsApp
            ? String(CONFIG.telefoneWhatsApp).replace(/\D/g, '')
            : '';

    if (rodapeScript) {
        rodapeScript.textContent = ctaRodape;
        rodapeScript.style.display = ctaRodape ? '' : 'none';
    }
    if (rodapeWa && telDigits) {
        rodapeWa.href = 'https://wa.me/' + telDigits;
        rodapeWa.innerHTML =
            '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
        if (labelTel) {
            const span = document.createElement('span');
            span.textContent = labelTel;
            rodapeWa.appendChild(span);
        }
        rodapeWa.style.display = '';
    } else if (rodapeWa) {
        rodapeWa.innerHTML = '';
        rodapeWa.style.display = 'none';
    }
    if (rodape) {
        const showRodape = !!(ctaRodape || (rodapeWa && telDigits));
        rodape.style.display = showRodape ? '' : 'none';
    }

    const chk = modal.querySelector('#modal-regras-aceito');
    const btnCont = modal.querySelector('.modal-regras-continuar');
    if (chk && btnCont) {
        chk.checked = false;
        btnCont.disabled = true;
    }

    regrasModalPendingConfirm = onConfirm;
    modal.classList.add('ativo');
    modal.setAttribute('aria-hidden', 'false');
}

function ligarEventosModalRegrasUmaVez() {
    const modal = garantirModalRegras();
    if (modal.dataset.bound === '1') return;
    modal.dataset.bound = '1';

    const chk = modal.querySelector('#modal-regras-aceito');
    const btnCont = modal.querySelector('.modal-regras-continuar');
    const btnVolt = modal.querySelector('.modal-regras-voltar');

    if (chk && btnCont) {
        chk.addEventListener('change', () => {
            btnCont.disabled = !chk.checked;
        });
    }
    if (btnVolt) {
        btnVolt.addEventListener('click', () => fecharModalRegras());
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) fecharModalRegras();
    });
    if (btnCont) {
        btnCont.addEventListener('click', () => {
            const c = modal.querySelector('#modal-regras-aceito');
            if (!c || !c.checked) return;
            const fn = regrasModalPendingConfirm;
            fecharModalRegras();
            if (typeof fn === 'function') fn();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (modal.classList.contains('ativo')) fecharModalRegras();
    });
}

/**
 * Abre WhatsApp, limpa carrinho e fecha painel do carrinho.
 */
function executarFinalizarPedido() {
    const telefone = CONFIG?.telefoneWhatsApp || '553197107058';
    const mensagem = montarMensagemPedido();
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');

    carrinho = [];
    salvarCarrinho(carrinho);
    atualizarCarrinho();
    atualizarBadge();
    fecharCarrinho();
}

/**
 * Finaliza o pedido: valida, exibe regras (se configuradas) e redireciona para WhatsApp
 */
function finalizarPedido() {
    if (carrinho.length === 0) {
        alert('Adicione itens ao carrinho antes de finalizar.');
        return;
    }

    const erro = validarFormulario();
    if (erro) {
        alert(erro);
        return;
    }

    if (regrasEncomendaAtivas()) {
        abrirModalRegras(executarFinalizarPedido);
    } else {
        executarFinalizarPedido();
    }
}

/**
 * Mostra ou esconde campo de endereço conforme tipo selecionado
 */
function toggleCampoEndereco() {
    const tipo = document.getElementById('tipo');
    const enderecoWrap = document.getElementById('endereco-wrap');
    const enderecoInput = document.getElementById('endereco');

    if (tipo && enderecoWrap) {
        if (tipo.value === 'Entrega') {
            enderecoWrap.style.display = 'block';
            if (enderecoInput) enderecoInput.required = true;
        } else {
            enderecoWrap.style.display = 'none';
            if (enderecoInput) {
                enderecoInput.required = false;
                enderecoInput.value = '';
            }
        }
    }
}

/**
 * Inicializa formulário de pedido
 */
function initPedido() {
    ligarEventosModalRegrasUmaVez();

    const btnFinalizar = document.querySelector('.btn-finalizar-pedido');
    const tipoSelect = document.getElementById('tipo');

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', finalizarPedido);
    }

    if (tipoSelect) {
        tipoSelect.addEventListener('change', toggleCampoEndereco);
        toggleCampoEndereco(); /* Estado inicial */
    }
}

document.addEventListener('DOMContentLoaded', initPedido);
