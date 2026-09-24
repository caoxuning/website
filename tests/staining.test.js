import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as story from '../src/story.js';
const {stainingFrame,tissuePositions}=story;

test('staining cycles progress from labeling to imaging to clearance to the next round',()=>{
  assert.equal(stainingFrame(1).step,0);
  assert.equal(stainingFrame(3).step,1);
  assert.equal(stainingFrame(5).step,2);
  assert.equal(stainingFrame(7).step,3);
  assert.equal(stainingFrame(8).round,1);
  assert.ok(stainingFrame(3).signal>0.95);
  assert.ok(stainingFrame(5.9).signal<0.02);
  assert.equal(stainingFrame(7).signal,0);
  assert.deepEqual(stainingFrame(24),stainingFrame(0));
});

test('scroll-led imaging keeps a bounded live scan inside its selected stage',()=>{
  assert.equal(typeof story.stainingScan,'function');
  const imaging=stainingFrame(3);
  assert.equal(story.stainingScan(imaging,0,false),imaging.scan);
  assert.equal(story.stainingScan(imaging,0,true),0);
  assert.ok(story.stainingScan(imaging,1,true)>.2);
  assert.ok(story.stainingScan(imaging,1,true)<1);
  assert.equal(story.stainingScan(stainingFrame(5),1,true),0);
});

test('fixed tissue coordinates are deterministic and stay in a thin section',()=>{
  const a=tissuePositions();
  assert.ok(a.length>=20);
  assert.ok(a.every(p=>Math.abs(p[2])<0.2));
  a[0][0]=100;
  assert.notEqual(tissuePositions()[0][0],100);
  assert.deepEqual(tissuePositions(),tissuePositions());
});

test('published story describes fixed specimens without future-state or live tracking claims',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/固定细胞/);
  assert.match(html,/组织切片/);
  assert.match(html,/SAFE/);
  assert.doesNotMatch(html,/POSSIBLE FUTURES|细胞会走向哪里|活细胞追踪|ITS POSSIBILITIES/);
});
