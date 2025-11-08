export const getFechaPorUltimoDigito = (nit: string) => {
    const ultimoDigito = parseInt(nit[nit.length - 1]);
    const baseDate = new Date('2025-01-01');

    baseDate.setDate(baseDate.getDate() + ultimoDigito * 3);
    return baseDate.toISOString().split('T')[0];
}
