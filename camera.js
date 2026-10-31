(function(root){
class OrbitCamera{
 constructor(){this.reset()}
 reset(){this.yaw=0;this.pitch=0;this.distance=2.5;this.target=[0,0,0]}
 orbit(dx,dy){this.yaw-=dx*.008;this.pitch=Math.max(-1.48,Math.min(1.48,this.pitch+dy*.008))}
 zoom(delta){this.distance=Math.max(1.15,Math.min(12,this.distance*Math.exp(Math.max(-500,Math.min(500,delta))*.0015)))}
 pan(dx,dy,height,fov){const scale=2*this.distance*Math.tan(fov*Math.PI/360)/Math.max(1,height),right=[Math.cos(this.yaw),0,-Math.sin(this.yaw)],up=[-Math.sin(this.yaw)*Math.sin(this.pitch),Math.cos(this.pitch),-Math.cos(this.yaw)*Math.sin(this.pitch)];this.target=this.target.map((v,i)=>v+(-dx*right[i]+dy*up[i])*scale)}
}
root.OrbitCamera=OrbitCamera;if(typeof module!=='undefined')module.exports=OrbitCamera;
})(typeof window!=='undefined'?window:globalThis);
