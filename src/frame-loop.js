export const followAmount=delta=>1-Math.exp(-3.712524223* Math.max(0,delta));

export function createFrameLoop(draw,{
  request=callback=>requestAnimationFrame(callback),
  cancel=id=>cancelAnimationFrame(id),
  now=()=>performance.now(),
}={}){
  let running=false,pending=null,last=0;
  function tick(timestamp){
    pending=null;
    if(!running)return;
    const delta=Math.max(0,Math.min((timestamp-last)/1000,.1));
    last=timestamp;
    draw(delta);
    if(running)pending=request(tick);
  }
  return {setRunning(value){
    if(value===running)return;
    running=value;
    if(value){last=now();pending=request(tick);}
    else if(pending!==null){cancel(pending);pending=null;}
  }};
}
