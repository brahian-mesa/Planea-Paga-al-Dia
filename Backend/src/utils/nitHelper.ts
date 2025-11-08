/**
 * Extrae el último dígito de un NIT o Cédula
 * @param nit - NIT o Cédula (puede incluir guiones o puntos)
 * @returns El último dígito numérico (0-9)
 */
export const getLastDigit = (nit: string): number => {
  // Remover caracteres no numéricos (guiones, puntos, espacios)
  const cleanNit = nit.replace(/[^0-9]/g, "");

  if (cleanNit.length === 0) {
    throw new Error("NIT inválido: no contiene dígitos");
  }

  // Obtener el último dígito
  const lastDigit = parseInt(cleanNit[cleanNit.length - 1]);

  return lastDigit;
};

/**
 * Valida que un NIT tenga el formato correcto
 * @param nit - NIT o Cédula
 * @returns true si es válido
 */
export const validateNit = (nit: string): boolean => {
  const cleanNit = nit.replace(/[^0-9]/g, "");
  return cleanNit.length >= 6 && cleanNit.length <= 15;
};
