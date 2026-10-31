/* Deterministic tileable scalar texture graph; shared by browser and Node tests. */
(function(root){
'use strict';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,fract=x=>x-Math.floor(x),mod=(a,b)=>(a%b+b)%b;
function hash(x,y,s){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(s|0,1442695041);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295}
function noise(u,v,f,s){f=Math.max(1,Math.round(f));const x=u*f,y=v*f,ix=Math.floor(x),iy=Math.floor(y);let a=fract(x),b=fract(y);a=a*a*(3-2*a);b=b*b*(3-2*b);return mix(mix(hash(mod(ix,f),mod(iy,f),s),hash(mod(ix+1,f),mod(iy,f),s),a),mix(hash(mod(ix,f),mod(iy+1,f),s),hash(mod(ix+1,f),mod(iy+1,f),s),a),b)}
function fbm(u,v,f,s,oct=5){let z=0,w=0,a=.5;for(let k=0;k<oct;k++){z+=noise(u,v,f*2**k,s+k*17)*a;w+=a;a*=.5}return z/w}

function patternSample(type,u,v,p){const f=p.scale,s=p.seed;let edge=0,cx=0,cy=0;
if(type==='hexagon'){const X=u*f,Y=v*f*Math.sqrt(3),row=Math.floor(Y/(Math.sqrt(3)/2));let best=Infinity,bx=0,by=0;for(let j=row-1;j<=row+1;j++){const shift=mod(j,2)*.5,ix=Math.floor(X-shift);for(let k=ix-1;k<=ix+1;k++){const dx=X-(k+shift),dy=Y-j*Math.sqrt(3)/2,dd=dx*dx+dy*dy;if(dd<best){best=dd;bx=k;by=j;}}}const dx=X-(bx+mod(by,2)*.5),dy=Y-by*Math.sqrt(3)/2;edge=Infinity;for(let k=0;k<6;k++){const a=k*Math.PI/3;edge=Math.min(edge,.5-dx*Math.cos(a)-dy*Math.sin(a));}cx=mod(bx,f);cy=mod(by,2*f);}
else if(type==='herringbone'){const X=(u+v)*f*4,Y=(v-u)*f*4,ix=Math.floor(X),iy=Math.floor(Y),k=mod(ix-iy,4);if(k<2){const tx=fract(X)+k,ty=fract(Y);edge=Math.min(tx,2-tx,ty,1-ty);cx=mod(ix-k,f*4);cy=mod(iy,f*4);}else{const tx=fract(X),ty=fract(Y)+(k===2?1:0);edge=Math.min(tx,1-tx,ty,2-ty);cx=mod(ix,f*4);cy=mod(iy-(k===2?1:0),f*4);}}
else if(type==='basket'){const X=u*f,Y=v*f,ix=Math.floor(X),iy=Math.floor(Y),horizontal=mod(ix+iy,2)===0;const tx=horizontal?fract(X):fract(X*3),ty=horizontal?fract(Y*3):fract(Y);edge=Math.min(tx,1-tx,ty,1-ty);cx=mod(ix,f)*3+(horizontal?0:Math.floor(fract(X)*3));cy=mod(iy,f)*3+(horizontal?Math.floor(fract(Y)*3):0);}
else if(type==='interlock'){const Y=v*f*2,row=Math.floor(Y),ty=fract(Y),bend=(Math.abs(ty-.5)<.22?.18:-.18),X=u*f+mod(row,2)*.5+bend,tx=fract(X);edge=Math.min(tx,1-tx,ty,1-ty);cx=mod(Math.floor(X),f);cy=mod(row,f*2);}
else if(type==='ashlar'){const X=u*f,Y=v*f,ix=Math.floor(X),iy=Math.floor(Y),tx=fract(X),ty=fract(Y),layout=hash(mod(ix,f),mod(iy,f),s);if(layout<.33){edge=Math.min(tx,1-tx,ty,1-ty);cx=mod(ix,f)*3;cy=mod(iy,f)*3;}else if(layout<.66){edge=Math.min(fract(tx*2),1-fract(tx*2),ty,1-ty);cx=mod(ix,f)*3+Math.floor(tx*2);cy=mod(iy,f)*3;}else{edge=Math.min(tx,1-tx,fract(ty*2),1-fract(ty*2));cx=mod(ix,f)*3;cy=mod(iy,f)*3+Math.floor(ty*2);}}
else{const X=u*f,Y=v*f,tx=fract(X),ty=fract(Y);edge=Math.min(tx,1-tx,ty,1-ty);cx=mod(Math.floor(X),f);cy=mod(Math.floor(Y),f);}
const face=clamp((edge-p.joint)/p.bevel);return face*(1-p.variation*hash(cx,cy,s));}


function masonrySample(u,v,p){const f=p.scale,rows=p.rows,s=p.seed,jitter=p.jitter??.16,bound=(k,count,tag)=>k+(hash(mod(k,count),tag,s)-.5)*jitter;let Y=v*rows,row=Math.floor(Y);if(Y<bound(row,rows,900))row--;else if(Y>=bound(row+1,rows,900))row++;const ty=(Y-bound(row,rows,900))/(bound(row+1,rows,900)-bound(row,rows,900)),X=u*f+mod(row,2)*p.offset+(hash(mod(row,rows),71,s)-.5)*jitter;let col=Math.floor(X);const xb=k=>bound(k,f,mod(row,rows)+100);if(X<xb(col))col--;else if(X>=xb(col+1))col++;const tx=(X-xb(col))/(xb(col+1)-xb(col)),cx=mod(col,f),cy=mod(row,rows),id=hash(cx,cy,s),coarse=fbm(u,v,8,s+11,3),fine=fbm(u,v,64,s+21,3),edge=Math.min(tx,1-tx,ty,1-ty)+(fine-.5)*p.wear*.14+(noise(u,v,128,s+39)-.5)*p.wear*.065,face=clamp((edge-p.mortar)/.07),chip=clamp((.38-fine)*7)*p.wear*.18,holes=clamp((noise(u,v,40,s+52)-.61)*9)*(p.pits??.5)*.24,crack=(1-clamp(Math.abs(noise(u,v,28,s+71)-.5)*95))*p.cracks*.15,tilt=((tx-.5)*(hash(cx,cy,s+2)-.5)+(ty-.5)*(hash(cx,cy,s+3)-.5))*(p.tilt??.16),height=.66+(id-.5)*(p.heightVariation??.32)+tilt+(coarse-.5)*p.wear*.13+(fine-.5)*p.wear*.15-chip-holes-crack,mortar=(p.mortarHeight??.18)+(coarse-.5)*.09+(fine-.5)*.055;return {face,height:clamp(mix(mortar,height,face)),id};}

const specs={
kiln:{label:'Kiln / Mortar Weathering',icon:'◧',inputs:3,ports:['Color','Mask','ID'],desc:'Cuisson noire par brique, abrasion granuleuse et débordements irréguliers de mortier. Relier directement à Color du PBR Output.',params:{burn:[.42,0,1,.01,'Briques brûlées'],abrasion:[.5,0,1,.01,'Éclats clairs'],bleed:[.38,0,1,.01,'Mortier sur les faces'],seed:[42,0,999,1,'Seed']}},

efflo:{label:'Efflorescence / Salt',icon:'❋',inputs:1,desc:'Dépôts blancs minéraux : taches multi-échelles et concentration sur les arêtes.',params:{amount:[.48,0,1,.01,'Couverture'],scale:[7,2,24,1,'Échelle'],seed:[42,0,999,1,'Seed']}},

brickcolor:{label:'Brick Color Palette',icon:'◈',inputs:4,ports:['Patina','ID','Mask','Salt'],desc:'Couleurs indépendantes par brique : trois teintes, mortier séparé et patine de surface. Relier directement à Color du PBR Output.',params:{colorA:['#8a6545','color',0,0,'Teinte ocre'],colorB:['#694238','color',0,0,'Teinte terre'],colorC:['#777465','color',0,0,'Teinte pierre'],mortar:['#393c30','color',0,0,'Mortier'],variation:[.8,0,1,.01,'Variation chromatique'],seed:[42,0,999,1,'Seed']}},

herringbone:{label:'Herringbone Mask',icon:'▧',desc:'Chevrons / bâtons rompus. Masque blanc = surface, noir = joint, chanfrein réglable.',params:{scale:[4,2,16,2,'Répétitions (paires)'],joint:[.035,.008,.12,.002,'Joints'],bevel:[.04,.005,.15,.005,'Chanfrein'],variation:[.18,0,.5,.01,'Variation par élément'],seed:[42,0,999,1,'Seed']}},
hexagon:{label:'Hexagon Mask',icon:'▧',desc:'Dalles hexagonales. Masque blanc = surface, noir = joint, chanfrein réglable.',params:{scale:[4,2,16,2,'Répétitions (paires)'],joint:[.035,.008,.12,.002,'Joints'],bevel:[.04,.005,.15,.005,'Chanfrein'],variation:[.18,0,.5,.01,'Variation par élément'],seed:[42,0,999,1,'Seed']}},
basket:{label:'Basket Weave Mask',icon:'▧',desc:'Vannerie / parquet tressé. Masque blanc = surface, noir = joint, chanfrein réglable.',params:{scale:[4,2,16,2,'Répétitions (paires)'],joint:[.035,.008,.12,.002,'Joints'],bevel:[.04,.005,.15,.005,'Chanfrein'],variation:[.18,0,.5,.01,'Variation par élément'],seed:[42,0,999,1,'Seed']}},
interlock:{label:'Interlocking Pavers',icon:'▧',desc:'Pavés imbriqués à contours décalés. Masque blanc = surface, noir = joint, chanfrein réglable.',params:{scale:[4,2,16,2,'Répétitions (paires)'],joint:[.035,.008,.12,.002,'Joints'],bevel:[.04,.005,.15,.005,'Chanfrein'],variation:[.18,0,.5,.01,'Variation par élément'],seed:[42,0,999,1,'Seed']}},
tiles:{label:'Square Tiles Mask',icon:'▧',desc:'Dalles carrées et joints. Masque blanc = surface, noir = joint, chanfrein réglable.',params:{scale:[4,2,16,2,'Répétitions (paires)'],joint:[.035,.008,.12,.002,'Joints'],bevel:[.04,.005,.15,.005,'Chanfrein'],variation:[.18,0,.5,.01,'Variation par élément'],seed:[42,0,999,1,'Seed']}},
ashlar:{label:'Ashlar Mask',icon:'▧',desc:'Pierres de tailles mixtes. Masque blanc = surface, noir = joint, chanfrein réglable.',params:{scale:[4,2,16,2,'Répétitions (paires)'],joint:[.035,.008,.12,.002,'Joints'],bevel:[.04,.005,.15,.005,'Chanfrein'],variation:[.18,0,.5,.01,'Variation par élément'],seed:[42,0,999,1,'Seed']}},

warp:{label:'Directional Warp',icon:'↝',inputs:2,desc:'Déforme la première source avec le gradient de la seconde, bords raccordables.',params:{strength:[.018,0,.08,.001,'Déformation']}},
surface:{label:'Surface Detail',icon:'⠿',inputs:2,desc:'Ajoute du grain au relief en protégeant les joints creux.',params:{strength:[.22,0,.6,.01,'Grain'],threshold:[.24,0,.6,.01,'Protection des joints']}},
flood:{label:'Flood Fill Random',icon:'▩',inputs:1,desc:'Détecte les îlots au-dessus du seuil et attribue une valeur aléatoire par pierre ou planche.',params:{threshold:[.28,.05,.8,.01,'Seuil des îlots'],seed:[42,0,999,1,'Seed']}},
dirt:{label:'Dirt / Cavity Mask',icon:'◔',inputs:1,desc:'Masque de salissure combinant cavités et taches périodiques.',params:{amount:[.55,0,1,.01,'Salissure'],scale:[6,1,24,1,'Taches'],seed:[42,0,999,1,'Seed']}},
invert:{label:'Invert',icon:'◑',inputs:1,desc:'Inverse un masque ou un champ scalaire.',params:{}},

masonry:{label:'Dungeon Masonry',icon:'▥',desc:'Blocs et briques : joints, chanfreins, éclats, fissures et érosion périodique.',params:{scale:[5,2,16,1,'Colonnes'],rows:[8,2,24,2,'Rangées (paires)'],mortar:[.035,.01,.15,.005,'Joints'],wear:[.5,0,1,.01,'Érosion'],cracks:[.25,0,1,.01,'Fissures'],offset:[.5,0,.5,.05,'Décalage'],heightVariation:[.32,0,.6,.01,'Hauteur par brique'],tilt:[.16,0,.4,.01,'Inclinaison par brique'],pits:[.5,0,1,.01,'Cavités'],jitter:[.16,0,.35,.01,'Dimensions irrégulières'],mortarHeight:[.18,.02,.4,.01,'Niveau du mortier'],seed:[42,0,999,1,'Seed']}},
timber:{label:'Ancient Timber',icon:'≣',desc:'Planches à fibres fines, nœuds, rainures et fentes longitudinales.',params:{scale:[5,2,16,1,'Planches'],grain:[28,8,64,1,'Fibres'],damage:[.45,0,1,.01,'Usure / fentes'],joint:[.015,.003,.06,.001,'Joints'],seed:[42,0,999,1,'Seed']}},
plaster:{label:'Ruined Plaster',icon:'◍',desc:'Enduit minéral : couches écaillées, grains et crevasses.',params:{scale:[5,2,16,1,'Écailles'],wear:[.55,0,1,.01,'Dégradation'],seed:[42,0,999,1,'Seed']}},
noise:{label:'Fractal Noise',icon:'≈',desc:'Bruit fractal périodique à plusieurs octaves.',params:{scale:[8,1,32,1,'Fréquence'],detail:[5,1,7,1,'Octaves'],seed:[12,0,999,1,'Seed']}},
voronoi:{label:'Voronoi',icon:'◇',desc:'Cellules périodiques et distances aux points.',params:{scale:[9,2,24,1,'Cellules'],seed:[12,0,999,1,'Seed']}},
stains:{label:'Stains / Grunge',icon:'◌',desc:'Taches organiques raccordables à seuil progressif.',params:{scale:[5,1,24,1,'Échelle'],threshold:[.48,0,1,.01,'Seuil'],seed:[22,0,999,1,'Seed']}},
tiler:{label:'Tile Sampler',icon:'▦',desc:'Pavés décalés, joints et variations par tuile.',params:{scale:[6,2,20,1,'Colonnes'],mortar:[.06,.01,.2,.01,'Joint'],seed:[5,0,999,1,'Seed']}},
wood:{label:'Wood Grain',icon:'≋',desc:'Fibres longitudinales et anneaux déformés.',params:{scale:[8,2,24,1,'Fibres'],seed:[8,0,999,1,'Seed']}},
marble:{label:'Marble Veins',icon:'⌁',desc:'Veines turbulentes et microstructure minérale.',params:{scale:[3,1,12,1,'Veines'],seed:[30,0,999,1,'Seed']}},
blur:{label:'Blur',icon:'◉',inputs:1,desc:'Flou séparable avec bords périodiques.',params:{radius:[2,1,16,1,'Rayon']}},
ao:{label:'Ambient Occlusion',icon:'◐',inputs:1,desc:'Occlusion locale estimée depuis les hauteurs voisines.',params:{radius:[5,1,24,1,'Rayon'],strength:[5,.1,15,.1,'Intensité']}},
edge:{label:'Edge Detector',icon:'▱',inputs:1,desc:'Gradient de Sobel périodique pour détecter les contours.',params:{strength:[4,.1,15,.1,'Intensité']}},
blend:{label:'Blend / Multiply',icon:'⊕',inputs:2,desc:'Mélange de deux sources : interpolation ou multiplication.',params:{opacity:[.5,0,1,.01,'Opacité'],multiply:[0,0,1,1,'Multiplier']}},
levels:{label:'Levels',icon:'◒',inputs:1,desc:'Contraste et gamma du champ de hauteur.',params:{contrast:[1.5,.1,5,.05,'Contraste'],gamma:[1,.2,8,.05,'Gamma']}},
output:{label:'PBR Output',icon:'◈',inputs:4,ports:['Height','Color','Roughness','AO'],desc:'Entrées indépendantes : Height, Color, Roughness et AO. Une entrée vide utilise le calcul automatique.',params:{roughness:[.7,.05,1,.01,'Rugosité globale'],metallic:[0,0,1,.01,'Métal'],bump:[2,0,8,.1,'Relief'],dark:['#484c3f','color',0,0,'Couleur basse'],light:['#c4bfa5','color',0,0,'Couleur haute']}}
};
specs.brickmask={...specs.masonry,label:'Brick / Mortar Mask',icon:'▥',desc:'Masque structurel indépendant de la hauteur : blanc = brique, noir = mortier.'};
function makeNode(type,id,x,y,overrides={}){if(!specs[type])throw Error('Type inconnu');return {id,type,x,y,params:Object.fromEntries(Object.entries(specs[type].params).map(([k,v])=>[k,v[0]])),inputs:Array(specs[type].inputs||0).fill(null),...overrides}}
function evaluate(nodes,size){const cache=new Map(),visiting=new Set(),byId=new Map(nodes.map(n=>[n.id,n]));const get=id=>{if(cache.has(id))return cache.get(id);const n=byId.get(id);if(!n)throw Error('Source absente');if(visiting.has(id))throw Error('Cycle dans le graphe');visiting.add(id);const p=n.params,a=n.inputs.map(id=>id===null?new Float32Array(size*size).fill(.5):get(id)),out=new Float32Array(size*size),at=(src,x,y)=>src[mod(y,size)*size+mod(x,size)];
if(n.type==='flood'){const seen=new Uint8Array(out.length),queue=new Int32Array(out.length);let region=0;for(let i=0;i<out.length;i++){if(seen[i]||a[0][i]<p.threshold)continue;let head=0,tail=0;queue[tail++]=i;seen[i]=1;const value=.24+hash(region++,1,p.seed)*.72;while(head<tail){const k=queue[head++],x=k%size,y=Math.floor(k/size);out[k]=value;for(const nb of [y*size+mod(x-1,size),y*size+mod(x+1,size),mod(y-1,size)*size+x,mod(y+1,size)*size+x]){if(!seen[nb]&&a[0][nb]>=p.threshold){seen[nb]=1;queue[tail++]=nb;}}}}}
else if(n.type==='blur'){
const r=Math.round(p.radius),tmp=new Float32Array(out.length);for(let y=0;y<size;y++)for(let x=0;x<size;x++){let z=0;for(let k=-r;k<=r;k++)z+=at(a[0],x+k,y);tmp[y*size+x]=z/(2*r+1)}for(let y=0;y<size;y++)for(let x=0;x<size;x++){let z=0;for(let k=-r;k<=r;k++)z+=at(tmp,x,y+k);out[y*size+x]=z/(2*r+1)}}
else for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=y*size+x,u=x/size,v=y/size,s=p.seed||0,f=p.scale||1;let z=0;switch(n.type){
case 'herringbone':case 'hexagon':case 'basket':case 'interlock':case 'tiles':case 'ashlar':z=patternSample(n.type,u,v,p);break;
case 'warp':{const dx=at(a[1],x+1,y)-at(a[1],x-1,y),dy=at(a[1],x,y+1)-at(a[1],x,y-1);const xx=x+dx*p.strength*size,yy=y+dy*p.strength*size,ix=Math.floor(xx),iy=Math.floor(yy);z=mix(mix(at(a[0],ix,iy),at(a[0],ix+1,iy),fract(xx)),mix(at(a[0],ix,iy+1),at(a[0],ix+1,iy+1),fract(xx)),fract(yy));break;}
case 'surface':{const mask=clamp((a[0][i]-p.threshold)*8);z=a[0][i]+(a[1][i]-.5)*p.strength*mask;break;}
case 'dirt':z=clamp((1-a[0][i])*.58+(fbm(u,v,p.scale,p.seed,4)-.35)*p.amount*1.5);break;
case 'invert':z=1-a[0][i];break;
case 'masonry':z=masonrySample(u,v,p).height;break;
case 'brickmask':z=masonrySample(u,v,p).face;break;
case 'timber':{const X=u*f,board=Math.floor(X),tx=fract(X),b=hash(mod(board,f),0,s),edge=Math.min(tx,1-tx),j=clamp((edge-p.joint)*85),warp=fbm(u,v,3,s,3),knot=Math.sin(v*Math.PI*4+b*6.283)*.18*Math.pow(Math.sin(u*Math.PI*2),2),phase=u*p.grain*6.283185+warp*3+knot*7,grain=Math.sin(phase)*.085+Math.sin(phase*3)*.045,split=Math.pow(Math.max(0,Math.sin(phase)),24)*p.damage*(.4+.6*noise(u,v,8,s+23)),fine=noise(u,v,96,s+6);z=.065+j*(.43+b*.30+grain-split*.32+(fine-.5)*.10+(warp-.5)*.15);break;}
case 'plaster':{const layer=fbm(u,v,f,s,5),detail=fbm(u,v,56,s+9,3),peel=clamp((layer-(.35+p.wear*.15))*22),crevice=1-clamp(Math.abs(noise(u,v,16,s+12)-.5)*65);z=.23+peel*.48+(detail-.5)*(.12+p.wear*.12)-crevice*p.wear*.12;break;}
case 'noise':z=fbm(u,v,f,s,p.detail);break;
case 'stains':z=clamp((fbm(u,v,f,s)-p.threshold)*7+.5);break;
case 'voronoi':{const X=u*f,Y=v*f,ix=Math.floor(X),iy=Math.floor(Y);let d=2;for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){let gx=ix+k,gy=iy+j,dx=gx+hash(mod(gx,f),mod(gy,f),s)-X,dy=gy+hash(mod(gx,f),mod(gy,f),s+7)-Y;d=Math.min(d,Math.hypot(dx,dy))}z=clamp(d);break}
case 'tiler':{let rows=f,yy=v*rows,xx=u*f+(Math.floor(yy)%2)*.5,tx=fract(xx),ty=fract(yy);let edge=Math.min(tx,1-tx,ty,1-ty);z=clamp((edge-p.mortar)*28)*(.55+.35*hash(mod(Math.floor(xx),f),Math.floor(yy),s))+.06*fbm(u,v,30,s);break}
case 'wood':z=.45+.25*Math.sin(u*f*6.283+fbm(u,v,3,s)*13)+.12*noise(u,v,f*8,s)+.1*fbm(u,v,32,s);break;
case 'marble':{const t=u*f*6.283+fbm(u,v,4,s)*15;z=clamp(.92-Math.pow(Math.abs(Math.sin(t)),18)*.65+fbm(u,v,30,s)*.08);break}
case 'levels':z=Math.pow(clamp((a[0][i]-.5)*p.contrast+.5),1/p.gamma);break;
case 'blend':z=mix(a[0][i],p.multiply?a[0][i]*a[1][i]:a[1][i],p.opacity);break;
case 'edge':{const A=a[0],gx=-at(A,x-1,y-1)-2*at(A,x-1,y)-at(A,x-1,y+1)+at(A,x+1,y-1)+2*at(A,x+1,y)+at(A,x+1,y+1),gy=-at(A,x-1,y-1)-2*at(A,x,y-1)-at(A,x+1,y-1)+at(A,x-1,y+1)+2*at(A,x,y+1)+at(A,x+1,y+1);z=clamp(Math.hypot(gx,gy)*p.strength);break}
case 'ao':{let occ=0;for(let k=0;k<8;k++){let t=k*Math.PI/4;occ+=Math.max(0,at(a[0],x+Math.round(Math.cos(t)*p.radius),y+Math.round(Math.sin(t)*p.radius))-a[0][i])}z=clamp(1-occ*p.strength/8);break}
case 'efflo':{const patch=fbm(u,v,p.scale,p.seed,5),fine=noise(u,v,64,p.seed+19),center=a[0][i],r=Math.max(1,Math.round(size/180));let joint=1-center;for(let k=0;k<8;k++){const angle=k*Math.PI/4;joint=Math.max(joint,(1-at(a[0],x+Math.round(Math.cos(angle)*r),y+Math.round(Math.sin(angle)*r)))*.72);}z=clamp(joint*(.25+clamp((patch-.38)*4)*.75)*p.amount*1.5)*(.6+.4*fine);break;}
case 'kiln':z=a[0][i];break;
case 'brickcolor':z=a[0][i];break;
case 'output':z=a[0][i];break;
}out[i]=clamp(z)}visiting.delete(id);cache.set(id,out);return out};nodes.forEach(n=>get(n.id));return cache}
function maps(height,size,p,channels={}){if(channels.palette){const parse=h=>h.match(/\w\w/g).map(v=>parseInt(v,16));channels={...channels,paletteRGB:[channels.palette.colorA,channels.palette.colorB,channels.palette.colorC].map(parse),mortarRGB:parse(channels.palette.mortar)}}let result={};for(const k of ['BaseColor','Roughness','Height','Normal','AO'])result[k]=new Uint8ClampedArray(size*size*4);const rgb=h=>h.match(/\w\w/g).map(v=>parseInt(v,16)),lo=rgb(p.dark),hi=rgb(p.light),at=(x,y)=>height[mod(y,size)*size+mod(x,size)];for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=y*size+x,j=i*4,h=height[i],pigment=fbm(x/size,y/size,7,83,3)-.5,grain=noise(x/size,y/size,96,41)-.5,t=clamp((channels.color?channels.color[i]:h)*1.2-.1+pigment*.14+grain*.055),dx=(at(x+1,y)-at(x-1,y))*p.bump*size/128,dy=(at(x,y+1)-at(x,y-1))*p.bump*size/128,len=Math.hypot(dx,dy,1);let occ=0;for(let k=0;k<8;k++){const a=k*Math.PI/4;occ+=Math.max(0,at(x+Math.round(Math.cos(a)*5),y+Math.round(Math.sin(a)*5))-h)}const ao=channels.ao?clamp(channels.ao[i]):clamp(1-occ*.9),rough=channels.roughness?clamp(p.roughness+(channels.roughness[i]-.5)*.3,.04,1):clamp(p.roughness+(h-.5)*.18+pigment*.20+grain*.12,.04,1);const weather=channels.weather,wu=x/size,wv=y/size,sp=weather?noise(wu,wv,192,weather.seed+12):.5,mottle=weather?fbm(wu,wv,24,weather.seed+61,3):.5,cellRandom=weather?hash(Math.round((channels.ids?.[i]??.5)*65535),91,weather.seed):.5;for(let c=0;c<3;c++){let color=mix(lo[c],hi[c],t)*(1+pigment*.22+grain*.09);if(channels.palette){const palette=channels.palette,cell=channels.ids?channels.ids[i]:.5,random=hash(Math.round(cell*65535),0,palette.seed),choice=random*2,colors=channels.paletteRGB,idx=Math.min(1,Math.floor(choice)),fraction=choice-idx;const tint=mix(colors[idx][c],colors[idx+1][c],fraction),face=clamp(((channels.mask?channels.mask[i]:h)-.15)*5),patina=.80+.30*t+pigment*.18+grain*.08,brick=mix(mix(lo[c],hi[c],.65),tint,palette.variation)*patina; color=mix(channels.mortarRGB[c]*(.88+grain*.16),brick,face);}if(channels.salt){const salt=channels.salt[i]*.78;color=mix(color,[213,209,191][c]*(.91+grain*.08),salt);}if(weather){const mask=channels.mask?.[i]??1,face=clamp(mask*4),burn=clamp((weather.burn-cellRandom)*10)*(.7+.3*clamp((mottle-.3)*3)),black=[43,38,31][c];color=mix(color,black*(.6+mottle*.85),burn*face);const abrasion=clamp((sp-(.76-weather.abrasion*.14))*13)*weather.abrasion*face,spill=clamp((mottle-.42)*5)*weather.bleed*(1-mask*.78);color=mix(color,channels.mortarRGB[c]*(.89+sp*.16),clamp(abrasion+spill));color*=.9+sp*.2;}result.BaseColor[j+c]=color;result.Height[j+c]=h*255;result.Roughness[j+c]=(channels.salt?mix(rough,clamp(p.roughness+.1,.04,1),channels.salt[i]*.7):rough)*255;result.AO[j+c]=ao*255}result.Normal[j]=(-dx/len*.5+.5)*255;result.Normal[j+1]=(dy/len*.5+.5)*255;result.Normal[j+2]=(1/len*.5+.5)*255;for(const k in result)result[k][j+3]=255}return result}
const presets=[{name:'Calcaire érodé',gen:'noise',p:{scale:10,detail:6,seed:42},dark:'#56564a',light:'#d0c5aa',roughness:.85,metallic:0},{name:'Acier oxydé',gen:'stains',p:{scale:7,threshold:.48,seed:17},dark:'#26353b',light:'#b65d2e',roughness:.52,metallic:.65},{name:'Chêne fumé',gen:'wood',p:{scale:12,seed:8},dark:'#291b11',light:'#a57e48',roughness:.48,metallic:0},{name:'Marbre Calacatta',gen:'marble',p:{scale:3,seed:30},dark:'#37434a',light:'#e6e4db',roughness:.19,metallic:0},{name:'Brique patinée',gen:'tiler',p:{scale:6,mortar:.06,seed:5},dark:'#44443a',light:'#ba704c',roughness:.87,metallic:0}];
presets.forEach((p,i)=>p.category=['Minéral','Métal','Bois','Minéral','Briques'][i]);
presets.push(...[
  {
    "name": "Crypte · calcaire taillé",
    "category": "Murs",
    "gen": "masonry",
    "p": {
      "scale": 4,
      "rows": 6,
      "wear": 0.55,
      "cracks": 0.25,
      "seed": 101
    },
    "dark": "#282a25",
    "light": "#9b9380",
    "roughness": 0.88,
    "metallic": 0,
    "bump": 2.1,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Forteresse · granit noir",
    "category": "Murs",
    "gen": "masonry",
    "p": {
      "scale": 3,
      "rows": 4,
      "wear": 0.7,
      "cracks": 0.45,
      "seed": 102
    },
    "dark": "#161d20",
    "light": "#63696a",
    "roughness": 0.84,
    "metallic": 0,
    "bump": 2.5,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Catacombes · pierre humide",
    "category": "Murs",
    "gen": "masonry",
    "p": {
      "scale": 5,
      "rows": 8,
      "wear": 0.85,
      "cracks": 0.65,
      "mortar": 0.055,
      "seed": 103
    },
    "dark": "#111b19",
    "light": "#637065",
    "roughness": 0.38,
    "metallic": 0,
    "bump": 2.8,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Abbaye · grès ancien",
    "category": "Murs",
    "gen": "masonry",
    "p": {
      "scale": 3,
      "rows": 6,
      "wear": 0.65,
      "offset": 0,
      "seed": 104
    },
    "dark": "#3c342a",
    "light": "#ac9570",
    "roughness": 0.91,
    "metallic": 0,
    "bump": 2,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Rempart · blocs massifs",
    "category": "Murs",
    "gen": "masonry",
    "p": {
      "scale": 2,
      "rows": 4,
      "wear": 0.4,
      "mortar": 0.025,
      "seed": 105
    },
    "dark": "#272b2d",
    "light": "#8a8c86",
    "roughness": 0.8,
    "metallic": 0,
    "bump": 1.7,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Ruines · schiste fendu",
    "category": "Murs",
    "gen": "masonry",
    "p": {
      "scale": 4,
      "rows": 14,
      "wear": 1,
      "cracks": 0.95,
      "seed": 106
    },
    "dark": "#202329",
    "light": "#777881",
    "roughness": 0.9,
    "metallic": 0,
    "bump": 3,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Égout · pierre verdie",
    "category": "Murs",
    "gen": "masonry",
    "p": {
      "scale": 4,
      "rows": 8,
      "wear": 0.9,
      "mortar": 0.08,
      "seed": 107
    },
    "dark": "#14201a",
    "light": "#5f6d3f",
    "roughness": 0.48,
    "metallic": 0,
    "bump": 2.7,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Temple · basalte taillé",
    "category": "Murs",
    "gen": "masonry",
    "p": {
      "scale": 6,
      "rows": 6,
      "wear": 0.28,
      "offset": 0,
      "mortar": 0.02,
      "seed": 108
    },
    "dark": "#101416",
    "light": "#50595c",
    "roughness": 0.62,
    "metallic": 0,
    "bump": 1.6,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Chapelle · enduit écaillé",
    "category": "Murs",
    "gen": "plaster",
    "p": {
      "scale": 5,
      "wear": 0.6,
      "seed": 109
    },
    "dark": "#514638",
    "light": "#b6ac93",
    "roughness": 0.88,
    "metallic": 0,
    "bump": 1.3,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Cachot · crépi salpêtré",
    "category": "Murs",
    "gen": "plaster",
    "p": {
      "scale": 8,
      "wear": 0.9,
      "seed": 110
    },
    "dark": "#343c35",
    "light": "#929784",
    "roughness": 0.94,
    "metallic": 0,
    "bump": 1.8,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Brique · terre cuite ancienne",
    "category": "Briques",
    "gen": "masonry",
    "p": {
      "scale": 6,
      "rows": 12,
      "wear": 0.45,
      "seed": 201
    },
    "dark": "#3d3028",
    "light": "#a45c3b",
    "roughness": 0.88,
    "metallic": 0,
    "bump": 1.8,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Brique · four brûlé",
    "category": "Briques",
    "gen": "masonry",
    "p": {
      "scale": 7,
      "rows": 14,
      "wear": 0.6,
      "cracks": 0.7,
      "seed": 202
    },
    "dark": "#17191a",
    "light": "#694035",
    "roughness": 0.93,
    "metallic": 0,
    "bump": 2.2,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Brique · cave humide",
    "category": "Briques",
    "gen": "masonry",
    "p": {
      "scale": 6,
      "rows": 12,
      "wear": 0.8,
      "mortar": 0.06,
      "seed": 203
    },
    "dark": "#202923",
    "light": "#71513b",
    "roughness": 0.39,
    "metallic": 0,
    "bump": 2.3,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Brique · rouge sang",
    "category": "Briques",
    "gen": "masonry",
    "p": {
      "scale": 5,
      "rows": 10,
      "wear": 0.35,
      "seed": 204
    },
    "dark": "#302426",
    "light": "#8b3e32",
    "roughness": 0.8,
    "metallic": 0,
    "bump": 1.6,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Brique · chaux délavée",
    "category": "Briques",
    "gen": "masonry",
    "p": {
      "scale": 7,
      "rows": 14,
      "wear": 0.7,
      "seed": 205
    },
    "dark": "#575347",
    "light": "#b3ac97",
    "roughness": 0.92,
    "metallic": 0,
    "bump": 1.8,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Brique · joints profonds",
    "category": "Briques",
    "gen": "masonry",
    "p": {
      "scale": 5,
      "rows": 12,
      "mortar": 0.095,
      "wear": 0.6,
      "seed": 206
    },
    "dark": "#222322",
    "light": "#985b3f",
    "roughness": 0.86,
    "metallic": 0,
    "bump": 2.7,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Brique · appareillage droit",
    "category": "Briques",
    "gen": "masonry",
    "p": {
      "scale": 6,
      "rows": 16,
      "offset": 0,
      "wear": 0.2,
      "cracks": 0.1,
      "seed": 207
    },
    "dark": "#35302a",
    "light": "#a47a54",
    "roughness": 0.83,
    "metallic": 0,
    "bump": 1.5,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Brique · maçonnerie effritée",
    "category": "Briques",
    "gen": "masonry",
    "p": {
      "scale": 4,
      "rows": 10,
      "wear": 1,
      "cracks": 1,
      "seed": 208
    },
    "dark": "#35332c",
    "light": "#916b50",
    "roughness": 0.96,
    "metallic": 0,
    "bump": 3,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Bois · porte de crypte",
    "category": "Bois",
    "gen": "timber",
    "p": {
      "scale": 5,
      "grain": 32,
      "damage": 0.7,
      "joint": 0.025,
      "seed": 301
    },
    "dark": "#181711",
    "light": "#6b5740",
    "roughness": 0.84,
    "metallic": 0,
    "bump": 2.2,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Bois · chêne de taverne",
    "category": "Bois",
    "gen": "timber",
    "p": {
      "scale": 4,
      "grain": 24,
      "damage": 0.35,
      "seed": 302
    },
    "dark": "#352419",
    "light": "#a17a47",
    "roughness": 0.6,
    "metallic": 0,
    "bump": 1.5,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Bois · plancher de donjon",
    "category": "Bois",
    "gen": "timber",
    "p": {
      "scale": 7,
      "grain": 40,
      "damage": 0.85,
      "joint": 0.03,
      "seed": 303
    },
    "dark": "#25231c",
    "light": "#7a7054",
    "roughness": 0.88,
    "metallic": 0,
    "bump": 2.4,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Bois · poutres carbonisées",
    "category": "Bois",
    "gen": "timber",
    "p": {
      "scale": 3,
      "grain": 28,
      "damage": 1,
      "joint": 0.035,
      "seed": 304
    },
    "dark": "#0c1011",
    "light": "#41423c",
    "roughness": 0.96,
    "metallic": 0,
    "bump": 2.7,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Bois · pin de palissade",
    "category": "Bois",
    "gen": "timber",
    "p": {
      "scale": 8,
      "grain": 48,
      "damage": 0.6,
      "joint": 0.02,
      "seed": 305
    },
    "dark": "#3b3323",
    "light": "#af9b67",
    "roughness": 0.86,
    "metallic": 0,
    "bump": 1.9,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Bois · planches détrempées",
    "category": "Bois",
    "gen": "timber",
    "p": {
      "scale": 6,
      "grain": 36,
      "damage": 0.65,
      "seed": 306
    },
    "dark": "#101b19",
    "light": "#4c5b45",
    "roughness": 0.33,
    "metallic": 0,
    "bump": 1.7,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Bois · noyer poli ancien",
    "category": "Bois",
    "gen": "timber",
    "p": {
      "scale": 4,
      "grain": 28,
      "damage": 0.15,
      "joint": 0.007,
      "seed": 307
    },
    "dark": "#241811",
    "light": "#745037",
    "roughness": 0.3,
    "metallic": 0,
    "bump": 0.8,
    "micro": 0.07,
    "contrast": 1.1
  },
  {
    "name": "Bois · chêne cendré",
    "category": "Bois",
    "gen": "timber",
    "p": {
      "scale": 5,
      "grain": 44,
      "damage": 0.8,
      "seed": 308
    },
    "dark": "#303330",
    "light": "#92917e",
    "roughness": 0.9,
    "metallic": 0,
    "bump": 2.1,
    "micro": 0.07,
    "contrast": 1.1
  }
]);

