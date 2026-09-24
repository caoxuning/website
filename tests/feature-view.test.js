import test from 'node:test';
import assert from 'node:assert/strict';
import * as story from '../src/story.js';

test('analysis regions select the same schematic coordinates shown in the tissue',()=>{
  assert.equal(typeof story.regionSelection,'function');
  const cell=story.regionSelection(0),near=story.regionSelection(1),region=story.regionSelection(2);
  assert.equal(cell.cells.length,1);
  assert.ok(near.cells.length>cell.cells.length);
  assert.equal(region.cells.length,story.tissuePositions().length);
  for(const selection of [cell,near,region])for(const c of selection.cells){
    assert.ok(Math.abs(c.x-selection.x)<=selection.size);
    assert.ok(Math.abs(c.y-selection.y)<=selection.size);
    assert.equal(c.channel,c.index%3);
  }
  assert.deepEqual(story.regionSelection(100),story.regionSelection(0));
});
test('registration illustrates alignment then settles into shared coordinates',()=>{
  assert.equal(typeof story.registrationOffset,'function');
  assert.ok(Math.abs(story.registrationOffset(0,0)[0])>0);
  for(let channel=0;channel<3;channel++)assert.deepEqual(story.registrationOffset(4,channel),[0,0]);
});
