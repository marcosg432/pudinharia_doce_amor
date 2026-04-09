/**
 * Configurações do Sistema de Pedidos
 * Alterar apenas este arquivo para configurar em novos cardápios/clientes
 */
const CONFIG = {
    /** Número do WhatsApp com DDD (ex: 553197107058) */
    telefoneWhatsApp: "553197107058",
    /** Segundo canal de atendimento (cards e modal de produto) — só dígitos com país 55 */
    telefoneWhatsAppAtendimento2: "5531999568591",
    /** Rótulo do botão principal de WhatsApp nos cards e no modal de produto */
    rotuloWhatsAppAtendimento1: "Atendimento 1",
    /** Rótulo do botão secundário nos cards */
    rotuloWhatsAppAtendimento2: "Atendimento 2",
    /** Perfil oficial no Instagram */
    urlInstagram: "https://www.instagram.com/pudinhariadocesonho",
    /** Nome da empresa para identificação e chave do localStorage */
    nomeEmpresa: "Pudinharia Doce Sonho",
    /**
     * Regras exibidas no modal antes de enviar o pedido ao WhatsApp (array de strings).
     * Deixe vazio [] para não mostrar o passo extra.
     */
    regrasEncomendaTitulo: "Encomendas",
    regrasEncomendaItens: [
        "Para encomendas pedimos 24 hs para preparação.",
        "50% de sinal no ato do pedido, para confirmação do pedido.",
        "Fazemos entregas (consultar taxa).",
        "Retirada: combinar local e horário."
    ],
    /** Texto cursivo abaixo das regras no modal (opcional; vazio oculta) */
    regrasEncomendaRodapeCursive: "Aceitamos encomendas",
    /** Telefone exibido no rodapé do modal de regras */
    regrasEncomendaRodapeTelefoneLabel: "(31) 99710-7058",
    /**
     * Tabela de tamanhos exibida no modal de cada produto (referência oficial do cardápio).
     * Deixe tamanhosReferenciaItens vazio [] para voltar a usar só data-produto-tamanhos nos cards.
     */
    tamanhosReferenciaTitulo: "Tamanhos",
    tamanhosReferenciaItens: [
        "150 g — porção única",
        "250 g — 2 fatias",
        "500 g — 4 a 5 fatias",
        "1.100 kg — 8 a 10 fatias"
    ]
};
