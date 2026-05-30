/**
 * Gerador de "Pix Copia e Cola" (BR Code estático) seguindo o padrão
 * EMV® QRCPS-MPM adotado pelo Banco Central.
 *
 * Gera o payload que pode ser exibido como QR Code ou copiado pelo pagador.
 */

export interface PixParams {
  /** Chave Pix do recebedor (e-mail, telefone, CPF/CNPJ ou chave aleatória). */
  pixKey: string;
  /** Nome do recebedor (máx. 25 caracteres). */
  merchantName: string;
  /** Cidade do recebedor (máx. 15 caracteres). */
  merchantCity: string;
  /** Valor da transação. Omitido = pagador define o valor. */
  amount?: number;
  /** Identificador da transação (txid). Padrão "***". */
  txid?: string;
}

/** Monta um campo EMV no formato ID + tamanho(2 dígitos) + valor. */
function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/** Remove acentos e caracteres não-ASCII e força maiúsculas, com corte. */
function sanitize(text: string, maxLength: number): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (combining marks)
    .replace(/[^\x20-\x7E]/g, "") // remove não-ASCII restante
    .toUpperCase()
    .trim()
    .slice(0, maxLength);
}

/**
 * Calcula o CRC16/CCITT-FALSE (polinômio 0x1021, init 0xFFFF) usado no
 * campo 63 do BR Code.
 */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Gera o payload completo do Pix Copia e Cola.
 */
export function generatePixPayload(params: PixParams): string {
  const { pixKey, merchantName, merchantCity, amount, txid = "***" } = params;

  // Merchant Account Information (ID 26)
  const gui = emv("00", "br.gov.bcb.pix");
  const key = emv("01", pixKey);
  const merchantAccountInfo = emv("26", `${gui}${key}`);

  // Additional Data Field (ID 62) com o txid
  const additionalData = emv("62", emv("05", sanitize(txid, 25) || "***"));

  let payload =
    emv("00", "01") + // Payload Format Indicator
    merchantAccountInfo +
    emv("52", "0000") + // Merchant Category Code
    emv("53", "986") + // Moeda: BRL
    (amount && amount > 0 ? emv("54", amount.toFixed(2)) : "") +
    emv("58", "BR") + // País
    emv("59", sanitize(merchantName, 25) || "RECEBEDOR") +
    emv("60", sanitize(merchantCity, 15) || "BRASIL") +
    additionalData;

  // CRC16 (ID 63) — o cálculo inclui "6304" no fim antes do checksum
  payload += "6304";
  payload += crc16(payload);

  return payload;
}
