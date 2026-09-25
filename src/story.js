const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => { const t = clamp(v); return t * t * (3 - 2 * t); };

export function stainingFrame(time) {
  const cycle=((time%24)+24)%24;
  const phase=cycle%8;
  const step=Math.min(3,Math.floor(phase/2));
  const signal=step===0?smooth(phase/2):step===1?1:step===2?1-smooth((phase-4)/2):0;
  return {round:Math.floor(cycle/8),step,signal,scan:step===1?(phase-2)/2:0};
}

export function stainingScan(frame,time,scrollDriven=false){
  return scrollDriven&&frame.step===1?((time*.28)%1+1)%1:frame.scan;
}

export function tissuePositions() {
  const positions=[];
  for(let row=0;row<5;row++){
    for(let col=0;col<5;col++){
      if((row===0||row===4)&&(col===0||col===4))continue;
      const i=row*5+col;
      positions.push([(col-2)*1.55+(row%2)*.45+Math.sin(i*2.3)*.12,
        (row-2)*1.38+Math.cos(i*1.7)*.12,Math.sin(i)*.08,.72+Math.sin(i*3.1)*.06]);
    }
  }
  return positions;
}

export function regionSelection(index){
  const size=[1,2.25,3.65][index]??1,x=.2,y=0;
  const cells=tissuePositions().map(([cx,cy],i)=>({index:i,id:`S${String(i+1).padStart(2,'0')}`,x:cx,y:cy,channel:i%3}))
    .filter(cell=>Math.abs(cell.x-x)<=size&&Math.abs(cell.y-y)<=size);
  return {x,y,size,cells};
}

export function registrationOffset(time,channel){
  const amount=1-smooth(time/3);
  if(amount===0)return [0,0];
  const offset=[[-.65,.35],[.5,.4],[.2,-.55]][channel];
  return offset.map(value=>value*amount);
}

export function narrativeFrame(mode,time,entrance=1){
  const stage=Math.max(0,Math.min(2,mode));
  const settled=1-(1-clamp(entrance))**3;
  return {
    focusIndex:0,
    focusColor:0xe89a70,
    expansion:1+stage*.16,
    shellOpacity:[1.35,.82,.45][stage],
    rotationY:Math.sin(time*.3)*.23+stage*.055-(1-settled)*.38,
    rotationX:Math.sin(time*.24)*.065,
    cameraOffset:(1-settled)*2.8+Math.sin(time*.33)*.17,
  };
}
