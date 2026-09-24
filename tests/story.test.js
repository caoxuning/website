import test from 'node:test';
import assert from 'node:assert/strict';
import { storyState, cellPositions } from '../src/story.js';

test('story clamps at both ends', () => {
  assert.equal(storyState(-1).phase, 0);
  assert.equal(storyState(4).phase, 2);
});
test('scroll reverses without retained state', () => {
  const first = storyState(0.3);
  storyState(1.8);
  assert.deepEqual(storyState(0.3), first);
});
test('network and computation resolve in order', () => {
  assert.equal(storyState(0).network, 0);
  assert.equal(storyState(1).network, 1);
  assert.equal(storyState(1).computation, 0);
  assert.equal(storyState(2).computation, 1);
});
test('cell positions are reproducible and finite', () => {
  assert.deepEqual(cellPositions(), cellPositions());
  assert.ok(cellPositions().length >= 10);
  assert.ok(cellPositions().every(p => p.every(Number.isFinite)));
});
