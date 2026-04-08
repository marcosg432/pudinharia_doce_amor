/**
 * produto-ui.js — segundo WhatsApp nos cards + modal de produto (duas linhas de atendimento)
 * Depende de CONFIG (config.js). Não altera hrefs dos botões originais.
 */
(function () {
    'use strict';

    /** Fallback se config.js no deploy estiver sem telefoneWhatsAppAtendimento2 (alinhado a js/config.js). */
    var DEFAULT_WHATSAPP_ATENDIMENTO_2 = '5531999568591';

    function resolveWhatsAppAtendimento2() {
        var raw =
            typeof CONFIG !== 'undefined' && CONFIG.telefoneWhatsAppAtendimento2 != null
                ? String(CONFIG.telefoneWhatsAppAtendimento2)
                : '';
        var digits = raw.replace(/\D/g, '');
        if (digits.length >= 10) return digits;
        return String(DEFAULT_WHATSAPP_ATENDIMENTO_2).replace(/\D/g, '');
    }

    function getWaMessageFromHref(href) {
        if (!href) return '';
        try {
            const u = new URL(href, window.location.href);
            return u.searchParams.get('text') || '';
        } catch {
            return '';
        }
    }

    function buildWaMeUrl(phone, message) {
        const p = String(phone).replace(/\D/g, '');
        if (!message) return `https://wa.me/${p}`;
        return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
    }

    function isWhatsAppHref(href) {
        if (!href || href === '#') return false;
        const h = href.toLowerCase();
        return (
            h.includes('wa.me') ||
            h.includes('whatsapp.com') ||
            h.includes('api.whatsapp')
        );
    }

    function initDualWhatsAppOnCards() {
        const phone2 = resolveWhatsAppAtendimento2();
        const label = (typeof CONFIG !== 'undefined' && CONFIG.rotuloWhatsAppAtendimento2) || 'Atendimento 2';

        document.querySelectorAll('.produto-buttons').forEach((wrap) => {
            if (wrap.querySelector('.produto-whatsapp--atendimento2')) return;

            const primary = wrap.querySelector(
                'a.produto-whatsapp:not(.produto-whatsapp--atendimento2), a.btn-produto-whatsapp:not(.produto-whatsapp--atendimento2)'
            );
            if (!primary) return;

            const card = wrap.closest('.produto-card, .produto-card-home');
            const dataWa = card ? card.getAttribute('data-produto-whatsapp') || '' : '';

            const primaryHref = primary.getAttribute('href') || '';
            let href = primaryHref;
            if (!isWhatsAppHref(href) && isWhatsAppHref(dataWa)) {
                href = dataWa;
            }
            if (!isWhatsAppHref(href)) return;

            const msg = getWaMessageFromHref(primaryHref) || getWaMessageFromHref(dataWa) || getWaMessageFromHref(href);

            const sec = document.createElement('a');
            sec.href = buildWaMeUrl(phone2, msg);
            sec.target = '_blank';
            sec.rel = 'noopener noreferrer';
            sec.setAttribute('aria-label', label + ' — WhatsApp');

            if (primary.classList.contains('produto-whatsapp')) {
                sec.className = 'produto-whatsapp produto-whatsapp--atendimento2';
                const svg = primary.querySelector('svg');
                if (svg) {
                    sec.appendChild(svg.cloneNode(true));
                    sec.appendChild(document.createTextNode(' ' + label));
                } else {
                    sec.textContent = label;
                }
            } else {
                sec.className = 'btn-produto-whatsapp produto-whatsapp--atendimento2';
                sec.textContent = label;
            }

            primary.insertAdjacentElement('afterend', sec);
        });
    }

    /** Para script.js chamar depois de montar .produto-meta (deploys com HTML/URLs diferentes). */
    window.pudinhariaRunDualWhatsApp = initDualWhatsAppOnCards;

    /** Texto do primeiro WhatsApp (verde principal) — alinhado ao "Atendimento 2" */
    function initRotuloWhatsAppPrincipal() {
        const label =
            (typeof CONFIG !== 'undefined' && CONFIG.rotuloWhatsAppAtendimento1) || 'Atendimento 1';

        document.querySelectorAll('a.produto-whatsapp:not(.produto-whatsapp--atendimento2)').forEach((a) => {
            const svg = a.querySelector('svg');
            if (svg) {
                const svgClone = svg.cloneNode(true);
                a.replaceChildren();
                a.appendChild(svgClone);
                a.appendChild(document.createTextNode(' ' + label));
            } else {
                a.textContent = label;
            }
            a.setAttribute('aria-label', label + ' — WhatsApp');
        });

        document.querySelectorAll('a.btn-produto-whatsapp:not(.produto-whatsapp--atendimento2)').forEach((a) => {
            a.textContent = label;
            a.setAttribute('aria-label', label + ' — WhatsApp');
        });

        const mp = document.querySelector(
            '#produtoModal a.modal-produto-whatsapp:not(.modal-produto-whatsapp--atendimento2)'
        );
        if (mp) {
            const svg = mp.querySelector('svg');
            if (svg) {
                const svgClone = svg.cloneNode(true);
                mp.replaceChildren();
                mp.appendChild(svgClone);
                mp.appendChild(document.createTextNode(' ' + label));
            } else {
                mp.textContent = label;
            }
            mp.setAttribute('aria-label', label + ' — WhatsApp');
        }
    }

    function initProdutoModal() {
        const modal = document.getElementById('produtoModal');
        if (!modal) return;

        const phone2 = resolveWhatsAppAtendimento2();
        const label = (typeof CONFIG !== 'undefined' && CONFIG.rotuloWhatsAppAtendimento2) || 'Atendimento 2';

        const primary = modal.querySelector('a.modal-produto-whatsapp:not(.modal-produto-whatsapp--atendimento2)');
        if (!primary || modal.querySelector('.modal-produto-whatsapp--atendimento2')) return;

        const secondary = primary.cloneNode(true);
        secondary.classList.add('modal-produto-whatsapp--atendimento2');
        const svgEl = secondary.querySelector('svg');
        secondary.textContent = '';
        if (svgEl) secondary.appendChild(svgEl.cloneNode(true));
        secondary.appendChild(document.createTextNode(' ' + label));
        secondary.setAttribute('aria-label', label + ' — WhatsApp');
        secondary.href = '#';

        const row = document.createElement('div');
        row.className = 'modal-produto-wa-row';
        primary.parentNode.insertBefore(row, primary);
        row.appendChild(primary);
        row.appendChild(secondary);

        function setModalWhatsAppFromCard(card) {
            const wa = card.getAttribute('data-produto-whatsapp') || '';
            const msg = getWaMessageFromHref(wa);
            primary.href = wa || '#';
            secondary.href = buildWaMeUrl(phone2, msg);
        }

        function openModal(card) {
            const nome = card.getAttribute('data-produto-nome') || '';
            const desc = card.getAttribute('data-produto-descricao') || '';
            const img = card.getAttribute('data-produto-imagem') || '';
            const pedido = card.getAttribute('data-produto-pedido') || '';
            const ingredientes = card.getAttribute('data-produto-ingredientes') || '';

            const tituloEl = modal.querySelector('.modal-produto-nome');
            const descEl = modal.querySelector('.modal-produto-descricao');
            const pedidoEl = modal.querySelector('.modal-produto-pedido');
            if (tituloEl) tituloEl.textContent = nome;
            if (descEl) descEl.textContent = desc;
            if (pedidoEl) pedidoEl.textContent = pedido;

            const imgWrap = modal.querySelector('.modal-produto-img img');
            if (imgWrap) {
                imgWrap.src = img;
                imgWrap.alt = nome;
            }

            const ul = modal.querySelector('.modal-produto-ingredientes');
            const wrapIng = modal.querySelector('.modal-produto-ingredientes-wrap');
            if (ul && wrapIng) {
                ul.innerHTML = '';
                if (ingredientes && ingredientes.includes('|')) {
                    wrapIng.classList.remove('no-ingredientes');
                    ingredientes.split('|').forEach((ing) => {
                        const li = document.createElement('li');
                        li.textContent = ing.trim();
                        ul.appendChild(li);
                    });
                } else if (ingredientes.trim()) {
                    wrapIng.classList.remove('no-ingredientes');
                    const li = document.createElement('li');
                    li.textContent = ingredientes.trim();
                    ul.appendChild(li);
                } else {
                    wrapIng.classList.add('no-ingredientes');
                }
            }

            setModalWhatsAppFromCard(card);
            modal.classList.add('ativo');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('ativo');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        document.querySelectorAll('.produto-card, .produto-card-home').forEach((card) => {
            card.addEventListener('click', function (e) {
                if (e.target.closest('a, button, input, textarea, select, label')) return;
                openModal(card);
            });
        });

        modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('ativo')) closeModal();
        });
    }

    function initWhatsAppUiCards() {
        initDualWhatsAppOnCards();
        initRotuloWhatsAppPrincipal();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initWhatsAppUiCards();
        initProdutoModal();
        setTimeout(initDualWhatsAppOnCards, 0);
    });

    /* Garante 2º botão após tudo carregar (ex.: cache/antigas ordens de script no servidor). */
    window.addEventListener('load', function () {
        initWhatsAppUiCards();
        setTimeout(initDualWhatsAppOnCards, 100);
    });
})();
