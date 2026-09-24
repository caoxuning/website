import * as THREE from 'three';
import {mergeVertices,mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import { tissuePositions, narrativeFrame, stainingFrame,stainingScan,regionSelection,registrationOffset } from './story.js';
import {createFrameLoop,followAmount} from './frame-loop.js';

const membraneVertex = `
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPosition;
attribute vec3 cellPosition;
void main(){
  vec3 membrane = position;
  vec4 viewPosition = modelViewMatrix * vec4(membrane, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-viewPosition.xyz);
  vPosition = cellPosition;
  gl_Position = projectionMatrix * viewPosition;
}`;
const membraneFragment = `
uniform vec3 color;
uniform float opacity;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPosition;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){
  float rim = pow(1.0-abs(dot(normalize(vNormal),vView)),2.6);
  float grain = hash(floor(vPosition*100.0));
  float folds = pow(abs(sin(vPosition.x*15.0+sin(vPosition.y*9.0)+vPosition.z*8.0)),16.0);
  float striae = pow(abs(sin(vPosition.y*32.0+sin(vPosition.x*18.0)*1.5)),25.0);
  float light = max(dot(normalize(vNormal),normalize(vec3(-1.0,2.0,3.0))),0.0);
  vec3 tint = mix(vec3(.45,.72,.79),color,.4+rim*.55);
  tint = mix(tint,vec3(.91,.98,1.0),light*.45);
  tint -= grain*.075 + folds*.035;
  gl_FragColor = vec4(tint,(.075+rim*.7+grain*.07+folds*.055+striae*.02)*opacity);
}`;

function organicGeometry(seed, detail = 12) {
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  const positions = geometry.attributes.position;
  const p = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    p.fromBufferAttribute(positions, i);
    const d = 1 + .085*Math.sin(p.x*5+seed)*Math.cos(p.y*4+seed*.4) + .055*Math.sin(p.z*7+p.x*3+seed) + .02*Math.sin(p.y*17+p.z*11);
    p.multiplyScalar(d);
    positions.setXYZ(i,p.x,p.y,p.z);
  }
  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  const smoothGeometry=mergeVertices(geometry, .0001);
  smoothGeometry.computeVertexNormals();
  geometry.dispose();
  return smoothGeometry;
}

const tissueAssets=new Map();
function prepareTissue(focused=false){
  if(tissueAssets.has(focused))return tissueAssets.get(focused);
  const shells=[[],[],[]],dots=[[],[],[]],edges=[[],[],[]],nuclei=[],nucleoli=[[],[]];
  const dummy=new THREE.Object3D(),transform=new THREE.Matrix4(),local=new THREE.Matrix4();
  const quaternion=new THREE.Quaternion(),point=new THREE.Vector3();
  const dotGeometry=new THREE.SphereGeometry(.023,5,4);
  const nucleolusGeometry=new THREE.SphereGeometry(.09,12,10);
  let randomSeed=37;
  const random=()=>{randomSeed=(randomSeed*16807)%2147483647;return (randomSeed-1)/2147483646;};
  tissuePositions().forEach(([x,y,z,radius],i)=>{
    if(focused&&Math.hypot(x-.2,y)>2.2)return;
    const selected=i===10,channel=i%3;
    transform.compose(new THREE.Vector3(x,y,z),quaternion,new THREE.Vector3(radius*(i%3===0?1.1:.94),radius*(i%2===0?.91:1.13),radius*.24));
    const shell=organicGeometry(selected?0:i*.78);
    shell.setAttribute('cellPosition',shell.attributes.position.clone());
    shells[channel].push(shell.applyMatrix4(transform));
    local.compose(new THREE.Vector3(.1,-.06,.06),quaternion,new THREE.Vector3(.36,.4,.3));
    nuclei.push(organicGeometry(selected?20:i+20,8).applyMatrix4(transform.clone().multiply(local)));
    local.makeTranslation(.15,-.02,.34);
    nucleoli[selected?1:0].push(nucleolusGeometry.clone().applyMatrix4(transform.clone().multiply(local)));
    for(let j=0;j<180;j++){
      const theta=random()*Math.PI*2,phi=Math.acos(2*random()-1),r=.45+random()*.5;
      dummy.position.set(Math.sin(phi)*Math.cos(theta)*r,Math.sin(phi)*Math.sin(theta)*r,Math.cos(phi)*r);
      dummy.scale.setScalar(.6+random()*1.1);dummy.updateMatrix();
      dots[channel].push(transform.clone().multiply(dummy.matrix));
    }
    for(let j=0;j<80;j++)for(const k of [j,(j+1)%80]){
      const angle=k/80*Math.PI*2,r=1+.055*Math.sin(angle*5+i*.78);
      point.set(Math.cos(angle)*r,Math.sin(angle)*r,.5).applyMatrix4(transform);
      edges[channel].push(point.x,point.y,point.z);
    }
  });
  const merge=geometries=>{const result=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());return result;};
  nucleolusGeometry.dispose();
  // Fixed specimen transforms are baked once, shared by all chapter renderers.
  const assets={shells:shells.map(merge),nuclei:merge(nuclei),nucleoli:nucleoli.map(merge),dots,dotGeometry,
    edges:edges.map(vertices=>new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)))};
  tissueAssets.set(focused,assets);return assets;
}

