import {tissuePositions,regionSelection} from './story.js';

export function createFeatureView(root){
  const map=root.querySelector('.feature-map');
  const outline=document.createElement('span');outline.className='feature-roi';map.append(outline);
  const dots=tissuePositions().map(([x,y],index)=>{
    const dot=document.createElement('span');
    dot.className=`feature-dot channel-${index%3}`;
    dot.style.left=`${(x+4.5)/9*100}%`;dot.style.top=`${(4-y)/8*100}%`;
    dot.setAttribute('aria-hidden','true');map.append(dot);return dot;
  });
  function select(index){
    const region=regionSelection(index),selected=new Set(region.cells.map(cell=>cell.index));
    dots.forEach((dot,i)=>dot.classList.toggle('is-selected',selected.has(i)));
    outline.style.left=`${(region.x-region.size+4.5)/9*100}%`;
    outline.style.top=`${(4-region.y-region.size)/8*100}%`;
    outline.style.width=`${region.size*2/9*100}%`;outline.style.height=`${region.size*2/8*100}%`;
    root.querySelector('#feature-count').textContent=`${region.cells.length} 个示意对象`;
    const ids=region.cells.map(cell=>cell.id);
    root.querySelector('#feature-ids').textContent=ids.slice(0,6).join(' · ')+(ids.length>6?` / 另 ${ids.length-6} 个`:'');
    root.querySelector('#feature-ids').title=ids.join(' · ');
    root.dataset.scale=String(index);
  }
  select(0);return {select};
}
