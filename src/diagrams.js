const TAU=Math.PI*2;
const colors={ink:'#163d4a',muted:'#647981',cyan:'#58dbe4',blue:'#597fef',warm:'#e9a17d',light:'#eef3f5',dark:'#111618'};

// These seeded diagrams are illustrative, never presented as measured biology.
export function createDiagram(canvas,kind){
  const ctx=canvas.getContext('2d');
  if(!ctx)return {setActive(){},setPaused(){}};
  let width=0,height=0,time=0,last=performance.now(),rendered=0,active=false,paused=false;
  let seed=93;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const network=[[-.45,-.12,.095],[.08,-.03,.13],[.5,-.3,.07],[-.09,-.51,.073],[.46,.25,.1],[-.27,.42,.066],[-.63,.35,.046],[.62,.57,.047],[-.57,-.56,.045],[.4,-.67,.046],[.02,.69,.054],[.75,-.04,.043]];
  const edges=[];
  network.forEach((a,i)=>network.forEach((b,j)=>{if(j>i&&Math.hypot(a[0]-b[0],a[1]-b[1])<.85)edges.push([i,j]);}));
  const clouds=Array.from({length:520},(_,i)=>{
    const group=i%4,angle=random()*TAU,r=Math.sqrt(random());
    const center=[[-.36,-.29],[.38,-.2],[-.18,.4],[.53,.4]][group];
    return {group,x:center[0]+Math.cos(angle)*r*.29,y:center[1]+Math.sin(angle)*r*.23,phase:random()*TAU,size:random()*1.6+.8};
  });
  function coordinates(){
    const mobile=width<900;
    return {x:mobile?width*.5:width*.70,y:mobile?height*.72:height*.51,size:mobile?Math.min(width*.48,height*.22):Math.min(width*.28,height*.35)};
  }
  function node(x,y,r,color,phase){
    ctx.strokeStyle=color;ctx.lineWidth=1;
    ctx.beginPath();
    for(let j=0;j<=64;j++){
      const a=j/64*TAU,rr=r*(1+Math.sin(a*3+phase)*.07+Math.cos(a*5-phase)*.04);
      const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;
      if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.stroke();
    ctx.globalAlpha=.14;ctx.fillStyle=color;ctx.fill();ctx.globalAlpha=1;
    ctx.beginPath();ctx.ellipse(x+2,y-1,r*.31,r*.37,phase,0,TAU);ctx.fillStyle=color;ctx.fill();
    for(let k=0;k<8;k++){
      const a=k/8*TAU+phase*.2;
      ctx.beginPath();ctx.arc(x+Math.cos(a)*r*.65,y+Math.sin(a)*r*.65,1.1,0,TAU);ctx.fill();
    }
  }
  function drawNetwork({x,y,size}){
    const points=network.map(([px,py,r],i)=>[x+px*size,y+py*size+Math.sin(time*.35+i)*3,r*size]);
    edges.forEach(([i,j],k)=>{
      const a=points[i],b=points[j],highlight=i===1||j===1;
      ctx.strokeStyle=highlight?'#608b98':'#a4b8bf';ctx.lineWidth=highlight?1.2:.7;
      ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
      const t=(time*.14+k*.19)%1;
      ctx.fillStyle=highlight?'#bd7655':'#267b95';ctx.beginPath();ctx.arc(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,highlight?2.7:1.7,0,TAU);ctx.fill();
    });
    points.forEach(([px,py,r],i)=>node(px,py,r,i===1?'#b97451':i%3===0?'#3d78a5':'#37848f',i+Math.sin(time*.2)*.2));
    const labels=[[0,'Local context',-90,-35],[2,'Signal exchange',15,-40],[5,'Cell state',-50,43]];
    ctx.font='11px Manrope, sans-serif';ctx.fillStyle=colors.ink;
    if(width>900)labels.forEach(([i,label,ox,oy])=>{ctx.fillText(label,points[i][0]+ox,points[i][1]+oy);});
    ctx.strokeStyle='#a5bbc2';ctx.setLineDash([2,5]);ctx.beginPath();ctx.ellipse(x+size*.08,y,size*.88,size*.8,-.25,0,TAU);ctx.stroke();ctx.setLineDash([]);
  }
  function drawAtlas({x,y,size}){
    ctx.strokeStyle='#334348';ctx.lineWidth=.6;
    const tilt=.16;
    ctx.save();ctx.translate(x,y);ctx.rotate(-tilt);
    for(let i=-4;i<=4;i++){
      const v=i*size*.2;
      ctx.beginPath();ctx.moveTo(-size*.86,v);ctx.lineTo(size*.86,v);ctx.stroke();
      ctx.beginPath();ctx.moveTo(v,-size*.81);ctx.lineTo(v,size*.81);ctx.stroke();
    }
    clouds.forEach(p=>{
      const wave=Math.sin(time*.45+p.phase)*.015;
      const px=(p.x+wave)*size,py=(p.y+Math.cos(time*.3+p.phase)*.008)*size;
      ctx.fillStyle=[colors.cyan,'#9baeff','#d6e4e8',colors.warm][p.group];
      ctx.globalAlpha=.35+Math.sin(p.phase+time*.35)**2*.55;
      ctx.beginPath();ctx.arc(px,py,p.size,0,TAU);ctx.fill();
    });
    ctx.globalAlpha=1;
    for(let i=0;i<4;i++){
      const c=[[-.36,-.29],[.38,-.2],[-.18,.4],[.53,.4]][i];
      ctx.strokeStyle=['#60c9d0','#8296d8','#a9babc','#c99273'][i];ctx.globalAlpha=.4;
      ctx.beginPath();ctx.ellipse(c[0]*size,c[1]*size,size*.31,size*.25,-.15,0,TAU);ctx.stroke();
    }
    ctx.globalAlpha=1;
    const scan=(Math.sin(time*.22)*.5+.5)*size*1.5-size*.75;
    ctx.strokeStyle='#58dbe455';ctx.beginPath();ctx.moveTo(scan,-size*.78);ctx.lineTo(scan,size*.78);ctx.stroke();
    ctx.restore();
    if(width>900){ctx.fillStyle='#a6b9c1';ctx.font='11px Manrope, sans-serif';ctx.fillText('Cell states',x-size*.85,y-size*.93);ctx.fillText('Context → Hypothesis',x+size*.19,y-size*.93);}
  }
  function draw(){
    ctx.clearRect(0,0,width,height);
    const coords=coordinates();
    if(kind==='network')drawNetwork(coords);else drawAtlas(coords);
    canvas.dataset.ready='true';
  }
  function resize(){
    width=canvas.parentElement.clientWidth;height=canvas.parentElement.clientHeight;
    const dpr=Math.min(devicePixelRatio,1.6);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }
  function tick(now){
    if(active&&!paused&&!document.hidden){time+=Math.min((now-last)/1000,.05);if(now-rendered>40){draw();rendered=now;}}
    last=now;requestAnimationFrame(tick);
  }
  addEventListener('resize',resize,{passive:true});addEventListener('scene-resize',resize);
  resize();requestAnimationFrame(tick);
  return {setActive(value){active=value;if(value)draw();},setPaused(value){paused=value;draw();}};
}
