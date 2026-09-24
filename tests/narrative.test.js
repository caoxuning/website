import test from 'node:test';
import assert from 'node:assert/strict';
import {narrativeFrame} from '../src/story.js';

test('one focus identity and accent connects the three chapters',()=>{
  const frames=[0,1,2].map(mode=>narrativeFrame(mode,0,1));
  assert.ok(frames.every(frame=>frame.focusIndex===0&&frame.focusColor===0xe89a70));
  assert.ok(frames[1].expansion>frames[0].expansion);
  assert.ok(frames[2].shellOpacity<frames[0].shellOpacity);
});
test('entrance has a camera approach and resolves to its final position',()=>{
  assert.ok(narrativeFrame(0,0,0).cameraOffset>2);
  assert.equal(narrativeFrame(0,0,1).cameraOffset,0);
});
test('motion is noticeable and deterministic',()=>{
  const a=narrativeFrame(1,1,1),b=narrativeFrame(1,6,1);
  assert.ok(Math.abs(a.rotationY-b.rotationY)>.12);
  assert.deepEqual(a,narrativeFrame(1,1,1));
});
