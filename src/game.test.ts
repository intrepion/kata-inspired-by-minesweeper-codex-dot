import { describe, it, expect } from 'vitest';
import { createGame, reveal, flag, neighbors, elapsed, encode, decode, recordBest, seeded } from './game';
describe('field rules', () => {
 it('begins ready and places exactly ten mines outside a safe opening', () => {
  const g = createGame('beginner');
  expect(g.status).toBe('ready');
  reveal(g,40,1000,seeded(42));
  expect(g.cells.filter(c=>c.mine)).toHaveLength(10);
  expect([40,...neighbors(g,40)].every(i=>!g.cells[i]!.mine)).toBe(true);
  expect(g.status).toBe('active');
 });
});