presets.push(...[{"gen":"herringbone","name":"Chevrons · pierre de crypte","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":601},"dark":"#383a33","light":"#a59b7d","roughness":0.88,"metallic":0,"bump":1.5},{"gen":"herringbone","name":"Chevrons · terre cuite","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":618},"dark":"#38271e","light":"#ab7050","roughness":0.83,"metallic":0,"bump":1.5},{"gen":"hexagon","name":"Hexagones · calcaire","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":635},"dark":"#49473b","light":"#c4baa0","roughness":0.82,"metallic":0,"bump":1.5},{"gen":"hexagon","name":"Hexagones · basalte","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":652},"dark":"#151b20","light":"#657070","roughness":0.68,"metallic":0,"bump":1.5},{"gen":"basket","name":"Vannerie · parquet ancien","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":669},"dark":"#302016","light":"#a37b46","roughness":0.65,"metallic":0,"bump":1.5},{"gen":"basket","name":"Vannerie · pavés usés","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":686},"dark":"#36382e","light":"#96957c","roughness":0.9,"metallic":0,"bump":1.5},{"gen":"interlock","name":"Pavés imbriqués · grès","category":"Motifs","p":{"scale":4,"joint":0.025,"bevel":0.04,"variation":0.28,"seed":703},"dark":"#534331","light":"#b3a080","roughness":0.86,"metallic":0,"bump":1.5},{"gen":"interlock","name":"Pavés imbriqués · ardoise","category":"Motifs","p":{"scale":4,"joint":0.025,"bevel":0.04,"variation":0.28,"seed":720},"dark":"#1d262a","light":"#777e82","roughness":0.8,"metallic":0,"bump":1.5},{"gen":"tiles","name":"Dalles · abbaye","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":737},"dark":"#4d4739","light":"#b7ac91","roughness":0.8,"metallic":0,"bump":1.5},{"gen":"tiles","name":"Dalles · obsidienne","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":754},"dark":"#101419","light":"#414d58","roughness":0.26,"metallic":0,"bump":1.5},{"gen":"ashlar","name":"Appareil mixte · ruines","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":771},"dark":"#34352b","light":"#9b9476","roughness":0.91,"metallic":0,"bump":1.5},{"gen":"ashlar","name":"Appareil mixte · forteresse","category":"Motifs","p":{"scale":4,"joint":0.035,"bevel":0.04,"variation":0.28,"seed":788},"dark":"#24282b","light":"#84888a","roughness":0.86,"metallic":0,"bump":1.5}]);
presets.push(...[
  {
    "name": "Réf · Brique ocre érodée",
    "category": "Références",
    "gen": "masonry",
    "p": {
      "scale": 7,
      "rows": 18,
      "mortar": 0.038,
      "wear": 0.92,
      "cracks": 0.48,
      "seed": 381
    },
    "dark": "#35362b",
    "light": "#956647",
    "roughness": 0.82,
    "metallic": 0,
    "bump": 1.15,
    "nodeOverrides": {
      "2": {
        "scale": 28,
        "detail": 6
      },
      "3": {
        "strength": 0.025
      },
      "4": {
        "strength": 0.23
      },
      "6": {
        "threshold": 0.31
      },
      "8": {
        "amount": 0.42,
        "scale": 5
      },
      "9": {
        "opacity": 0.19
      },
      "10": {
        "contrast": 0.13,
        "gamma": 3.4927886207911554
      },
      "11": {
        "radius": 4,
        "strength": 4.5
      },
      "12": {
        "colorA": "#956647",
        "colorB": "#635343",
        "colorC": "#8a8068",
        "mortar": "#35362b",
        "variation": 0.95
      },
      "13": {
        "amount": 0.34,
        "scale": 9
      }
    },
    "preview": {
      "fov": 39,
      "tiling": 1,
      "displacement": 0.085,
      "fresnel": 0.65,
      "light": 0.8,
      "relief": 0.6
    }
  },
  {
    "name": "Réf · Brique rouge patinée",
    "category": "Références",
    "gen": "masonry",
    "p": {
      "scale": 8,
      "rows": 20,
      "mortar": 0.035,
      "wear": 0.6,
      "cracks": 0.32,
      "seed": 547
    },
    "dark": "#4c493a",
    "light": "#a66d50",
    "roughness": 0.76,
    "metallic": 0,
    "bump": 1.15,
    "nodeOverrides": {
      "2": {
        "scale": 28,
        "detail": 6
      },
      "3": {
        "strength": 0.018
      },
      "4": {
        "strength": 0.19
      },
      "6": {
        "threshold": 0.31
      },
      "8": {
        "amount": 0.42,
        "scale": 5
      },
      "9": {
        "opacity": 0.19
      },
      "10": {
        "contrast": 0.13,
        "gamma": 2.525707431112262
      },
      "11": {
        "radius": 4,
        "strength": 4.5
      },
      "12": {
        "colorA": "#a66d50",
        "colorB": "#754438",
        "colorC": "#a18b70",
        "mortar": "#4c493a",
        "variation": 0.95
      },
      "13": {
        "amount": 0.43,
        "scale": 9
      }
    },
    "preview": {
      "fov": 39,
      "tiling": 1,
      "displacement": 0.055,
      "fresnel": 0.65,
      "light": 0.8,
      "relief": 0.6
    }
  },
  {
    "name": "Réf · Brique chaulée",
    "category": "Références",
    "gen": "masonry",
    "p": {
      "scale": 7,
      "rows": 18,
      "mortar": 0.055,
      "wear": 0.78,
      "cracks": 0.4,
      "seed": 627
    },
    "dark": "#8b8972",
    "light": "#946348",
    "roughness": 0.9,
    "metallic": 0,
    "bump": 1.15,
    "nodeOverrides": {
      "2": {
        "scale": 28,
        "detail": 6
      },
      "3": {
        "strength": 0.021
      },
      "4": {
        "strength": 0.24
      },
      "6": {
        "threshold": 0.31
      },
      "8": {
        "amount": 0.42,
        "scale": 5
      },
      "9": {
        "opacity": 0.19
      },
      "10": {
        "contrast": 0.13,
        "gamma": 6.578813478960585
      },
      "11": {
        "radius": 4,
        "strength": 4.5
      },
      "12": {
        "colorA": "#946348",
        "colorB": "#78624e",
        "colorC": "#a1967d",
        "mortar": "#8b8972",
        "variation": 0.95
      },
      "13": {
        "amount": 0.82,
        "scale": 9
      }
    },
    "preview": {
      "fov": 39,
      "tiling": 1,
      "displacement": 0.07,
      "fresnel": 0.65,
      "light": 0.8,
      "relief": 0.6
    }
  },
  {
    "name": "Réf · Brique de four sombre",
    "category": "Références",
    "gen": "masonry",
    "p": {
      "scale": 7,
      "rows": 18,
      "mortar": 0.026,
      "wear": 0.4,
      "cracks": 0.22,
      "seed": 726
    },
    "dark": "#39382c",
    "light": "#664437",
    "roughness": 0.61,
    "metallic": 0,
    "bump": 1.15,
    "nodeOverrides": {
      "2": {
        "scale": 28,
        "detail": 6
      },
      "3": {
        "strength": 0.012
      },
      "4": {
        "strength": 0.14
      },
      "6": {
        "threshold": 0.31
      },
      "8": {
        "amount": 0.42,
        "scale": 5
      },
      "9": {
        "opacity": 0.19
      },
      "10": {
        "contrast": 0.13,
        "gamma": 1.4022907919182888
      },
      "11": {
        "radius": 4,
        "strength": 4.5
      },
      "12": {
        "colorA": "#664437",
        "colorB": "#3f3831",
        "colorC": "#80604b",
        "mortar": "#39382c",
        "variation": 0.95
      },
      "13": {
        "amount": 0.15,
        "scale": 9
      }
    },
    "preview": {
      "fov": 39,
      "tiling": 1,
      "displacement": 0.035,
      "fresnel": 0.65,
      "light": 0.8,
      "relief": 0.6
    }
  },
  {
    "name": "Réf · Pierre grossière salpêtrée",
    "category": "Références",
    "gen": "masonry",
    "p": {
      "scale": 5,
      "rows": 12,
      "mortar": 0.052,
      "wear": 1,
      "cracks": 0.85,
      "seed": 831
    },
    "dark": "#45483a",
    "light": "#948b6a",
    "roughness": 0.91,
    "metallic": 0,
    "bump": 1.15,
    "nodeOverrides": {
      "2": {
        "scale": 28,
        "detail": 6
      },
      "3": {
        "strength": 0.035
      },
      "4": {
        "strength": 0.38
      },
      "6": {
        "threshold": 0.31
      },
      "8": {
        "amount": 0.42,
        "scale": 5
      },
      "9": {
        "opacity": 0.19
      },
      "10": {
        "contrast": 0.13,
        "gamma": 7.349614958201109
      },
      "11": {
        "radius": 4,
        "strength": 4.5
      },
      "12": {
        "colorA": "#948b6a",
        "colorB": "#75634e",
        "colorC": "#aa9e7b",
        "mortar": "#45483a",
        "variation": 0.95
      },
      "13": {
        "amount": 0.66,
        "scale": 9
      }
    },
    "preview": {
      "fov": 39,
      "tiling": 1,
      "displacement": 0.11,
      "fresnel": 0.65,
      "light": 0.8,
      "relief": 0.6
    }
  },
  {
    "name": "Réf · Terre cuite régulière",
    "category": "Références",
    "gen": "masonry",
    "p": {
      "scale": 8,
      "rows": 20,
      "mortar": 0.03,
      "wear": 0.24,
      "cracks": 0.1,
      "seed": 917
    },
    "dark": "#777463",
    "light": "#a96c4e",
    "roughness": 0.72,
    "metallic": 0,
    "bump": 1.15,
    "nodeOverrides": {
      "2": {
        "scale": 28,
        "detail": 6
      },
      "3": {
        "strength": 0.007
      },
      "4": {
        "strength": 0.12
      },
      "6": {
        "threshold": 0.31
      },
      "8": {
        "amount": 0.42,
        "scale": 5
      },
      "9": {
        "opacity": 0.19
      },
      "10": {
        "contrast": 0.13,
        "gamma": 2.1100109564821596
      },
      "11": {
        "radius": 4,
        "strength": 4.5
      },
      "12": {
        "colorA": "#a96c4e",
        "colorB": "#89553c",
        "colorC": "#b48e67",
        "mortar": "#777463",
        "variation": 0.95
      },
      "13": {
        "amount": 0.18,
        "scale": 9
      }
    },
    "preview": {
      "fov": 39,
      "tiling": 1,
      "displacement": 0.025,
      "fresnel": 0.65,
      "light": 0.8,
      "relief": 0.6
    }
  }
]);
presets.filter(p=>p.category==='Références').forEach(p=>{p.nodeOverrides[12].mortar=p.name.includes('sombre')?'#655e4b':'#a0997e';p.nodeOverrides[13].amount=Math.max(.55,p.nodeOverrides[13].amount);p.p.heightVariation=.4;p.p.tilt=.2;p.p.pits=.7;p.p.jitter=.22;p.preview.tiling=2;p.preview.displacement=Math.round(p.preview.displacement*.35*1000)/1000;p.preview.relief=.3;p.nodeOverrides[3].strength*=.55;p.nodeOverrides[4].strength*=.65;});
presets.push({"name":"Réf · Mur ancien cuisson contrastée","category":"Références","gen":"masonry","p":{"scale":9,"rows":20,"mortar":0.05,"wear":0.85,"cracks":0.15,"offset":0.5,"seed":457,"heightVariation":0.16,"tilt":0.08,"pits":0.55,"jitter":0.18,"mortarHeight":0.26},"dark":"#69452e","light":"#b47b52","roughness":0.87,"metallic":0,"bump":0.85,"nodeOverrides":{"2":{"scale":32,"detail":6},"3":{"strength":0.004},"4":{"strength":0.12},"6":{"threshold":0.31},"8":{"amount":0.25},"9":{"opacity":0.12},"10":{"contrast":0.12,"gamma":5},"11":{"radius":3,"strength":3.5},"12":{"colorA":"#b5855b","colorB":"#855334","colorC":"#a66f47","mortar":"#b9b08b","variation":1},"13":{"amount":0.22,"scale":12},"15":{"burn":0.5,"abrasion":0.65,"bleed":0.4,"seed":457}},"preview":{"fov":42,"tiling":1.5,"displacement":0.018,"fresnel":0.45,"light":0.7,"relief":0.4}});
function preset(index){const p=presets[index],seed=p.p.seed||42,g=makeNode(p.gen==='tiler'?'masonry':p.gen,1,30,60);Object.assign(g.params,p.p);const micro=makeNode('noise',2,30,270);Object.assign(micro.params,{scale:32,seed:(seed*37)%1000,detail:6});const warp=makeNode('warp',3,235,60);warp.inputs=[1,2];warp.params.strength=.012;const detail=makeNode('surface',4,440,60);detail.inputs=[3,2];detail.params.strength=p.gen==='marble'?.055:.27;
const flood=makeNode('flood',6,235,470);flood.inputs=[1];flood.params.seed=seed;flood.params.threshold=g.type==='timber'?.24:.3;
const pigment=makeNode('blend',7,650,270);pigment.inputs=[4,6];pigment.params.opacity=['masonry','timber','herringbone','hexagon','basket','interlock','tiles','ashlar'].includes(g.type)?.42:.12;
const dirt=makeNode('dirt',8,440,470);dirt.inputs=[4];dirt.params.seed=(seed+123)%1000;dirt.params.amount=.6;
const color=makeNode('blend',9,850,270);color.inputs=[7,8];color.params.multiply=1;color.params.opacity=.28;
const rough=makeNode('levels',10,650,470);rough.inputs=[2];rough.params.contrast=.25;rough.params.gamma=Math.max(.2,Math.min(3,p.roughness*2));
const ao=makeNode('ao',11,850,60);ao.inputs=[4];ao.params.strength=7;
const out=makeNode('output',5,1060,180);out.inputs=[4,9,10,11];Object.assign(out.params,{dark:p.dark,light:p.light,roughness:p.roughness,metallic:p.metallic,bump:p.bump??(index===3?.6:2)});const list=[g,micro,warp,detail,flood,pigment,dirt,color,rough,ao,out];if(['masonry','herringbone','hexagon','basket','interlock','tiles','ashlar'].includes(g.type)){const palette=makeNode('brickcolor',12,1060,420);palette.inputs=[9,6,1,13];const salt=makeNode('efflo',13,850,650);salt.inputs=[4];salt.params.seed=(seed+71)%1000;salt.params.amount=p.category==='Briques'?.55:.38;list.splice(list.length-1,0,salt);Object.assign(palette.params,{colorA:p.light,colorB:p.category==='Briques'?'#815040':p.dark,colorC:p.category==='Briques'?'#8a8268':'#7c7968',mortar:'#393c32',seed});out.x=1270;out.inputs[1]=12;list.splice(list.length-1,0,palette);}if(g.type==='masonry'){const mask=makeNode('brickmask',14,30,680);Object.assign(mask.params,g.params);list.splice(1,0,mask);flood.inputs=[14];const pal=list.find(n=>n.type==='brickcolor');if(pal)pal.inputs[2]=14;const saltNode=list.find(n=>n.type==='efflo');if(saltNode)saltNode.inputs=[14];}if(p.category==='Références'&&g.type==='masonry'){const finish=makeNode('kiln',15,1270,420);finish.inputs=[12,14,6];finish.params.seed=seed;list.splice(list.length-1,0,finish);out.x=1470;out.inputs[1]=15;}for(const n of list){if(p.nodeOverrides?.[n.id])Object.assign(n.params,p.nodeOverrides[n.id]);}return list}
function materialMaps(cache,nodes,out,size){const color=nodes.find(n=>n.id===out.inputs[1]),weather=color?.type==='kiln'?color:null,source=weather?nodes.find(n=>n.id===weather.inputs[0]):color,palette=source?.type==='brickcolor'?source:null;return maps(cache.get(out.id),size,out.params,{weather:weather?.params,color:out.inputs[1]!=null?cache.get(out.inputs[1]):null,roughness:out.inputs[2]!=null?cache.get(out.inputs[2]):null,ao:out.inputs[3]!=null?cache.get(out.inputs[3]):null,...(palette?{palette:palette.params,ids:cache.get(palette.inputs[1]),mask:cache.get(palette.inputs[2]),salt:cache.get(palette.inputs[3])}:{})})}

