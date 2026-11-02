const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const publicFiles=new Map([['/','index.html'],['/index.html','index.html'],['/style.css','style.css'],['/app.js','app.js'],['/engine.js','engine.js'],['/camera.js','camera.js']]);
const server=http.createServer((req,res)=>{let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end('Bad request');return}const name=publicFiles.get(route);if(!name){res.writeHead(404).end('Not found');return}try{const data=fs.readFileSync(path.join(__dirname,name)),ext=path.extname(name);res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'}[ext],'Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(500).end('Unable to read asset')}});
server.on('error',error=>{
 if(error.code!=='EADDRINUSE'){console.error('Impossible de lancer Material Lab : '+error.message);process.exitCode=1;return}
 const request=http.get('http://127.0.0.1:4173/',response=>{let body='';response.on('data',chunk=>body+=chunk);response.on('end',()=>{if(response.statusCode===200&&body.includes('<title>Material Lab</title>'))console.log('Material Lab est deja lance. Ouvrez http://127.0.0.1:4173/');else{console.error('Le port 4173 est utilise par une autre application.');process.exitCode=1}})});
 request.setTimeout(3000,()=>request.destroy(new Error('Delai de verification depasse')));request.on('error',()=>{console.error('Le port 4173 est occupe, mais le serveur ne repond pas.');process.exitCode=1});
});
server.listen(4173,'127.0.0.1',()=>console.log('Material Lab: http://127.0.0.1:4173/'));

