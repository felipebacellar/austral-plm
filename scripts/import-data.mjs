// Importa tecidos e aviamentos dos CSVs para o Supabase
// Uso: node scripts/import-data.mjs
// Requer: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Converte "R$ 58,67" → 58.67 | "#VALOR!", "", "R$ -" → null
function parsePrice(str) {
  if (!str) return null
  const s = str.trim()
  if (!s || s.includes('#VALOR') || s === 'R$ -' || s === 'R$' || s.toUpperCase().includes('LINHA')) return null
  const cleaned = s.replace('R$', '').replace(/\s/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) || num <= 0 ? null : num
}

// Parser CSV com suporte a campos entre aspas e quebras de linha internas
function parseCSV(content) {
  const rows = []
  let currentRow = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') { currentField += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (char === ';' && !inQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++
      currentRow.push(currentField.trim())
      currentField = ''
      if (currentRow.some(f => f !== '')) rows.push(currentRow)
      currentRow = []
    } else {
      currentField += char
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some(f => f !== '')) rows.push(currentRow)
  }
  return rows
}

async function importTecidos(supabase) {
  const content = fs.readFileSync(
    'C:\\Users\\produ\\Downloads\\LISTAS III(TECIDOS).csv',
    'latin1'
  )
  const rows = parseCSV(content)

  const tecidos = []
  const seenNomes = new Set()

  for (let i = 1; i < rows.length; i++) {
    const [nome, fornecedor, composicao, preco] = rows[i]
    const nomeLimpo = (nome || '').trim()
    if (!nomeLimpo) continue

    // Deduplicar dentro do arquivo (mantém primeira ocorrência)
    if (seenNomes.has(nomeLimpo)) continue
    seenNomes.add(nomeLimpo)

    tecidos.push({
      nome: nomeLimpo,
      fornecedor: (fornecedor || '').trim(),
      composicao: (composicao || '').trim().replace(/\s+/g, ' '),
      preco: parsePrice(preco),
    })
  }

  console.log(`\n📦 Inserindo ${tecidos.length} tecidos...`)

  for (let i = 0; i < tecidos.length; i += 100) {
    const batch = tecidos.slice(i, i + 100)
    const { error } = await supabase
      .from('tecidos')
      .upsert(batch, { onConflict: 'nome' })
    if (error) { console.error(`  ✗ Erro batch ${i}-${i + 100}:`, error.message); continue }
    console.log(`  ✓ ${Math.min(i + 100, tecidos.length)}/${tecidos.length}`)
  }
}

async function importAviamentos(supabase) {
  const content = fs.readFileSync(
    'C:\\Users\\produ\\Downloads\\LISTAS III(AVIAMENTOS).csv',
    'latin1'
  )
  const rows = parseCSV(content)

  const aviamentos = []
  const seenCodigos = new Set()
  const SKIP_CODIGOS = new Set(['FORN', 'SEM CÓDIGO', 'SEM C�DIGO'])

  for (let i = 1; i < rows.length; i++) {
    const [codigo, nome, preco] = rows[i]
    const codigoLimpo = (codigo || '').trim()
    const nomeLimpo = (nome || '').trim()
    if (!codigoLimpo || !nomeLimpo) continue
    if (SKIP_CODIGOS.has(codigoLimpo)) continue
    if (seenCodigos.has(codigoLimpo)) continue
    seenCodigos.add(codigoLimpo)

    aviamentos.push({
      codigo: codigoLimpo,
      nome: nomeLimpo,
      preco: parsePrice(preco),
    })
  }

  console.log(`\n🔩 Inserindo ${aviamentos.length} aviamentos...`)

  const { error } = await supabase
    .from('aviamentos')
    .upsert(aviamentos, { onConflict: 'codigo' })
  if (error) console.error('  ✗ Erro:', error.message)
  else console.log(`  ✓ ${aviamentos.length}/${aviamentos.length}`)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
await importTecidos(supabase)
await importAviamentos(supabase)
console.log('\n✅ Importação concluída!')
