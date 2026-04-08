/**
 * Garante o 2º WhatsApp nos cards na hora em que o script roda (síncrono).
 * Carregar logo após config.js e produto-ui.js — evita perder o botão por ordem
 * de DOMContentLoaded, PM2 ou cache agressivo do primeiro JS.
 */
(function () {
    'use strict';

    var FALLBACK_PHONE_2 = '5531999568591';

    function digitsPhone2() {
        var raw =
            typeof CONFIG !== 'undefined' && CONFIG.telefoneWhatsAppAtendimento2 != null
                ? String(CONFIG.telefoneWhatsAppAtendimento2)
                : '';
        var d = raw.replace(/\D/g, '');
        if (d.length >= 10) return d;
        return String(FALLBACK_PHONE_2).replace(/\D/g, '');
    }

    function label2() {
        return (typeof CONFIG !== 'undefined' && CONFIG.rotuloWhatsAppAtendimento2) || 'Atendimento 2';
    }

    function isWa(href) {
        if (!href || href === '#') return false;
        var h = href.toLowerCase();
        return (
            h.indexOf('wa.me') !== -1 ||
            h.indexOf('whatsapp.com') !== -1 ||
            h.indexOf('api.whatsapp') !== -1
        );
    }

    function getMsg(href) {
        if (!href) return '';
        try {
            var u = new URL(href, window.location.href);
            return u.searchParams.get('text') || '';
        } catch (e) {
            return '';
        }
    }

    function buildWa(phone, msg) {
        var p = String(phone).replace(/\D/g, '');
        if (!msg) return 'https://wa.me/' + p;
        return 'https://wa.me/' + p + '?text=' + encodeURIComponent(msg);
    }

    function run() {
        var phone2 = digitsPhone2();
        var lab = label2();
        var wraps = document.querySelectorAll('.produto-buttons');
        for (var i = 0; i < wraps.length; i++) {
            var wrap = wraps[i];
            if (wrap.querySelector('.produto-whatsapp--atendimento2')) continue;

            var primary = wrap.querySelector(
                'a.produto-whatsapp:not(.produto-whatsapp--atendimento2), a.btn-produto-whatsapp:not(.produto-whatsapp--atendimento2)'
            );
            if (!primary) continue;

            var card = wrap.closest('.produto-card, .produto-card-home');
            var dataWa = card ? card.getAttribute('data-produto-whatsapp') || '' : '';

            var primaryHref = primary.getAttribute('href') || '';
            var href = primaryHref;
            if (!isWa(href) && isWa(dataWa)) href = dataWa;
            if (!isWa(href)) continue;

            var msg = getMsg(primaryHref) || getMsg(dataWa) || getMsg(href);

            var sec = document.createElement('a');
            sec.href = buildWa(phone2, msg);
            sec.target = '_blank';
            sec.rel = 'noopener noreferrer';
            sec.setAttribute('aria-label', lab + ' — WhatsApp');

            if (primary.classList.contains('produto-whatsapp')) {
                sec.className = 'produto-whatsapp produto-whatsapp--atendimento2';
                var svg = primary.querySelector('svg');
                if (svg) {
                    sec.appendChild(svg.cloneNode(true));
                    sec.appendChild(document.createTextNode(' ' + lab));
                } else {
                    sec.textContent = lab;
                }
            } else {
                sec.className = 'btn-produto-whatsapp produto-whatsapp--atendimento2';
                sec.textContent = lab;
            }

            primary.insertAdjacentElement('afterend', sec);
        }
    }

    run();
})();
