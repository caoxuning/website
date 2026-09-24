import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrameLoop,followAmount} from '../src/frame-loop.js';

function fixture(){
  let id=0,now=0;const queue=new Map(),deltas=[];
  const loop=createFrameLoop(delta=>deltas.push(delta),{
    request:fn=>{queue.set(++id,fn);return id;},cancel:key=>queue.delete(key),now:()=>now,
  });
  return {loop,queue,deltas,step(ms){now+=ms;const pending=[...queue.values()];queue.clear();pending.forEach(fn=>fn(now));}};
}
test('renders on every refresh at 60 and 120 Hz without a 30fps throttle',()=>{
  for(const hz of [60,120]){
    const f=fixture();f.loop.setRunning(true);
    for(let i=0;i<hz;i++)f.step(1000/hz);
    assert.equal(f.deltas.length,hz);
    assert.ok(Math.abs(f.deltas.reduce((a,b)=>a+b,0)-1)<1e-9);
  }
});
test('inactive loops have no pending callbacks; resuming does not jump through idle time',()=>{
  const f=fixture();assert.equal(f.queue.size,0);
  f.loop.setRunning(true);f.loop.setRunning(true);assert.equal(f.queue.size,1);
  f.step(16);f.loop.setRunning(false);assert.equal(f.queue.size,0);
  f.step(5000);f.loop.setRunning(true);f.step(16);
  assert.ok(Math.abs(f.deltas.at(-1)-.016)<1e-9);
  f.loop.setRunning(false);f.step(16);assert.equal(f.deltas.length,2);
});
test('pointer following has identical response at different refresh rates',()=>{
  const follow=hz=>{let x=0;for(let i=0;i<hz;i++)x+=(1-x)*followAmount(1/hz);return x;};
  assert.ok(Math.abs(follow(60)-follow(120))<1e-10);
  assert.equal(followAmount(0),0);
});
