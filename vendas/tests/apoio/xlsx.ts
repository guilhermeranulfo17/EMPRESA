import { crc32, deflateRawSync } from 'node:zlib';

/*
 * Monta um XLSX mínimo (como o Excel salva: textos compartilhados, números e a primeira aba
 * apontada pelo workbook) para os testes do leitor e da importação.
 */

function zip(arquivos: Record<string, string>): Buffer {
  const locais: Buffer[] = [];
  const centrais: Buffer[] = [];
  let offset = 0;
  for (const [nome, texto] of Object.entries(arquivos)) {
    const dados = Buffer.from(texto, 'utf8');
    const comprimido = deflateRawSync(dados);
    const nomeBuf = Buffer.from(nome, 'utf8');
    const crc = crc32(dados);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comprimido.length, 18);
    local.writeUInt32LE(dados.length, 22);
    local.writeUInt16LE(nomeBuf.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comprimido.length, 20);
    central.writeUInt32LE(dados.length, 24);
    central.writeUInt16LE(nomeBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    locais.push(local, nomeBuf, comprimido);
    centrais.push(central, nomeBuf);
    offset += 30 + nomeBuf.length + comprimido.length;
  }
  const dir = Buffer.concat(centrais);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(Object.keys(arquivos).length, 8);
  fim.writeUInt16LE(Object.keys(arquivos).length, 10);
  fim.writeUInt32LE(dir.length, 12);
  fim.writeUInt32LE(offset, 16);
  return Buffer.concat([...locais, dir, fim]);
}

const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const coluna = (i: number) => {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26))
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

/** Linhas → XLSX. Número vira célula numérica; texto vai para os textos compartilhados. */
export function criarXlsx(linhas: (string | number | null)[][]): Buffer {
  const textos: string[] = [];
  const indice = new Map<string, number>();
  const linhasXml = linhas
    .map((linha, r) => {
      const celulas = linha
        .map((v, c) => {
          if (v === null || v === '') return '';
          const ref = `${coluna(c)}${r + 1}`;
          if (typeof v === 'number') return `<c r="${ref}"><v>${v}</v></c>`;
          if (!indice.has(v)) {
            indice.set(v, textos.length);
            textos.push(v);
          }
          return `<c r="${ref}" t="s"><v>${indice.get(v)}</v></c>`;
        })
        .join('');
      return `<row r="${r + 1}">${celulas}</row>`;
    })
    .join('');
  return zip({
    '[Content_Types].xml':
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
    'xl/workbook.xml':
      '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Lista" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="worksheet" Target="worksheets/lista.xml"/></Relationships>',
    'xl/sharedStrings.xml': `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${textos
      .map((t) => `<si><t xml:space="preserve">${escapar(t)}</t></si>`)
      .join('')}</sst>`,
    'xl/worksheets/lista.xml': `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${linhasXml}</sheetData></worksheet>`,
  });
}
