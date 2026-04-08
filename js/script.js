/**
 * Pudinharia Doce Sonho — Cardápio digital
 * Script principal - animações e funcionalidades
 */

document.addEventListener('DOMContentLoaded', function() {
    initProdutoMetaPreco();

    // Carrossel da hero section
    initHeroCarousel();
    
    // Menu mobile toggle
    initMobileMenu();
    
    // Scroll suave para links âncora
    initSmoothScroll();
    
    // Animações ao scroll
    initScrollAnimations();
    
    // Header com efeito no scroll
    initHeaderScroll();

    // Botão Voltar ao Topo
    initScrollToTop();
});

/**
 * Carrossel da Hero Section
 * Troca automática com fade a cada 3s, pausa no hover
 * Imagens pré-carregadas para evitar delay na troca de slides
 */
function initHeroCarousel() {
    const hero = document.querySelector('.hero-carousel');
    if (!hero) return;

    const slides = hero.querySelectorAll('.hero-slide');

    /* Pré-carregar imagens do carrossel */
    slides.forEach((slide) => {
        const bg = slide.querySelector('.hero-slide-bg');
        if (!bg) return;
        const style = bg.getAttribute('style') || '';
        const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
        if (match) {
            const img = new Image();
            img.src = match[1].trim();
        }
    });
    let currentIndex = 0;
    let autoPlayInterval;
    const INTERVAL_MS = 3000; // 3 segundos

    function updateSlideClasses() {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });
    }

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;
        updateSlideClasses();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(nextSlide, INTERVAL_MS);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);

    updateSlideClasses();
    startAutoPlay();
}

/**
 * Menu mobile - toggle e overlay
 * Dropdown: hover no desktop, clique no mobile
 */
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdownTrigger = document.querySelector('.nav-dropdown-trigger');
    const navDropdown = document.querySelector('.nav-dropdown');

    if (!navToggle || !navMenu) return;

    function closeMenu() {
        navToggle.classList.remove('ativo');
        navMenu.classList.remove('ativo');
        document.body.style.overflow = '';
        if (navDropdown) navDropdown.classList.remove('expanded');
        const overlay = document.querySelector('.nav-overlay');
        if (overlay) overlay.remove();
    }

    navToggle.addEventListener('click', function() {
        const isOpening = !navMenu.classList.contains('ativo');
        navToggle.classList.toggle('ativo');
        navMenu.classList.toggle('ativo');
        document.body.style.overflow = navMenu.classList.contains('ativo') ? 'hidden' : '';
        if (navDropdown) navDropdown.classList.remove('expanded');

        if (isOpening && window.innerWidth <= 992) {
            const overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeMenu);
        } else {
            const overlay = document.querySelector('.nav-overlay');
            if (overlay) overlay.remove();
        }
    });

    // Fechar ao clicar em um link (inclui links do dropdown)
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Dropdown: clique para expandir no mobile
    if (dropdownTrigger && navDropdown) {
        dropdownTrigger.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                e.stopPropagation();
                navDropdown.classList.toggle('expanded');
            }
        });
    }
}

/**
 * Scroll suave para âncoras
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Animações de entrada ao scroll (CSS: .js-scroll-reveal → .is-revealed)
 * Hover nos cards usa transform próprio; sem !important em transform.
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        [
            '.categoria-card',
            '.galeria-item',
            '.avaliacao-card',
            '.produto-card',
            '.produto-card-home',
            '#produtos .section-heading',
            '.galeria .section-heading',
            '.avaliacoes .section-heading'
        ].join(', ')
    );

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -72px 0px',
        threshold: 0.08
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('is-revealed');
                }, index * 70);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach((el) => {
        el.classList.add('js-scroll-reveal');
        observer.observe(el);
    });
}

/**
 * Header - mudança de estilo no scroll
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 25px rgba(92, 64, 51, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 20px rgba(92, 64, 51, 0.1)';
        }

        lastScroll = currentScroll;
    });
}

/**
 * Insere linha de tamanho + preço nos cards de produto (dados em data-produto-preco).
 */
function initProdutoMetaPreco() {
    const path = window.location.pathname.replace(/\\/g, '/');

    document.querySelectorAll('.produto-card[data-produto-preco], .produto-card-home[data-produto-preco]').forEach((card) => {
        if (card.querySelector('.produto-meta')) return;

        const precoRaw = card.getAttribute('data-produto-preco');
        const h3 = card.querySelector('.produto-content h3, .produto-content-home h3');
        if (!h3 || precoRaw == null || precoRaw === '') return;

        const num = parseFloat(String(precoRaw).replace(',', '.'), 10);
        if (Number.isNaN(num)) return;

        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(num);

        let tamanhoLabel = card.getAttribute('data-produto-tamanho');
        if (!tamanhoLabel) {
            if (path.includes('mini-pudins')) tamanhoLabel = 'Mini pote';
            else if (path.includes('pudins-classicos')) {
                tamanhoLabel = 'a porção serve de 8 a 10 pedaços';
            } else tamanhoLabel = '';
        }

        const meta = document.createElement('div');
        meta.className = 'produto-meta';
        if (tamanhoLabel) {
            const tSpan = document.createElement('span');
            tSpan.className = 'produto-tamanho';
            if (tamanhoLabel.includes('pedaços') || tamanhoLabel.length > 20) {
                tSpan.classList.add('produto-tamanho--porcao');
            }
            tSpan.textContent = tamanhoLabel;
            meta.appendChild(tSpan);
        }
        const pSpan = document.createElement('span');
        pSpan.className = 'produto-preco-card';
        if (!tamanhoLabel) pSpan.classList.add('produto-preco-card--solo');
        pSpan.textContent = formatted;
        meta.appendChild(pSpan);
        h3.insertAdjacentElement('afterend', meta);
    });

    if (typeof window.pudinhariaRunDualWhatsApp === 'function') {
        window.pudinhariaRunDualWhatsApp();
    }
}

/**
 * Botão Voltar ao Topo
 * Exibe quando o usuário rola a página e permite voltar suavemente ao topo
 */
function initScrollToTop() {
    const btn = document.querySelector('.scroll-to-top');
    if (!btn) return;

    const SHOW_THRESHOLD = 300; // px roladados para exibir o botão

    function toggleVisibility() {
        if (window.pageYOffset > SHOW_THRESHOLD) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    function scrollToTop(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    btn.addEventListener('click', scrollToTop);

    // Estado inicial
    toggleVisibility();
}
