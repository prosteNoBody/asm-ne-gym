const c=16.666666666666668;class u{constructor(t,e){this._entities=[],this._isActive=!1,this._updateTicks=0,this._lastFrameTimeMs=0,this._control=t,this._sharedState=this.initSharedState(),this._finishCallback=e}getCallbacks(){return{registerEntity:t=>this.registerEntity(t),destroyEntity:t=>this.destroyEntity(t),stopEngine:()=>this.stop()}}registerEntities(t){t.forEach(e=>{this.registerEntity(e)})}registerEntity(t){this._entities.push(t),t.registerCallbacks(this.getCallbacks())}destroyEntity(t){const e=this._entities.findIndex(i=>i.getId()===t);this._entities.splice(e,1)}render(){if(this._ctx){this._ctx.beginPath(),this.renderMap(this._ctx);for(let t=0;t<this._entities.length;t++)this._entities[t].render(this._ctx);this._ctx.fill()}}renderMap(t){t.clearRect(0,0,t.canvas.width,t.canvas.height)}updateGame(t,e){}updateState(){this._sharedState=this._control.updateState(this._sharedState)}updateEntities(){for(let t=0;t<this._entities.length;t++)this._entities[t].update(this._sharedState,this._updateTicks)}updateColissions(){for(let t=0;t<this._entities.length;t++)if(this._entities[t].isCollidable())for(let e=t+1;e<this._entities.length;e++){if(!this._entities[e].isCollidable())continue;const i=this._entities[t],s=this._entities[e],h=i.getPos(),l=i.getSize(),a=s.getPos(),p=s.getSize();(h.x<a.x?a.x-h.x<l.width:h.x-a.x<p.width)&&(h.y<a.y?a.y-h.y<l.height:h.y-a.y<p.height)&&(i.colide(this._sharedState,s),s.colide(this._sharedState,i))}}update(){this._updateTicks++,this.updateState(),this.updateGame(this._sharedState,this._updateTicks),this.updateEntities(),this.updateColissions()}beforeEnd(){this._finishCallback?.(this._sharedState),this._control.onmount()}loop(){for(;this._isActive;)this.update();this.beforeEnd()}setFrameBeforeRenderableLoop(t){this._lastFrameTimeMs=t,requestAnimationFrame(e=>this.renderableLoop(e))}renderableLoop(t){if(!this._isActive)return this.beforeEnd();let e=t-this._lastFrameTimeMs,i=!1;for(;e>=c;)i=!0,this.update(),this._lastFrameTimeMs+=c,e-=c;i&&this.render(),requestAnimationFrame(s=>this.renderableLoop(s))}mount(t){this._ctx=t,this._ctx||this.render()}run(){this._isActive=!0,this._ctx?requestAnimationFrame(t=>this.setFrameBeforeRenderableLoop(t)):this.loop()}stop(){this._isActive=!1}}class _{constructor(t,e,i){this._id=Math.floor(Math.random()*9999).toString(),this._size=t,this._pos=e,this._collisions=i}registerCallbacks(t){this._engineCallbacks=t}destroy(){this._engineCallbacks?.destroyEntity(this._id)}isCollidable(){return this._collisions}getId(){return this._id}getSize(){return this._size}getPos(){return this._pos}}class y{onmount(){}}class f extends y{constructor(){super(),this.handleKeydownEvent=this.handleKeydownEvent.bind(this),this.handleKeyupEvent=this.handleKeyupEvent.bind(this),this._controls={jump:!1}}onmount(){}handleKeyEvent(t,e){t==" "&&(this._controls.jump=e)}handleKeydownEvent(t){this.handleKeyEvent(t.key,!0)}handleKeyupEvent(t){this.handleKeyEvent(t.key,!1)}updateState(t){return t.controls={...this._controls},t}}class o extends _{constructor(t){super({width:20,height:20},t,!0),this.data={velocity:o.JUMP_VEL,position:t.y,jumped:!1}}render(t){t.fillStyle="blue",t.fillRect(this._pos.x,this._pos.y,this._size.width,this._size.height)}static{this.MAX_VEL=10}static{this.JUMP_VEL=-5}update(t,e){this.data.velocity+=.2,this.data.velocity>o.MAX_VEL&&(this.data.velocity=o.MAX_VEL),t.controls.jump&&!this.data.jumped?(this.data.jumped=!0,this.data.velocity=o.JUMP_VEL):t.controls.jump||(this.data.jumped=!1),t.score++,this._pos.y+=this.data.velocity,this._pos.y<-100?this._pos.y=-100:this._pos.y+this._size.height>t.mapSize.height&&(this.destroy(),this._engineCallbacks?.stopEngine()),this.data.position=this._pos.y,t.birdData=this.data}colide(t,e){e instanceof n&&(this.destroy(),this._engineCallbacks?.stopEngine())}}class n extends _{static{this.WIDTH=75}render(t){t.fillStyle="red",t.fillRect(this._pos.x,this._pos.y,this._size.width,this._size.height)}update(t,e){this._pos.x-=d.PIPE_STEP,this._pos.x+n.WIDTH<0&&this.destroy()}colide(t,e){}}class d extends u{constructor(t){const e=new f;super(e,s=>{t(s.score)});const i=new o({x:50,y:200});this.registerEntity(i)}static{this.PIPE_STEP=4}updateGame(t,e){if(t.pipeData.x-=d.PIPE_STEP,t.pipeData.x+n.WIDTH<0){t.pipeData.x=t.mapSize.width+n.WIDTH;const i=100,s=50,h=Math.ceil(Math.random()*(t.mapSize.height-i*2-s*2))+i,l=new n({width:n.WIDTH,height:h-s},{x:t.pipeData.x,y:0},!0),a=new n({width:n.WIDTH,height:t.mapSize.height-h-s},{x:t.pipeData.x,y:h+s},!0);t.pipeData.y=h+s,this.registerEntities([l,a])}}renderMap(t){t.fillStyle="#a3fcff",t.fillRect(0,0,this._sharedState.mapSize.width,this._sharedState.mapSize.height)}getSize(){return this._sharedState.mapSize}initSharedState(){return{score:0,birdData:{velocity:0,position:0,jumped:!1},pipeData:{x:-n.WIDTH,y:0},controls:{jump:!1},mapSize:{width:750,height:750}}}}const g=(r,t)=>new Promise(e=>{const i=new d(s=>{e(s)});if(t){const s=t.getContext("2d");s&&i.mount(s)}i.run()});export{g as default};