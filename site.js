// ---- theme toggle ----
function toggleTheme(){
  const html=document.documentElement;
  const isLight=html.getAttribute('data-theme')==='light';
  html.setAttribute('data-theme', isLight?'dark':'light');
  const knob=document.getElementById('theme-knob');
  if(knob) knob.textContent = isLight ? '🌙' : '☀️';
  try{ localStorage.setItem('kc-theme', isLight?'dark':'light'); }catch(e){}
}
(function initTheme(){
  let saved='dark';
  try{ saved = localStorage.getItem('kc-theme') || 'dark'; }catch(e){}
  document.documentElement.setAttribute('data-theme', saved);
  document.addEventListener('DOMContentLoaded', ()=>{
    const knob=document.getElementById('theme-knob');
    if(knob) knob.textContent = saved==='light' ? '☀️' : '🌙';
  });
})();

// ---- nav popup dropdown (never fullscreen) ----
function toggleMenu(e){
  e.stopPropagation();
  const pop=document.getElementById('nav-pop');
  const dd=document.getElementById('menu-dropdown');
  pop.classList.toggle('open');
  dd.classList.toggle('open');
}
document.addEventListener('click', (e)=>{
  const pop=document.getElementById('nav-pop');
  const dd=document.getElementById('menu-dropdown');
  if(!pop||!dd) return;
  if(!pop.contains(e.target) && !dd.contains(e.target)){
    pop.classList.remove('open');
    dd.classList.remove('open');
  }
});

// ---- scroll rail + nav shadow ----
window.addEventListener('scroll', ()=>{
  const h=document.documentElement;
  const railFill=document.getElementById('rail-fill');
  const railCar=document.getElementById('rail-car');
  const navPop=document.getElementById('nav-pop');
  const max=(h.scrollHeight-h.clientHeight)||1;
  const pct=(h.scrollTop/max)*100;
  if(railFill) railFill.style.height=pct+'%';
  if(railCar) railCar.style.top=pct+'%';
  if(navPop) navPop.classList.toggle('scrolled', h.scrollTop>40);
});

// ---- reveal on scroll ----
document.addEventListener('DOMContentLoaded', ()=>{
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
});

// ---- music widget ----
// NOTE: I can't embed a specific artist's copyrighted track (e.g. a Metro Boomin-style
// commercial beat) directly into your site. Point this at a royalty-free trap-flute /
// flute-loop mp3 you've downloaded (Pixabay Music, Uppbeat, or Freesound all have free
// flute/trap-flute loops) and save it as assets/theme-music.mp3.
function toggleMusic(){
  const audio=document.getElementById('bg-audio');
  const widget=document.getElementById('music-widget');
  const btn=document.getElementById('music-btn');
  if(!audio) return;
  if(audio.paused){
    audio.play().catch(()=>{ alert('Add your mp3 as assets/theme-music.mp3 to enable music.'); });
    widget.classList.add('playing'); btn.textContent='❚❚';
  } else {
    audio.pause();
    widget.classList.remove('playing'); btn.textContent='▶';
  }
}

// ---- dot-matrix animated portrait (renders an actual photo as lime dots) ----
function initPortrait(canvasId, imgSrc){
  const canvas=document.getElementById(canvasId);
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const img=new Image();
  let cells=[];
  const cols=52;
  let rows=60;

  function build(){
    const box=canvas.parentElement.getBoundingClientRect();
    canvas.width=box.width; canvas.height=box.height;
    rows=Math.max(20,Math.round(cols*(canvas.height/canvas.width)));
    const off=document.createElement('canvas');
    off.width=cols; off.height=rows;
    const octx=off.getContext('2d');
    const scale=Math.max(cols/img.width, rows/img.height);
    const sw=img.width*scale, sh=img.height*scale;
    octx.drawImage(img,(cols-sw)/2,(rows-sh)/2,sw,sh);
    const data=octx.getImageData(0,0,cols,rows).data;
    cells=[];
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const i=(y*cols+x)*4;
        const bright=(data[i]+data[i+1]+data[i+2])/3/255;
        cells.push({x:(x+0.5)/cols, y:(y+0.5)/rows, b:bright, phase:Math.random()*Math.PI*2});
      }
    }
  }
  img.onload=build;
  img.onerror=()=>{ /* fall back to ambient dots if photo missing */
    cells=Array.from({length:900},()=>({x:Math.random(),y:Math.random(),b:Math.random(),phase:Math.random()*Math.PI*2}));
  };
  img.src=imgSrc;
  window.addEventListener('resize', build);

  function render(t){
    if(cells.length){
      ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      const w=canvas.width,h=canvas.height;
      for(const c of cells){
        const flick=0.85+0.15*Math.sin(t*0.0012+c.phase);
        const dark=1-c.b;
        if(dark<0.10) continue;
        const r=Math.min(2.6, dark*3.4)*flick;
        ctx.beginPath();
        ctx.fillStyle=`rgba(200,255,77,${Math.min(1,dark*1.25*flick)})`;
        ctx.shadowColor='rgba(200,255,77,0.9)';
        ctx.shadowBlur=4;
        ctx.arc(c.x*w, c.y*h, r, 0, Math.PI*2);
        ctx.fill();
      }
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
