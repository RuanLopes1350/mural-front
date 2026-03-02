// Calcula a duração de exibição de cada imagem automaticamente
// O evento sempre tem entre 1 e 6 imagens
// Poucas imagens = mais tempo em cada uma (para não passar muito rápido)
// Muitas imagens = menos tempo em cada uma (para não ficar muito longo o evento)
// Com 3 loops, o evento todo vai rodar 3 vezes antes de passar para o próximo
// Exemplos: 1 imagem × 10s × 3 loops = 30s | 3 imagens × 6s × 3 loops = 54s | 6 imagens × 4s × 3 loops = 72s
export function calcularDuracaoPorImagem(quantidadeImagens: number): number {
    // Se tiver apenas 1 imagem, deixa bastante tempo para as pessoas verem bem
    if (quantidadeImagens === 1) {
        return 10000; // 10 segundos (10000 milissegundos)
    }

    // Para 2 imagens: 8 segundos por imagem
    if (quantidadeImagens === 2) {
        return 8000; // 8 segundos
    }

    // Para 3 imagens: 6 segundos por imagem
    if (quantidadeImagens === 3) {
        return 6000; // 6 segundos
    }

    // Para 4 imagens: 5 segundos por imagem
    if (quantidadeImagens === 4) {
        return 5000; // 5 segundos
    }

    // Para 5 imagens: 4.5 segundos por imagem
    if (quantidadeImagens === 5) {
        return 4500; // 4.5 segundos
    }

    // Para 6 imagens: 4 segundos por imagem
    if (quantidadeImagens === 6) {
        return 4000; // 4 segundos
    }

    // Valor padrão (caso ocorra algum erro, mas não deveria chegar aqui)
    return 5000; // 5 segundos
}

// Calcula quantos loops o evento deve ter
// Sempre retorna 3 loops, independente da quantidade de imagens
export function calcularLoops(): number {
    return 3;
}

// Função auxiliar que calcula o tempo total que um evento ficará em exibição
// Tempo total = (quantidade de imagens × duração por imagem × loops) / 1000
export function calcularTempoTotalEvento(
    quantidadeImagens: number,
    duracaoPorImagem: number,
    loops: number
): number {
    const tempoTotalMs = quantidadeImagens * duracaoPorImagem * loops;
    const tempoTotalSegundos = tempoTotalMs / 1000;

    return tempoTotalSegundos;
}
