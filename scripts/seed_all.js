// ============================================================
// seed_all.js — Poblado global de datos para todos los servicios
// Ejecutar con: node scripts/seed_all.js [monolito|catalogos|proyectos]
// ============================================================

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const target = args[0] || 'all';

const ROOT = path.join(__dirname, '..');

const run = (cmd, cwd) => {
  console.log(`\n[Seed] Ejecutando: ${cmd} en ${cwd}`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (err) {
    console.error(`[Seed Error] Falló: ${cmd}`);
    process.exit(1);
  }
};

if (target === 'monolito' || target === 'all') {
  console.log('\n========== Poblando Monolito ==========');
  run('node src/seed.js', path.join(ROOT, 'backend-monolito'));
}

if (target === 'catalogos' || target === 'all') {
  console.log('\n========== Poblando Servicio Catálogos ==========');
  run('node src/seed.js', path.join(ROOT, 'backend-desacoplado', 'servicio-catalogos'));
}

if (target === 'proyectos' || target === 'all') {
  console.log('\n========== Nota: Servicio Proyectos no tiene seed propio ==========');
  console.log('[Seed] Los proyectos deben crearse vía API POST después de poblar catálogos.');
}

console.log('\n[Seed Global] Proceso completado exitosamente.');
