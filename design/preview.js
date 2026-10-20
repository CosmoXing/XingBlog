(function () {
  var root = document.documentElement;

  // theme
  var saved = null;
  try { saved = localStorage.getItem('cx-theme'); } catch (e) {}
  if (saved) root.dataset.theme = saved;
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('cx-theme', next); } catch (e) {}
    });
  }

  // nav scrolled
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 14);
    var bar = document.getElementById('progress');
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // stars
  var canvas = document.getElementById('stars');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), stars = [];
    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round((w * h) / 17000);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.15 + 0.25,
          a: Math.random() * 0.55 + 0.18,
          s: Math.random() * 0.0009 + 0.0002,
          p: Math.random() * Math.PI * 2
        });
      }
    }
    var shooting = null, nextShot = performance.now() + 7000;
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = s.a + Math.sin(t * s.s + s.p) * 0.15;
        if (alpha < 0.05) alpha = 0.05;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(206,233,255,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
      if (!shooting && t > nextShot) {
        shooting = { x: Math.random() * w * 0.55 + w * 0.25, y: Math.random() * h * 0.3, len: 0, v: 5 + Math.random() * 3 };
        nextShot = t + 14000 + Math.random() * 14000;
      }
      if (shooting) {
        shooting.len += shooting.v;
        var x = shooting.x + shooting.len * 0.85;
        var y = shooting.y + shooting.len * 0.32;
        var g = ctx.createLinearGradient(x - 80, y - 30, x, y);
        g.addColorStop(0, 'rgba(160,230,255,0)');
        g.addColorStop(1, 'rgba(160,230,255,0.5)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 80, y - 30);
        ctx.lineTo(x, y);
        ctx.stroke();
        if (shooting.len > 280) shooting = null;
      }
      window.requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    window.requestAnimationFrame(draw);
  }

  // reveal
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var i = 0; i < reveals.length; i++) io.observe(reveals[i]);
  } else {
    for (var j = 0; j < reveals.length; j++) reveals[j].classList.add('in');
  }

  // search
  var overlay = document.getElementById('overlay');
  var openBtn = document.getElementById('searchOpen');
  var closeBtn = document.getElementById('searchClose');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var index = [
    { t: '从零搭一个深空主题的 Astro 博客', m: '技术 · 2026.10.18 · 12 分钟' },
    { t: '用 Canvas 画一片不会打扰阅读的星空', m: '技术 · 2026.10.16 · 10 分钟' },
    { t: '我用 CSS 变量做了一套双主题色板', m: '技术 · 2026.10.10 · 6 分钟' },
    { t: '读完《暗淡蓝点》：宇宙尺度下的谦卑', m: '读书 · 2026.10.08 · 8 分钟' },
    { t: '周末去了城市边缘的山', m: '生活 · 2026.10.01 · 5 分钟' },
    { t: '把博客首页改成了观测站', m: '随笔 · 2026.09.28 · 4 分钟' }
  ];
  function render(q) {
    if (!results) return;
    var list = index.filter(function (it) { return !q || it.t.toLowerCase().indexOf(q.toLowerCase()) > -1; });
    if (!list.length) { results.innerHTML = '<div class="empty">没有找到相关文章</div>'; return; }
    results.innerHTML = list.map(function (it) {
      return '<a class="sr" href="post.html"><div class="t">' + it.t + '</div><div class="m">' + it.m + '</div></a>';
    }).join('');
  }
  function openSearch() {
    if (!overlay) return;
    overlay.classList.add('open');
    render('');
    if (input) { input.value = ''; setTimeout(function () { input.focus(); }, 30); }
  }
  function closeSearch() { if (overlay) overlay.classList.remove('open'); }
  if (openBtn) openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
  if (input) input.addEventListener('input', function () { render(input.value.trim()); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') closeSearch();
  });

  // music
  var disc = document.getElementById('disc');
  var panel = document.getElementById('musicPanel');
  var panelClose = document.getElementById('panelClose');
  var playBtn = document.getElementById('playBtn');
  if (disc && panel) {
    disc.addEventListener('click', function () {
      panel.classList.toggle('open');
      disc.classList.add('playing');
    });
    if (panelClose) panelClose.addEventListener('click', function () {
      panel.classList.remove('open');
    });
    if (playBtn) playBtn.addEventListener('click', function () {
      disc.classList.toggle('playing');
      var playing = disc.classList.contains('playing');
      playBtn.innerHTML = playing
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
        : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
    });
  }

  // copy code
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('.code').querySelector('pre');
      if (pre && navigator.clipboard) {
        navigator.clipboard.writeText(pre.innerText);
        var old = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = old; }, 1600);
      }
    });
  });

  // toc active
  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) map[id] = a;
    });
    var tocIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          var a = map[en.target.id];
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { tocIo.observe(document.getElementById(id)); });
  }
})();
