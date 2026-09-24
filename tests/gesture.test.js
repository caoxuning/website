import test from 'node:test';
import assert from 'node:assert/strict';
import {createGestureGate} from '../src/gesture.js';

test('small wheel movements accumulate to a threshold',()=>{
  const gate=createGestureGate();
  assert.equal(gate.push(20,0),0);
  assert.equal(gate.push(30,50),0);
  assert.equal(gate.push(50,100),1);
});
test('one continuous gesture cannot skip multiple panels',()=>{
  const gate=createGestureGate();
  assert.equal(gate.push(110,0),1);
  for(let t=80;t<1600;t+=80)assert.equal(gate.push(150,t),0);
  assert.equal(gate.push(110,2000),1);
});
test('reversing direction clears previous accumulated distance',()=>{
  const gate=createGestureGate();
  gate.push(65,0);
  assert.equal(gate.push(-40,50),0);
  assert.equal(gate.push(-55,100),-1);
});
test('idle gestures reset partial movement',()=>{
  const gate=createGestureGate();
  gate.push(70,0);
  assert.equal(gate.push(30,600),0);
});
test('reset clears a latched gesture',()=>{
  const gate=createGestureGate();
  gate.push(120,0);
  gate.reset();
  assert.equal(gate.push(-120,30),-1);
});
