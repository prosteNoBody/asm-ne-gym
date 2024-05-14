import{C as c,a as u,b as d}from"./Control-Bpe8c0c8.js";class _ extends u{constructor(t){super(),this._calculateActions=t}updateState(t){const e=[t.birdData.jumped?1:0,t.birdData.position,t.birdData.velocity,t.pipeData.x,t.pipeData.y],i=this._calculateActions(e);return t.controls.jump=i[0]>.5,t}}class a extends d{constructor(t){super({width:20,height:20},t,!0),this.data={velocity:a.JUMP_VEL,position:t.y,jumped:!1}}render(t){t.fillStyle="blue",t.fillRect(this._pos.x,this._pos.y,this._size.width,this._size.height)}static{this.MAX_VEL=10}static{this.JUMP_VEL=-5}update(t,s){this.data.velocity+=.2,this.data.velocity>a.MAX_VEL&&(this.data.velocity=a.MAX_VEL),t.controls.jump&&!this.data.jumped?(this.data.jumped=!0,this.data.velocity=a.JUMP_VEL):t.controls.jump||(this.data.jumped=!1),this._pos.y+=this.data.velocity,this._pos.y<0?this._pos.y=0:this._pos.y+this._size.height>t.mapSize.height&&(this.destroy(),this._engineCallbacks?.stopEngine()),this.data.position=this._pos.y,t.birdData=this.data}collide(t,s){s instanceof h&&(this.destroy(),this._engineCallbacks?.stopEngine())}}class h extends d{static{this.WIDTH=75}render(t){t.fillStyle="red",t.fillRect(this._pos.x,this._pos.y,this._size.width,this._size.height)}update(t,s){this._pos.x-=p.PIPE_STEP,this._pos.x+h.WIDTH<0&&this.destroy()}collide(t,s){}}class p extends c{constructor(t,s){const e=new _(s);super(e,o=>{t(o.score)}),this.bug_det=[];const i=new a({x:50,y:200});this.registerEntity(i)}static{this.PIPE_STEP=4}updateGame(t,s){if(s%12e4===0&&(this.bug_det.filter(e=>e===this.bug_det[0]).length<3&&(t.score=0),this.stop()),t.score++,t.pipeData.x-=p.PIPE_STEP,t.pipeData.x+h.WIDTH<0){t.pipeData.x=t.mapSize.width+h.WIDTH;const e=100,i=50,o=Math.ceil(Math.random()*(t.mapSize.height-e*2-i*2))+e,r=new h({width:h.WIDTH,height:o-i},{x:t.pipeData.x,y:0},!0),l=new h({width:h.WIDTH,height:t.mapSize.height-o-i},{x:t.pipeData.x,y:o+i},!0);t.pipeData.y=o+i,this.bug_det.push(t.birdData.position),this.registerEntities([r,l])}}renderMap(t){t.fillStyle="#a3fcff",t.fillRect(0,0,this._sharedState.mapSize.width,this._sharedState.mapSize.height)}getSize(){return this._sharedState.mapSize}initSharedState(){return{score:0,birdData:{velocity:0,position:0,jumped:!1},pipeData:{x:-h.WIDTH,y:0},controls:{jump:!1},mapSize:{width:750,height:750}}}}const g=(n,t)=>new Promise(s=>{const e=new p(i=>{s(i)},n);if(t){const i=e.getSize();t.width=i.width,t.height=i.height;const o=t.getContext("2d");o&&e.mount(o)}e.run()});export{g as default};