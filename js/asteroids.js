(function(){
  const WAVE_DURATION = 60;
  const WAVE_COUNT    = 3;

  const overlay    = document.getElementById('ast-overlay');
  const canvas     = document.getElementById('ast-canvas');
  const ctx        = canvas.getContext('2d');
  const scoreEl    = document.getElementById('ast-score-val');
  const waveEl     = document.getElementById('ast-wave-val');
  const timerEl    = document.getElementById('ast-wavetimer-val');
  const livesEl    = document.getElementById('ast-lives-val');
  const healthBar  = document.getElementById('ast-healthbar');
  const endBox     = document.getElementById('ast-end');
  const endText    = document.getElementById('ast-end-text');
  const endScore   = document.getElementById('ast-end-score');
  const hud        = document.getElementById('ast-hud');
  const controls   = document.getElementById('ast-controls');
  const hwrap      = document.getElementById('ast-healthbar-wrap');
  const banner     = document.getElementById('ast-wave-banner');
  const bannerText = document.getElementById('ast-wave-banner-text');
  const bannerSub  = document.getElementById('ast-wave-sub');
  const logo       = document.querySelector('.logo-wrap');

  let W, H, ship, bullets, asteroids, particles, popups, score, lives, wave;
  let gameOver, won, raf, invincible, health, maxHealth;
  let waveEndTime, inWavePause;
  let keys = {}, shootCooldown = 0;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function makeShip(x, y) {
    return { x, y, vx:0, vy:0, angle:-Math.PI/2, dead:false, respawnTimer:0 };
  }

  function shipPoints(s, scale=1) {
    const pts = [[22*scale,0],[-14*scale,13*scale],[-7*scale,0],[-14*scale,-13*scale]];
    return pts.map(([px,py]) => {
      const rx = px*Math.cos(s.angle)-py*Math.sin(s.angle);
      const ry = px*Math.sin(s.angle)+py*Math.cos(s.angle);
      return [s.x+rx, s.y+ry];
    });
  }

  function makeAsteroid(x, y, size, waveNum) {
    const sides = 7+Math.floor(Math.random()*4);
    const pts = [];
    for(let i=0;i<sides;i++){
      const a=(i/sides)*Math.PI*2, r=size*(0.75+Math.random()*0.45);
      pts.push([Math.cos(a)*r, Math.sin(a)*r]);
    }
    const speedMult = 1 + (waveNum-1)*0.45;
    const base = (0.6+Math.random()*1.2)*(size<25?1.8:size<45?1.3:0.9);
    const speed = base*speedMult;
    const angle = Math.random()*Math.PI*2;
    const pts_val = size>40?20:size>22?50:100;
    return { x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
             spin:(Math.random()-.5)*0.04, rot:0, size, pts, pts_val };
  }

  function spawnWave(n, waveNum) {
    asteroids = [];
    const count = n+(waveNum-1)*2;
    for(let i=0;i<count;i++){
      let x,y;
      do { x=Math.random()*W; y=Math.random()*H; }
      while(Math.hypot(x-W/2,y-H/2)<160);
      asteroids.push(makeAsteroid(x,y,55+Math.random()*20,waveNum));
    }
  }

  function burst(x, y, color, n=8) {
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, spd=1+Math.random()*3;
      particles.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:1,decay:0.02+Math.random()*0.03,color});
    }
  }

  function popup(x, y, pts) { popups.push({x,y,text:'+'+pts,life:1,vy:-1.2}); }

  function updateHealth() {
    const pct = Math.max(0,health/maxHealth*100);
    healthBar.style.width = pct+'%';
    healthBar.style.background = pct>60?'#E13422':pct>30?'#DDBE47':'#fff';
  }

  function showBanner(title, sub, cb) {
    inWavePause=true;
    banner.style.display='flex';
    bannerText.textContent=title; bannerSub.textContent=sub;
    requestAnimationFrame(()=>{ bannerText.style.opacity='1'; bannerSub.style.opacity='1'; });
    setTimeout(()=>{
      bannerText.style.opacity='0'; bannerSub.style.opacity='0';
      setTimeout(()=>{ banner.style.display='none'; inWavePause=false; if(cb) cb(); },400);
    },1800);
  }

  function startWave(n) {
    wave=n; waveEl.textContent=n;
    waveEndTime=performance.now()+WAVE_DURATION*1000;
    timerEl.textContent='1:00'; timerEl.style.color='rgba(255,255,255,0.5)';
    spawnWave(4,n);
  }

  function init() {
    resize();
    ship=makeShip(W/2,H/2); bullets=[]; particles=[]; popups=[];
    score=0; lives=3; gameOver=false; won=false; invincible=0;
    health=maxHealth=100; inWavePause=false;
    scoreEl.textContent='0'; livesEl.textContent='3';
    updateHealth();
    hud.style.display='flex'; controls.style.display='block';
    hwrap.style.display='block'; endBox.style.display='none'; banner.style.display='none';
    if(raf) cancelAnimationFrame(raf);
    showBanner('WAVE 1','SURVIVE 60 SECONDS',()=>{ startWave(1); raf=requestAnimationFrame(loop); });
  }

  function shoot() {
    if(ship.dead||gameOver||inWavePause) return;
    bullets.push({
      x:ship.x+Math.cos(ship.angle)*24, y:ship.y+Math.sin(ship.angle)*24,
      vx:Math.cos(ship.angle)*9+ship.vx*0.3, vy:Math.sin(ship.angle)*9+ship.vy*0.3, life:55
    });
  }

  function wrap(o) {
    if(o.x<-80)o.x=W+80; if(o.x>W+80)o.x=-80;
    if(o.y<-80)o.y=H+80; if(o.y>H+80)o.y=-80;
  }

  function drawGrid() {
    ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=0.5;
    for(let x=0;x<W;x+=72){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=72){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }

  function drawShip() {
    if(ship.dead) return;
    if(invincible>0&&Math.floor(invincible*8)%2===0) return;
    const pts=shipPoints(ship);
    ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
    ctx.closePath(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fill();
    ctx.save(); ctx.translate(ship.x,ship.y); ctx.rotate(ship.angle);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold 9px Helvetica Neue';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('DX',2,0); ctx.restore();
    if(keys['ArrowUp']||keys['w']){
      ctx.beginPath();
      ctx.moveTo(ship.x+Math.cos(ship.angle+Math.PI)*14,ship.y+Math.sin(ship.angle+Math.PI)*14);
      ctx.lineTo(ship.x+Math.cos(ship.angle+Math.PI)*(22+Math.random()*12),ship.y+Math.sin(ship.angle+Math.PI)*(22+Math.random()*12));
      ctx.strokeStyle=`rgba(225,52,34,${0.6+Math.random()*0.4})`; ctx.lineWidth=2.5; ctx.stroke();
    }
  }

  function drawAsteroid(a) {
    ctx.save(); ctx.translate(a.x,a.y); ctx.rotate(a.rot);
    ctx.beginPath(); ctx.moveTo(a.pts[0][0],a.pts[0][1]);
    for(let i=1;i<a.pts.length;i++) ctx.lineTo(a.pts[i][0],a.pts[i][1]);
    ctx.closePath(); ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fill(); ctx.restore();
  }

  function endGame(didWin) {
    gameOver=true; won=didWin; cancelAnimationFrame(raf);
    hud.style.display='none'; controls.style.display='none';
    hwrap.style.display='none'; banner.style.display='none';
    endBox.style.display='flex';
    endScore.textContent='final score — '+score;
    endText.textContent=didWin?'You stayed. That was the whole test.':'The room doesn\u2019t wait. Neither should you.';
  }

  function loop() {
    if(gameOver) return;
    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
    drawGrid();
    if(inWavePause){ raf=requestAnimationFrame(loop); return; }

    const remaining=Math.max(0,(waveEndTime-performance.now())/1000);
    const secs=Math.ceil(remaining);
    const m=Math.floor(secs/60), s=(secs%60).toString().padStart(2,'0');
    timerEl.textContent=m+':'+s;
    timerEl.style.color=remaining<=10?'#E13422':'rgba(255,255,255,0.5)';

    if(remaining<=0){
      if(wave>=WAVE_COUNT){ endGame(true); return; }
      const next=wave+1;
      const subs=['PICKING UP THE PACE','FINAL WAVE — GOOD LUCK'];
      showBanner('WAVE '+next,subs[next-2],()=>startWave(next));
      raf=requestAnimationFrame(loop); return;
    }

    if(!ship.dead){
      if(keys['ArrowLeft']||keys['a'])  ship.angle-=0.055;
      if(keys['ArrowRight']||keys['d']) ship.angle+=0.055;
      if(keys['ArrowUp']||keys['w'])    { ship.vx+=Math.cos(ship.angle)*0.22; ship.vy+=Math.sin(ship.angle)*0.22; }
      if(keys['ArrowDown']||keys['s'])  { ship.vx-=Math.cos(ship.angle)*0.18; ship.vy-=Math.sin(ship.angle)*0.18; }
      ship.vx*=0.988; ship.vy*=0.988;
      ship.x+=ship.vx; ship.y+=ship.vy; wrap(ship);
      if(invincible>0) invincible-=1/60;
    } else {
      ship.respawnTimer--;
      if(ship.respawnTimer<=0){ ship=makeShip(W/2,H/2); invincible=3; }
    }

    for(let i=bullets.length-1;i>=0;i--){
      const b=bullets[i]; b.x+=b.vx; b.y+=b.vy; b.life--; wrap(b);
      if(b.life<=0){bullets.splice(i,1);continue;}
      ctx.beginPath(); ctx.arc(b.x,b.y,2.5,0,Math.PI*2);
      ctx.fillStyle='#E13422'; ctx.fill();
    }

    for(let i=asteroids.length-1;i>=0;i--){
      const a=asteroids[i]; a.x+=a.vx; a.y+=a.vy; a.rot+=a.spin; wrap(a); drawAsteroid(a);
      for(let j=bullets.length-1;j>=0;j--){
        const b=bullets[j];
        if(Math.hypot(b.x-a.x,b.y-a.y)<a.size*0.85){
          bullets.splice(j,1); burst(a.x,a.y,'rgba(255,255,255,0.6)',10);
          popup(a.x,a.y,a.pts_val); score+=a.pts_val; scoreEl.textContent=score;
          const newSize=a.size>40?28:a.size>22?18:0;
          if(newSize>0){
            for(let k=0;k<2;k++)
              asteroids.push(makeAsteroid(a.x+(Math.random()-.5)*30,a.y+(Math.random()-.5)*30,newSize,wave));
          }
          asteroids.splice(i,1); break;
        }
      }
      if(!ship.dead&&invincible<=0&&asteroids[i]){
        if(Math.hypot(ship.x-a.x,ship.y-a.y)<a.size*0.7){
          burst(ship.x,ship.y,'rgba(225,52,34,0.8)',16);
          health-=34; updateHealth();
          if(health<=0){
            lives--; livesEl.textContent=Math.max(0,lives);
            if(lives<=0){endGame(false);return;}
            health=maxHealth; updateHealth();
            ship.dead=true; ship.respawnTimer=120;
          } else { invincible=1.5; }
        }
      }
    }

    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vx*=0.96; p.vy*=0.96; p.life-=p.decay;
      if(p.life<=0){particles.splice(i,1);continue;}
      ctx.globalAlpha=p.life; ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.fill(); ctx.globalAlpha=1;
    }

    for(let i=popups.length-1;i>=0;i--){
      const p=popups[i]; p.y+=p.vy; p.life-=0.025;
      if(p.life<=0){popups.splice(i,1);continue;}
      ctx.globalAlpha=p.life; ctx.font='bold 13px Helvetica Neue';
      ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(p.text,p.x,p.y); ctx.globalAlpha=1;
    }

    drawShip();
    raf=requestAnimationFrame(loop);
  }

  document.addEventListener('keydown', e=>{
    keys[e.key]=true;
    if(overlay.style.display==='none') return;
    if(e.key==='Escape'){closeGame();return;}
    if(e.key===' '){e.preventDefault();if(!gameOver&&shootCooldown<=0){shoot();shootCooldown=12;}}
  });
  document.addEventListener('keyup', e=>{ keys[e.key]=false; });
  setInterval(()=>{ if(shootCooldown>0) shootCooldown--; },16);

  // Double-click + double-tap trigger
  let lastTap = 0;
  logo.addEventListener('touchend', (e)=>{
    const now=Date.now();
    if(now-lastTap<400&&lastTap>0){ e.preventDefault(); openGame(); lastTap=0; }
    else { lastTap=now; }
  });
  logo.addEventListener('dblclick', (e)=>{ e.preventDefault(); openGame(); });

  function openGame(){ overlay.style.display='flex'; init(); }
  function closeGame(){ overlay.style.display='none'; if(raf) cancelAnimationFrame(raf); keys={}; }

  endBox.addEventListener('click', closeGame);
  window.addEventListener('resize',()=>{ if(overlay.style.display!=='none') resize(); });
})();
