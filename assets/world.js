/* The world behind the site: a calm lake at dawn with one soft clay sculpture per page.
   Raw WebGL, no libraries. Every shape is a signed-distance ellipsoid, shaded matte (no gloss).
   Paper sections cover the canvas; hero and sky bands are windows onto it. */
(function () {
  'use strict';
  var canvas = document.getElementById('world');
  if (!canvas) return;
  var root = document.documentElement;
  var reduced = root.classList.contains('reduced');
  var page = document.body.dataset.page || 'home';
  var gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  function giveUp() { root.classList.add('no-world'); canvas.style.display = 'none'; }
  if (!gl) { giveUp(); return; }

  var C = { cream: [1, .975, .93], snow: [.93, .975, 1], mist: [.76, .9, 1], sky: [.58, .82, 1], blue: [.36, .62, .94], peach: [.98, .82, .68], sun: [.98, .9, .55], aqua: [.68, .86, .84] };

  // b(x, y, z, size, [sx, sy, sz], colour, spinY, tiltZ)
  function b(x, y, z, w, s, c, ry, rz) { return { x: x, y: y, z: z, w: w, s: s, c: c, ry: ry || 0, rz: rz || 0 }; }
  var ROUND = [1, 1, 1];

  // breath: 0 = fully out, 1 = fully in. Every sculpture moves on the same slow 10s rhythm.
  var SCENES = {
    home: { h: 3.7, k: .05, make: function (t, br) {
      return [
        b(0, .42, 0, 1.25, [1, .42, .88], C.cream, .3),
        b(.04, 1.26, 0, .95, [1, .42, .86], C.blue, -.5, .05),
        b(-.04, 1.9, 0, .72, [1, .45, .86], C.peach, .9, -.05),
        b(.02, 2.41, 0, .5, [1, .5, .9], C.snow, -.2, .04),
        b(0, 3.08 + .12 * br, 0, .3 + .07 * br, ROUND, C.sun),
        b(Math.cos(t * .16) * 1.9, 1.5 + Math.sin(t * .3) * .16, Math.sin(t * .16) * 1.5, .16, ROUND, C.mist),
        b(-1.75, .16, .7, .42, [1, .5, .85], C.aqua, 1.1)
      ];
    } },
    care: { h: 3.5, k: .3, make: function (t, br) {
      var lean = .2 + .04 * br;
      return [
        b(0, .22, 0, 1.55, [1, .24, .82], C.mist),
        b(-.66, 1.45, 0, 1, [.72, 1.2, .72], C.cream, 0, -lean),
        b(.66, 1.32, 0, .9, [.72, 1.2, .72], C.blue, 0, lean),
        b(0, 3 + .1 * br, 0, .26 + .05 * br, ROUND, C.sun),
        b(1.85, .14, .5, .34, [1, .5, .9], C.peach, .4)
      ];
    } },
    flourish: { h: 3.1, k: .045, make: function (t, br) {
      var list = [b(0, .2, 0, 1.55, [1, .16, 1], C.aqua), b(0, 1.2 + .06 * br, 0, .36 + .05 * br, ROUND, C.sun)];
      var open = .58 + .16 * br;
      for (var i = 0; i < 7; i++) {
        var a = i / 7 * 6.283 + t * .02;
        list.push(b(Math.cos(a) * .66, 1.05, Math.sin(a) * .66, .98, [.42, 1, .24], i % 2 ? C.snow : C.mist, -a, -open));
      }
      return list;
    } },
    initiatives: { h: 3.5, k: .02, make: function (t, br) {
      var list = [b(0, 1.75, 0, .52 + .05 * br, ROUND, C.blue)], i, a;
      for (i = 0; i < 3; i++) {
        a = i / 3 * 6.283 + t * .09;
        list.push(b(Math.cos(a) * 1.12, 1.75 + Math.sin(a) * .36, Math.sin(a) * 1.12, .3, ROUND, C.cream));
      }
      for (i = 0; i < 5; i++) {
        a = i / 5 * 6.283 - t * .06;
        list.push(b(Math.cos(a) * 1.82, 1.75 - Math.sin(a) * .5, Math.sin(a) * 1.82, .17, ROUND, i % 2 ? C.peach : C.sun));
      }
      return list;
    } },
    vision: { h: 3.6, k: .03, make: function (t, br) {
      var list = [];
      for (var i = 0; i < 5; i++) {
        var lift = Math.sin(t * .63 - i * .7) * .05;
        list.push(b(-1.5 + i * .68, .28 + i * .48 + lift, .9 - i * .45, .56, [1, .38, .86], [C.cream, C.mist, C.sky, C.blue, C.peach][i], i * .9));
      }
      list.push(b(1.5, 3.05 + .08 * br, -1.1, .42 + .07 * br, ROUND, C.sun));
      return list;
    } },
    about: { h: 3.4, k: .02, make: function (t, br) {
      var list = [b(0, 1.75, 0, .66 + .05 * br, ROUND, C.cream)];
      var units = [C.blue, C.peach, C.sky, C.sun, C.aqua];
      for (var i = 0; i < 5; i++) {
        var a = i / 5 * 6.283 + t * .11;
        list.push(b(Math.cos(a) * 1.6, 1.75 + Math.sin(a) * .5, Math.sin(a) * 1.6, .28, ROUND, units[i]));
      }
      return list;
    } },
    report: { h: 3, k: .015, make: function (t, br) {
      var list = [], tones = [C.blue, C.sky, C.mist, C.snow, C.cream];
      for (var i = 0; i < 5; i++) {
        list.push(b(0, .3 + i * .42 + (i * .025 * br), 0, 1.3 - i * .06, [1, .13, .74], tones[i], i * .16 - .3 + Math.sin(t * .2 + i) * .03));
      }
      list.push(b(.1, 2.6 + .08 * br, 0, .24 + .05 * br, ROUND, C.sun));
      return list;
    } },
    help: { h: 3.1, k: .08, make: function (t, br) {
      return [
        b(0, .36, 0, 1.2, [1, .34, .86], C.cream),
        b(0, 1.46 + .04 * br, 0, .72 + .03 * br, ROUND, C.sun),
        b(1.45, .14, .5, .3, [1, .5, .9], C.mist)
      ];
    } }
  };
  var scene = SCENES[page] || SCENES.home;
  var N = scene.make(0, 0).length;

  var small = innerWidth < 1100;
  var STEPS = small ? 30 : 44;

  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
    'precision highp float;',
    '#define N ' + N, '#define STEPS ' + STEPS,
    'uniform vec2 uRes,uC,uBase,uSun;uniform float uT,uF,uK,uRing,uRefl;uniform vec3 uCam;',
    'uniform vec4 uP[N];uniform vec3 uS[N];uniform vec3 uCol[N];uniform mat3 uR[N];',
    'const vec3 L=vec3(-.46,.74,.5);',
    'float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}',
    'float map(vec3 p){float d=1e3;for(int i=0;i<N;i++){vec3 q=(p-uP[i].xyz)*uR[i];vec3 r=uS[i]*uP[i].w;float k0=length(q/r),k1=length(q/(r*r));float e=k0*(k0-1.)/max(k1,1e-4);d=i==0?e:smin(d,e,uK);}return d;}',
    'vec3 albedo(vec3 p){vec3 c=vec3(0.);float s=1e-4;for(int i=0;i<N;i++){vec3 q=(p-uP[i].xyz)*uR[i];vec3 r=uS[i]*uP[i].w;float k0=length(q/r),k1=length(q/(r*r));float e=k0*(k0-1.)/max(k1,1e-4);float w=exp(-22.*max(e+.03,0.));c+=uCol[i]*w;s+=w;}return c/s;}',
    'bool bounds(vec3 ro,vec3 rd,out float a,out float b){a=1e5;b=-1.;for(int i=0;i<N;i++){vec3 oc=ro-uP[i].xyz;float R=max(max(uS[i].x,uS[i].y),uS[i].z)*uP[i].w+.22;float B=dot(oc,rd),h=B*B-dot(oc,oc)+R*R;if(h>0.){h=sqrt(h);a=min(a,-B-h);b=max(b,-B+h);}}a=max(a,0.);return b>a;}',
    'float gM,gTm;',
    'float march(vec3 ro,vec3 rd,float a,float b){float t=a;gM=1e3;gTm=a;for(int i=0;i<STEPS;i++){float d=map(ro+rd*t);if(d<.0016*t)return t;float m=d/t;if(m<gM){gM=m;gTm=t;}t+=d*.92;if(t>b)break;}return -1.;}',
    'float marchR(vec3 ro,vec3 rd,float a,float b){float t=a;for(int i=0;i<18;i++){float d=map(ro+rd*t);if(d<.012)return t;t+=d;if(t>b)break;}return -1.;}',
    'vec3 nrm(vec3 p){vec2 e=vec2(.004,-.004);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}',
    'float shadow(vec3 p){float t=.07,s=1.;for(int i=0;i<12;i++){float d=map(p+L*t);s=min(s,3.2*d/t);t+=clamp(d,.06,.35);if(s<.01||t>4.)break;}s=clamp(s,0.,1.);return s*s*(3.-2.*s);}',
    'float ao(vec3 p,vec3 n){float o=0.,w=1.;for(int i=1;i<4;i++){float h=float(i)*.16;o+=w*(h-map(p+n*h));w*=.55;}return clamp(1.-1.2*o,0.,1.);}',
    // matte clay: shadows stay pale and lean blue, lit sides sit just above the pigment
    'vec3 clay(vec3 p,vec3 n,vec3 rd){vec3 a=albedo(p);float wrap=smoothstep(-.35,1.,dot(n,L));float sh=shadow(p);float occ=ao(p,n);',
    'vec3 lit=mix(vec3(.75,.83,.96),vec3(1.05,1.03,.99),wrap*(.62+.38*sh));vec3 c=a*lit;c=mix(c*vec3(.86,.92,1.),c,mix(.3,1.,occ));',
    'c+=vec3(.55,.8,1.)*max(-n.y,0.)*.1;c+=vec3(.86,.95,1.)*pow(1.+dot(n,rd),3.)*.16;return c;}',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453);}',
    'float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){return .55*vnoise(p)+.3*vnoise(p*2.1+3.1)+.15*vnoise(p*4.3+7.7);}',
    'vec3 sky(vec3 d,float disc){vec2 q=d.xy/max(-d.z,.05)*uF;float e=q.y;',
    'vec3 c=mix(vec3(.91,.975,1.),vec3(.71,.894,.996),smoothstep(0.,.4,e));c=mix(c,vec3(.53,.84,1.),smoothstep(.3,1.4,e));',
    'float f=fbm(vec2(q.x*1.2+uT*.012,q.y*4.6));c=mix(c,vec3(1.),smoothstep(.5,.86,f)*smoothstep(.02,.2,e)*(1.-smoothstep(.7,1.3,e))*.72);',
    'float s=length(q-uSun);c+=vec3(.2,.15,.02)*exp(-s*s*7.);c=mix(c,vec3(1.,.95,.74),smoothstep(.15,.138,s)*.9*disc);return c;}',
    'float wh(vec2 p,float fade){float d=length(p-uBase);return fade*(sin(p.x*2.1+p.y*1.3+uT*.5)*.011+sin(-p.x*1.7+p.y*3.1+uT*.4)*.008+sin(p.x*5.3-p.y*4.1+uT*.7)*.0035)+sin(d*6.5-uT*.95)*.011*exp(-d*.5)*uRing;}',
    'void main(){vec2 uv=(gl_FragCoord.xy*2.-uRes)/uRes.y;vec2 p=uv-uC;vec3 ro=uCam;vec3 rd=normalize(vec3(p,-uF));vec3 col=sky(rd,1.);',
    'float tw=rd.y<0.?-ro.y/rd.y:1e5;float a,b;bool any=bounds(ro,rd,a,b);float t=-1.;if(any)t=march(ro,rd,a,min(b,tw));',
    'float px=3.2/(uRes.y*uF);float cover=(any&&t<0.&&gM<px)?1.-gM/px:0.;float tc=gTm;',
    'if(t>0.){vec3 h=ro+rd*t;col=clay(h,nrm(h),rd);}',
    'else if(tw<1e4){vec3 h=ro+rd*tw;float fade=1./(1.+tw*.05);float e=.04;float h0=wh(h.xz,fade);vec3 n=normalize(vec3(-(wh(h.xz+vec2(e,0.),fade)-h0)/e,1.,-(wh(h.xz+vec2(0.,e),fade)-h0)/e));',
    'vec3 r=reflect(rd,n);vec3 c=sky(r,0.);float fr=.42+.58*pow(1.-max(dot(-rd,n),0.),3.);col=mix(vec3(.66,.87,.98),c,fr);',
    'float ra,rb;if(bounds(h+vec3(0.,.01,0.),r,ra,rb)){float rt=marchR(h+vec3(0.,.01,0.),r,ra,rb);if(rt>0.){vec3 q=h+r*rt;col=mix(col,albedo(q)*vec3(.86,.92,1.),uRefl*exp(-rt*.16));}}',
    'float near=map(h);col*=mix(.9,1.,smoothstep(0.,.75,near));col=mix(col,vec3(.91,.975,1.),smoothstep(10.,60.,tw));}',
    'if(cover>0.){vec3 h=ro+rd*tc;col=mix(col,clay(h,nrm(h),rd),cover);}',
    'col+=(hash(gl_FragCoord.xy+fract(uT))-.5)/200.;gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { giveUp(); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { giveUp(); return; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.bindAttribLocation(prog, 0, 'a');
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ['uRes', 'uC', 'uBase', 'uSun', 'uRefl', 'uT', 'uF', 'uK', 'uRing', 'uCam', 'uP', 'uS', 'uCol', 'uR'].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n) || gl.getUniformLocation(prog, n + '[0]');
  });
  gl.uniform1f(U.uK, scene.k);
  var aP = new Float32Array(N * 4), aS = new Float32Array(N * 3), aC = new Float32Array(N * 3), aR = new Float32Array(N * 9);

  /* ---- layout: line the sculpture up with the hero's own box ---- */
  var CAM_Y = .9, CAM_Z = 8.5, scale = small ? .5 : .62, vw = 1, vh = 1, aspect = 1;
  var layout = { f: 3, cx: 0, cy: 0, heroH: 600, hide: false };
  var hero = document.querySelector('.hero, .page-hero');

  function measure() {
    vw = canvas.clientWidth || innerWidth; vh = canvas.clientHeight || innerHeight; aspect = vw / vh;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = Math.max(2, Math.round(vw * dpr * scale)), H = Math.max(2, Math.round(vh * dpr * scale));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H); }
    gl.uniform2f(U.uRes, W, H);
    if (!hero) return;
    small = innerWidth < 1100;
    var r = hero.getBoundingClientRect(), top = r.top + scrollY, h = r.height, baseY, px, centerX;
    if (small) {
      var inner = hero.querySelector('.hero-inner');
      var pad = inner ? parseFloat(getComputedStyle(inner).paddingTop) : 200;
      baseY = top + pad - 4; px = (pad * .84) / scene.h; centerX = vw * .5;
      layout.hide = page === 'help';
    } else {
      baseY = Math.min(top + h - Math.max(70, h * .13), vh * .94);
      px = (baseY - top - 24) * .94 / scene.h; centerX = vw * .675;
      layout.hide = false;
    }
    // px per world unit at z=0 gives the focal length; the camera axis is placed so y=0 lands on baseY
    layout.f = px * CAM_Z * 2 / vh;
    layout.cx = (centerX / vw * 2 - 1) * aspect;
    var baseUv = 1 - baseY / vh * 2;
    layout.cy = baseUv + CAM_Y * layout.f / CAM_Z;
    layout.heroH = top + h;
  }

  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function breath(t) { var c = (t % 10) / 10; return c < .45 ? ease(c / .45) : c < .55 ? 1 : 1 - ease((c - .55) / .45); }

  var mx = 0, my = 0, tx = 0, ty = 0, sm = scrollY;
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  }

  function draw(t) {
    sm += (scrollY - sm) * (reduced ? 1 : .09);
    mx += (tx - mx) * .04; my += (ty - my) * .04;
    var br = reduced ? .5 : breath(t);
    var out = layout.hide ? 1 : ease(sm / (layout.heroH * .85));
    var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    var s = sm / max;
    var fDrift = small ? 1.9 : 2.5;
    var f = layout.f + (fDrift - layout.f) * out;
    var horizon = small ? -.5 : -.76;
    var cy = layout.cy + (horizon - layout.cy) * out, cx = layout.cx * (1 - out);
    var wideW = aspect / fDrift * CAM_Z * .92;
    var rise = (reduced || page === 'help') ? 1 : ease((t - .15) / 2.4);
    var list = scene.make(reduced ? 3 : t, br);
    for (var i = 0; i < N; i++) {
      var o = list[i], y = o.y - (1 - rise) * (o.y + o.w * 1.6 + .4);
      var k = 1 - .4 * out;
      var dx = wideW * Math.sin(i * 2.4 + 1 + s * 2.2), dy = 1.5 + 1.45 * Math.sin(i * 1.7 + s * 3.1) * .5 + .08 * Math.sin(t * .4 + i), dz = -1.4 * (i % 3);
      var cy0 = Math.cos(o.ry + out * s * 3), sy0 = Math.sin(o.ry + out * s * 3), cz = Math.cos(o.rz), sz = Math.sin(o.rz);
      aP[i * 4] = o.x + (dx - o.x) * out; aP[i * 4 + 1] = y + (dy - y) * out; aP[i * 4 + 2] = o.z + (dz - o.z) * out; aP[i * 4 + 3] = o.w * k;
      aS[i * 3] = o.s[0]; aS[i * 3 + 1] = o.s[1]; aS[i * 3 + 2] = o.s[2];
      aC[i * 3] = o.c[0]; aC[i * 3 + 1] = o.c[1]; aC[i * 3 + 2] = o.c[2];
      aR.set([cy0 * cz, sz, -sy0 * cz, -cy0 * sz, cz, sy0 * sz, sy0, 0, cy0], i * 9);
    }
    gl.uniform4fv(U.uP, aP); gl.uniform3fv(U.uS, aS); gl.uniform3fv(U.uCol, aC); gl.uniformMatrix3fv(U.uR, false, aR);
    gl.uniform1f(U.uT, t); gl.uniform1f(U.uF, f); gl.uniform2f(U.uC, cx, cy);
    var sx0 = small ? .24 : -.62, sx1 = aspect * (small ? .42 : .74);
    gl.uniform2f(U.uSun, sx0 + (sx1 - sx0) * out, .66 + .24 * out);
    gl.uniform1f(U.uRefl, small ? .2 : .6);
    gl.uniform2f(U.uBase, list[0].x, list[0].z); gl.uniform1f(U.uRing, (1 - out) * rise);
    gl.uniform3f(U.uCam, mx * .3, CAM_Y - my * .1, CAM_Z);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ---- loop: 30fps is plenty for slow motion; stops whenever no window onto the lake is visible ---- */
  measure();
  var visible = 0, running = false, last = 0, slow = 0, seen = 0, t0 = performance.now();
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    var dt = now - last;
    if (dt < 30) return;
    last = now;
    if (dt < 2000) { seen++; if (dt > 44) slow++; }
    if (seen >= 24) {
      if (slow > 12 && scale > .3) { scale = Math.max(.3, scale * .8); measure(); }
      seen = 0; slow = 0;
    }
    draw((now - t0) / 1000);
  }
  function setRunning() {
    var go = !reduced && !document.hidden && visible > 0;
    if (go && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
    else if (!go) running = false;
  }

  var windows = [].slice.call(document.querySelectorAll('.hero, .page-hero, .band.navy, .jump'));
  if (reduced) { draw(3); }
  else if ('IntersectionObserver' in window && windows.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible += e.isIntersecting ? 1 : (e.target.__on ? -1 : 0); e.target.__on = e.isIntersecting; });
      setRunning();
    });
    windows.forEach(function (w) { io.observe(w); });
    document.addEventListener('visibilitychange', setRunning);
  } else { visible = 1; setRunning(); }

  var lastW = innerWidth, rt;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      // phone address bars change the height while scrolling; only a real width change needs a new layout
      if (innerWidth === lastW && small) return;
      lastW = innerWidth; measure(); if (reduced) draw(3);
    }, 160);
  });
  addEventListener('load', function () { measure(); if (reduced) draw(3); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); if (reduced) draw(3); });
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); running = false; giveUp(); });
})();
