const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
const output = ts.transpileModule(fs.readFileSync('src/clinics.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module('clinics');
loaded._compile(output, 'clinics.js');
const { clinics, rankedClinics, competitors, revenueHistory } = loaded.exports;

test('Рейтинг сортирует выручку и исключает компании без данных', () => {
  const ranking = rankedClinics();
  assert.equal(ranking[0].id, 'city');
  assert.equal(ranking.findIndex(c => c.id === 'north') + 1, 4);
  assert.ok(ranking.every((c, i) => c.revenue !== null && (!i || ranking[i - 1].revenue >= c.revenue)));
  assert.ok(!ranking.some(c => c.id === 'new'));
});
test('Радиус отсчитывается от выбранной клиники, сама клиника исключается', () => {
  assert.deepEqual(competitors('north', 1).map(c => c.id), ['med']);
  assert.deepEqual(competitors('center', 1).map(c => c.id), ['care']);
  assert.equal(competitors('new', 1).length, 1);
  assert.ok(!competitors('north', 10).some(c => c.id === 'north'));
});
test('Динамика согласована с выручкой и ростом, отсутствие данных сохраняется', () => {
  const clinic = clinics.find(c => c.id === 'north');
  const values = revenueHistory(clinic);
  assert.equal(values[2], clinic.revenue);
  assert.ok(Math.abs((values[2] / values[1] - 1) * 100 - clinic.growth) < 0.00001);
  assert.deepEqual(revenueHistory(clinics.find(c => c.id === 'new')), []);
});
