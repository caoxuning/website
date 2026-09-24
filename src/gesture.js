export function createGestureGate({threshold=90, idle=240}={}) {
  let distance=0,last=-Infinity,latched=false;
  return {
    push(delta,now){
      if(!Number.isFinite(delta)||Math.abs(delta)<.01)return 0;
      if(now-last>idle){distance=0;latched=false;}
      last=now;
      if(latched)return 0;
      if(Math.sign(delta)!==Math.sign(distance))distance=0;
      distance+=delta;
      if(Math.abs(distance)<threshold)return 0;
      latched=true;
      return Math.sign(distance);
    },
    reset(){distance=0;last=-Infinity;latched=false;},
  };
}

export const SCROLL_IDLE=550;
export function createScrollGesture({travel=600,threshold=.6,idle=SCROLL_IDLE}={}){
  let distance=0,last=-Infinity,latched=false;
  return {
    push(delta,now){
      if(!Number.isFinite(delta)||Math.abs(delta)<.01)return {blocked:true};
      if(now-last>idle){distance=0;latched=false;}
      last=now;
      if(latched)return {blocked:true};
      distance+=delta;
      const progress=Math.min(1,Math.abs(distance)/travel);
      const commit=progress>=threshold;
      if(commit)latched=true;
      return {direction:Math.sign(distance),progress,commit,blocked:false};
    },
    seed(progress,now){distance=progress*travel;last=now;latched=false;},
    suppress(now){distance=0;last=now;latched=true;},
    reset(){distance=0;last=-Infinity;latched=false;},
  };
}

export function scrollFrame(progress){
  const p=Math.max(0,Math.min(1,progress));
  const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};
  const blend=smooth((p-.2)/.8);
  return {outY:p===0?0:-24*p,inY:24*(1-p),outOpacity:1-blend,inOpacity:blend};
}
