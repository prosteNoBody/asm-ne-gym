import{C as c,a as y,b as p}from"./Control-BNrD7OlY.js";class u extends y{constructor(){super(),this.handleKeydownEvent=this.handleKeydownEvent.bind(this),this.handleKeyupEvent=this.handleKeyupEvent.bind(this),this._controls={jump:!1}}handleKeyEvent(t,i){t==" "&&(this._controls.jump=i)}handleKeydownEvent(t){this.handleKeyEvent(t.key,!0)}handleKeyupEvent(t){this.handleKeyEvent(t.key,!1)}updateState(t){return t.controls={...this._controls},t}}class o extends p{constructor(t){super({width:20,height:20},t,!0),this.data={velocity:o.JUMP_VEL,position:t.y,jumped:!1}}render(t){t.fillStyle="blue",t.fillRect(this._pos.x,this._pos.y,this._size.width,this._size.height)}static{this.MAX_VEL=10}static{this.JUMP_VEL=-5}update(t,i){this.data.velocity+=.2,this.data.velocity>o.MAX_VEL&&(this.data.velocity=o.MAX_VEL),t.controls.jump&&!this.data.jumped?(this.data.jumped=!0,this.data.velocity=o.JUMP_VEL):t.controls.jump||(this.data.jumped=!1),t.score++,this._pos.y+=this.data.velocity,this._pos.y<-100?this._pos.y=-100:this._pos.y+this._size.height>t.mapSize.height&&(this.destroy(),this._engineCallbacks?.stopEngine()),this.data.position=this._pos.y,t.birdData=this.data}colide(t,i){i instanceof s&&(this.destroy(),this._engineCallbacks?.stopEngine())}}class s extends p{static{this.WIDTH=75}render(t){t.fillStyle="red",t.fillRect(this._pos.x,this._pos.y,this._size.width,this._size.height)}update(t,i){this._pos.x-=n.PIPE_STEP,this._pos.x+s.WIDTH<0&&this.destroy()}colide(t,i){}}class n extends c{constructor(t){const i=new u;super(i,e=>{t(e.score)});const h=new o({x:50,y:200});this.registerEntity(h)}static{this.PIPE_STEP=4}updateGame(t,i){if(t.pipeData.x-=n.PIPE_STEP,t.pipeData.x+s.WIDTH<0){t.pipeData.x=t.mapSize.width+s.WIDTH;const h=100,e=50,a=Math.ceil(Math.random()*(t.mapSize.height-h*2-e*2))+h,d=new s({width:s.WIDTH,height:a-e},{x:t.pipeData.x,y:0},!0),r=new s({width:s.WIDTH,height:t.mapSize.height-a-e},{x:t.pipeData.x,y:a+e},!0);t.pipeData.y=a+e,this.registerEntities([d,r])}}renderMap(t){t.fillStyle="#a3fcff",t.fillRect(0,0,this._sharedState.mapSize.width,this._sharedState.mapSize.height)}getSize(){return this._sharedState.mapSize}initSharedState(){return{score:0,birdData:{velocity:0,position:0,jumped:!1},pipeData:{x:-s.WIDTH,y:0},controls:{jump:!1},mapSize:{width:750,height:750}}}}const f=(l,t)=>new Promise(i=>{const h=new n(e=>{i(e)});if(t){const e=h.getSize();t.width=e.width,t.height=e.height;const a=t.getContext("2d");a&&h.mount(a)}h.run()});export{f as default};
