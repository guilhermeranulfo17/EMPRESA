// Grava o onboarding: apaga a conta de demonstração "Buffet Girassol" (o vídeo cria de novo pelo
// cadastro) e roda o roteiro. Precisa do Supabase local, do app rodando e das senhas por env:
//   GIRASSOL_EMAIL/GIRASSOL_SENHA (TRIMFLOW/supabase/seed-video-onboarding.sql)
//   ESTRELA_EMAIL/ESTRELA_SENHA (TRIMFLOW/supabase/seed-video.sql)
// uso: node scripts/onboarding/capturar.cjs [c0,c1,...]
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const roteiro = require('./roteiro.cjs');
const { rodar } = require('./motor.cjs');

const filtro = process.argv[2] ? process.argv[2].split(',') : null;
if (!filtro || filtro.includes('c0')) {
  execFileSync('psql', ['postgresql://postgres:postgres@127.0.0.1:54322/postgres', '-v', 'ON_ERROR_STOP=1', '-q', '-f',
    path.join(__dirname, '../../../../TRIMFLOW/supabase/seed-video-onboarding.sql')], { stdio: 'ignore' });
}
rodar(roteiro, path.join(__dirname, '../../public/onboarding'), filtro).then((m) => {
  const n = m.capitulos.reduce((a, c) => a + c.passos.reduce((b, p) => b + p.quadros.length, 0), 0);
  console.log(`${m.capitulos.length} capítulos, ${n} quadros`);
});