function validate(data){if(!data||data.version!==1||!Array.isArray(data.nodes)||!data.nodes.length||data.nodes.length>80)throw Error('Projet invalide (1 à 80 nodes)');const ids=new Set();for(const n of data.nodes){if(n.type==='masonry'){for(const [k,v] of Object.entries(specs.masonry.params)){if(n.params&&n.params[k]===undefined)n.params[k]=v[0];}}if(n.type==='brickcolor'&&Array.isArray(n.inputs)&&n.inputs.length===3)n.inputs.push(null);if(n.type==='output'&&Array.isArray(n.inputs)&&n.inputs.length===1)n.inputs.push(null,null,null);if(!specs[n.type]||!Number.isInteger(n.id)||ids.has(n.id)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||Math.abs(n.x)>10000||Math.abs(n.y)>10000)throw Error('Node invalide');ids.add(n.id);if(!Array.isArray(n.inputs)||n.inputs.length!==(specs[n.type].inputs||0))throw Error('Entrées invalides');for(const [k,s] of Object.entries(specs[n.type].params)){const v=n.params?.[k];if(s[1]==='color'?!/^#[0-9a-f]{6}$/i.test(v):!Number.isFinite(v)||v<s[1]||v>s[2])throw Error('Paramètre invalide')}}if(!data.nodes.some(n=>n.type==='output'))throw Error('Sortie PBR absente');for(const n of data.nodes)for(const id of n.inputs)if(id!==null&&!ids.has(id))throw Error('Connexion invalide');evaluate(data.nodes,8);return data.nodes}
root.MaterialEngine={specs,makeNode,evaluate,maps,presets,preset,validate,noise,patternSample,materialMaps,masonrySample};if(typeof module!=='undefined')module.exports=root.MaterialEngine;
})(typeof window!=='undefined'?window:globalThis);



