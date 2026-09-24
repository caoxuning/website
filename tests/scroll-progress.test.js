import test from 'node:test';
import assert from 'node:assert/strict';
import * as gestures from '../src/gesture.js';

test('slow discrete wheel steps accumulate across 450ms pauses',()=>{
  const gesture=gestures.createScrollGesture();
  assert.equal(gesture.push(120,0).progress,.2);
  assert.equal(gesture.push(120,450).progress,.4);
  assert.equal(gesture.push(120,900).commit,true);
});

test('wheel distance drives progress and only commits at 60 percent',()=>{
  assert.equal(typeof gestures.createScrollGesture,'function');
  const gesture=gestures.createScrollGesture({travel:600});
  assert.deepEqual(gesture.push(120,0),{direction:1,progress:.2,commit:false,blocked:false});
  assert.equal(gesture.push(180,60).progress,.5);
  assert.equal(gesture.push(59,120).commit,false);
  assert.equal(gesture.push(1,180).commit,true);
});
test('reversing a partial gesture unwinds it before entering the other direction',()=>{
  const gesture=gestures.createScrollGesture({travel:600});
  gesture.push(240,0);
  assert.equal(gesture.push(-120,60).progress,.2);
  assert.deepEqual(gesture.push(-180,120),{direction:-1,progress:.1,commit:false,blocked:false});
});
test('committed momentum stays latched until idle; new gesture starts clean',()=>{
  const gesture=gestures.createScrollGesture({travel:600});
  assert.equal(gesture.push(360,0).commit,true);
  for(let t=80;t<1600;t+=80)assert.equal(gesture.push(180,t).blocked,true);
  assert.equal(gesture.push(-120,2200).progress,.2);
});
test('reset, partial-idle and animation suppression cannot leak progress',()=>{
  const gesture=gestures.createScrollGesture({travel:600});
  gesture.push(240,0);
  assert.equal(gesture.push(60,800).progress,.1);
  gesture.reset();
  assert.equal(gesture.push(-60,810).progress,.1);
  gesture.suppress(830);
  assert.equal(gesture.push(600,900).blocked,true);
  assert.equal(gesture.push(NaN,1100).blocked,true);
  assert.equal(gesture.push(120,1600).progress,.2);
});
test('a returning gesture can resume from its visible position',()=>{
  const gesture=gestures.createScrollGesture({travel:600});
  gesture.seed(-.25,1000);
  assert.equal(gesture.push(-60,1001).progress,.35);
});
test('fade has a protected first 20 percent and a continuous handoff',()=>{
  assert.equal(typeof gestures.scrollFrame,'function');
  assert.deepEqual(gestures.scrollFrame(0),{outY:0,inY:24,outOpacity:1,inOpacity:0});
  assert.equal(gestures.scrollFrame(.2).outOpacity,1);
  assert.ok(gestures.scrollFrame(.4).outOpacity<1);
  assert.ok(gestures.scrollFrame(.5).inOpacity>0);
  assert.ok(gestures.scrollFrame(.6).outOpacity>.49);
  for(let p=0;p<=1;p+=.05){const frame=gestures.scrollFrame(p);assert.ok(Math.abs(frame.outOpacity+frame.inOpacity-1)<.00001);}
  assert.deepEqual(gestures.scrollFrame(1),{outY:-24,inY:0,outOpacity:0,inOpacity:1});
  assert.deepEqual(gestures.scrollFrame(3),gestures.scrollFrame(1));
  assert.deepEqual(gestures.scrollFrame(-1),gestures.scrollFrame(0));
});