export function createCellScene(canvas,{mode=0,onCycle=()=>{},hideNarrowScan=false}={}) {
  const root = canvas.parentElement;
  const solutionScene=mode===1&&!!canvas.closest('.solutions');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
  } catch {
    root.dataset.fallback = 'true';
    return { setPaused(){}, setActive(){}, setRegion(){},setSpatialStage(){},setSolution(){},setStoryProgress(){}, capture(){return null;} };
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.setClearColor(0x111618,1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34,1,.1,100);
  camera.position.set(0,0,22);
  scene.add(new THREE.HemisphereLight(0xffffff,0x35586c,3.0));
  const light = new THREE.DirectionalLight(0xffffff,3.2);
  light.position.set(-5,8,8);
  scene.add(light);
  const cluster = new THREE.Group();
  scene.add(cluster);
  const assets=prepareTissue(mode===1);
  const channelColors=[0x62e1c2,0xf0a07e,0x859af7];
  const spatialPoints=solutionScene?tissuePositions().filter(([x,y])=>Math.hypot(x-.2,y)<=2.2):[];
  const channels=channelColors.map((color,i)=>{
    const shellMaterial = new THREE.ShaderMaterial({
      uniforms:{color:{value:new THREE.Color(color)},opacity:{value:1}},
      vertexShader:membraneVertex,fragmentShader:membraneFragment,transparent:true,depthWrite:false,side:THREE.FrontSide,
    });
    const shell=new THREE.Mesh(assets.shells[i],shellMaterial);shell.renderOrder=2;
    const granules=new THREE.InstancedMesh(assets.dotGeometry,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}),assets.dots[i].length);
    assets.dots[i].forEach((matrix,index)=>granules.setMatrixAt(index,matrix));
    granules.instanceMatrix.needsUpdate=true;
    const wire=new THREE.LineSegments(assets.edges[i],new THREE.LineBasicMaterial({color,transparent:true,opacity:mode===2?.35:.55}));
    for(const object of [shell,granules,wire]){object.matrixAutoUpdate=false;cluster.add(object);}
    return {shellMaterial,granules,wire};
  });
  const nucleus=new THREE.Mesh(assets.nuclei,new THREE.MeshPhysicalMaterial({color:0x879cec,emissive:0x263c95,emissiveIntensity:.5,roughness:.34,metalness:.13,transparent:true,opacity:.8,clearcoat:.7,clearcoatRoughness:.2}));
  nucleus.matrixAutoUpdate=false;cluster.add(nucleus);
  assets.nucleoli.forEach((geometry,i)=>{
    const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:i?0xa84b32:0x346d64,roughness:.7,transparent:true,opacity:.6}));
    mesh.matrixAutoUpdate=false;cluster.add(mesh);
  });

  // Offset readout contours converge on the same schematic specimen coordinates.
  const readouts=mode===2?channelColors.map((color,channel)=>{
    const layer=new THREE.LineSegments(assets.edges[channel],new THREE.LineBasicMaterial({color,transparent:true,opacity:.65}));
    cluster.add(layer);
    return layer;
  }):[];
  const scan=new THREE.Mesh(new THREE.PlaneGeometry(7.6,.035),new THREE.MeshBasicMaterial({color:0xd9fff1,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));
  scan.position.z=.6;cluster.add(scan);

  // A schematic ROI changes scale without implying computed segmentation.
  const selection=mode===3||solutionScene?new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1,-1,.8),new THREE.Vector3(1,-1,.8),new THREE.Vector3(1,1,.8),new THREE.Vector3(-1,1,.8)]),
    new THREE.LineBasicMaterial({color:0xe9a17d,transparent:true,opacity:.95,depthTest:false})
  ):null;
  if(selection){selection.position.set(.2,0,0);selection.renderOrder=5;cluster.add(selection);}
  const spatialLinks=solutionScene?new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(spatialPoints.flatMap(([x,y,z],i)=>spatialPoints
      .filter((other,j)=>j>i&&Math.hypot(other[0]-x,other[1]-y)<1.9)
      .map(([otherX,otherY,otherZ])=>[new THREE.Vector3(x,y,z+.42),new THREE.Vector3(otherX,otherY,otherZ+.42)])).flat()),
    new THREE.LineBasicMaterial({color:0x62e1c2,transparent:true,opacity:.56,depthTest:false})
  ):null;
  const spatialFocus=solutionScene?new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(Array.from({length:48},(_,i)=>{
      const angle=i/48*Math.PI*2;return new THREE.Vector3(Math.cos(angle)*.48,Math.sin(angle)*.48,.55);
    })),
    new THREE.LineBasicMaterial({color:0xe9a17d,transparent:true,opacity:.9,depthTest:false})
  ):null;
  if(spatialLinks){spatialLinks.renderOrder=4;spatialFocus.renderOrder=5;cluster.add(spatialLinks,spatialFocus);}

  const regions=mode===2?[-1.8,1.8].map((x,i)=>{
    const box=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.7,-3.25,.6),new THREE.Vector3(1.7,-3.25,.6),new THREE.Vector3(1.7,3.25,.6),new THREE.Vector3(-1.7,3.25,.6)
    ]),new THREE.LineBasicMaterial({color:channelColors[i],transparent:true,opacity:.8,depthTest:false}));
    box.position.x=x;box.renderOrder=5;cluster.add(box);return box;
  }):[];

  let paused=false,time=0,entrance=0,pointer={x:0,y:0},active=true,allowed=false,lost=false,lastRound=-1;
  const motionPointer={x:0,y:0};
  let narrow=false;
  let spatialStage=0,stageTime=0,solution=0,storyProgress=0;
  const loop=createFrameLoop(delta=>{
    time+=delta;entrance=Math.min(1,entrance+delta*.58);
    const blend=followAmount(delta);
    motionPointer.x+=(pointer.x-motionPointer.x)*blend;
    motionPointer.y+=(pointer.y-motionPointer.y)*blend;
    render();
  });
  const syncLoop=()=>loop.setRunning(!paused&&active&&allowed&&!document.hidden&&!lost);
  function resize(){
    const width=root.clientWidth,height=root.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
    narrow=innerWidth<900;
    if(solutionScene){cluster.position.set(0,0,0);cluster.scale.setScalar(narrow?1.15:1.5);}
    else if(narrow){
      cluster.position.set(0,0,0);
      cluster.scale.setScalar(mode===0?1.15:1.38);
      camera.position.z=23;
    }else if(mode===0){cluster.position.set(camera.aspect*(width<1150?3.15:2.85),-.05,0);cluster.scale.setScalar(width>1700?1.56:width<1150?1.16:1.47);}
    else{cluster.position.set(0,0,0);cluster.scale.setScalar(width<800?1.28:1.4);}
    if(active&&allowed)render();
  }
  function render(){
    if(lost)return;
    const motion=narrativeFrame(mode,time,entrance);
    const cycle=stainingFrame(solutionScene&&!narrow?Math.min(7.95,storyProgress*8):time);
    cluster.rotation.y=.18+motion.rotationY*.65+motionPointer.x*.5+(mode===0?storyProgress*.16:0);
    cluster.rotation.x=-.28+motion.rotationX+motionPointer.y*.22-(mode===0?storyProgress*.09:0);
    camera.position.z=(solutionScene?13:narrow?23:22)+motion.cameraOffset-(mode===0&&!narrow?storyProgress*2.4:0);
    cluster.rotation.z=-.10+Math.sin(time*.16)*.04;
    if(mode===1)cluster.rotation.set(-.18+Math.sin(time*.24)*.045+motionPointer.y*.38,.10+Math.sin(time*.18)*.08+motionPointer.x*.65,Math.sin(time*.15)*.025);
    if(mode>=2)cluster.rotation.set(motionPointer.y*.18,Math.sin(time*.16)*.025+motionPointer.x*.28,0);
    light.position.set(-5+motionPointer.x*5,8-motionPointer.y*4,8);
    if(solutionScene&&selection){selection.visible=solution===2;selection.scale.set(1.65,1.65,1);}
    if(spatialLinks){
      spatialLinks.visible=solution===1;spatialFocus.visible=solution===1;
      if(solution===1&&spatialPoints.length){
        const viewHeight=2*camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/cluster.scale.x;
        const cursorX=motionPointer.x*viewHeight*camera.aspect;
        const cursorY=-motionPointer.y*viewHeight;
        const point=spatialPoints.reduce((nearest,current)=>Math.hypot(current[0]-cursorX,current[1]-cursorY)<Math.hypot(nearest[0]-cursorX,nearest[1]-cursorY)?current:nearest);
        spatialFocus.position.set(point[0],point[1],0);
      }
    }
    if(mode===1)onCycle(cycle);
    channels.forEach(({shellMaterial,wire,granules},i)=>{
      const intensity=mode===1?cycle.signal:mode===0?.28+Math.sin(time*.45+i)*.1:1;
      shellMaterial.uniforms.opacity.value=.25+intensity*.7;
      granules.material.opacity=intensity*.9;
      wire.material.opacity=mode===2?(spatialStage===0?.18:.95):intensity*.55;
      if(mode===2){shellMaterial.uniforms.opacity.value=spatialStage===1?.18:.6;granules.material.opacity=spatialStage===1?.16:.75;}
      if(solutionScene&&solution>0){shellMaterial.uniforms.opacity.value=solution===1?.22:.52;granules.material.opacity=solution===1?.12:.55;wire.material.opacity=solution===1?.95:.42;}
      if(lastRound!==cycle.round){
        const color=channelColors[mode===1?(i+cycle.round)%3:i];
        shellMaterial.uniforms.color.value.setHex(color);
        granules.material.color.setHex(color);wire.material.color.setHex(color);
      }
    });
    lastRound=cycle.round;
    readouts.forEach((layer,i)=>{
      layer.visible=spatialStage===0;
      const [x,y]=registrationOffset(paused?4:time-stageTime,i);
      layer.position.set(x,y,.3);
    });
    regions.forEach(region=>{region.visible=spatialStage===2;});
    scan.visible=mode===1&&cycle.step===1&&(!solutionScene||solution===0)&&!(hideNarrowScan&&narrow);
    scan.position.y=3.6-stainingScan(cycle,time,solutionScene&&!narrow)*7.2;
    scan.scale.x=solutionScene&&narrow?.8:1;
    renderer.render(scene,camera);
  }
  addEventListener('pointermove',event=>{
    if(narrow||paused||!allowed||event.pointerType==='touch')return;
    const rect=root.getBoundingClientRect();
    pointer={x:THREE.MathUtils.clamp((event.clientX-rect.left)/rect.width-.5,-.5,.5),y:THREE.MathUtils.clamp((event.clientY-rect.top)/rect.height-.5,-.5,.5)};
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{pointer={x:0,y:0};},{passive:true});
  const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;syncLoop();},{threshold:0});
  observer.observe(canvas.closest('[data-panel]'));
  addEventListener('resize',resize,{passive:true});
  const sizeObserver=new ResizeObserver(resize);
  sizeObserver.observe(root);
  addEventListener('scene-resize',resize);
  document.addEventListener('visibilitychange',syncLoop);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;syncLoop();root.classList.remove('is-ready');root.dataset.fallback='true';});
  resize();
  if(mode===0){render();root.classList.add('is-ready');}
  return {
    setPaused(value){paused=value;if(value&&(time===0||!allowed))entrance=1;syncLoop();render();},
    setActive(value){if(value&&!allowed){entrance=paused?1:0;render();root.classList.add('is-ready');}allowed=value;syncLoop();},
    setRegion(index){if(selection){const {size}=regionSelection(index);selection.scale.set(size,size,1);render();}},
    setSpatialStage(value){spatialStage=Math.max(0,Math.min(2,value));stageTime=time;render();},
    setSolution(value){solution=Math.max(0,Math.min(2,value));canvas.dataset.solution=String(solution);render();},
    setStoryProgress(value){storyProgress=Math.max(0,Math.min(1,value));if(active&&allowed)render();},
    capture(){render();return canvas.toDataURL('image/png');},
  };
}
