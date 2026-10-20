/* global document, window, localStorage, fetch, performance, IntersectionObserver, navigator */

const root = document.documentElement;

/* ---------- theme ---------- */
try {
  const savedTheme = localStorage.getItem('cx-theme');
  if (savedTheme) root.dataset.theme = savedTheme;
} catch (e) {}

const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try {
      localStorage.setItem('cx-theme', next);
    } catch (e) {}
  });
}

/* ---------- nav / progress ---------- */
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');

function onScroll() {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 14);
  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- mobile menu ---------- */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* ---------- starfield ---------- */
const canvas = document.getElementById('stars');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((w * h) / 17000);
    stars = [];
    for (let i = 0; i < count; i++) {
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

  let shooting = null;
  let nextShot = performance.now() + 7000;

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      let alpha = s.a + Math.sin(t * s.s + s.p) * 0.15;
      if (alpha < 0.05) alpha = 0.05;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.2832);
      ctx.fillStyle = 'rgba(206,233,255,' + alpha.toFixed(3) + ')';
      ctx.fill();
    }
    if (!shooting && t > nextShot) {
      shooting = {
        x: Math.random() * w * 0.55 + w * 0.25,
        y: Math.random() * h * 0.3,
        len: 0,
        v: 5 + Math.random() * 3
      };
      nextShot = t + 14000 + Math.random() * 14000;
    }
    if (shooting) {
      shooting.len += shooting.v;
      const x = shooting.x + shooting.len * 0.85;
      const y = shooting.y + shooting.len * 0.32;
      const g = ctx.createLinearGradient(x - 80, y - 30, x, y);
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

/* ---------- reveal ---------- */
const reveals = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && reveals.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

/* ---------- search ---------- */
const overlay = document.getElementById('overlay');
const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
let searchIndex = null;

function loadSearchIndex() {
  if (searchIndex) return Promise.resolve(searchIndex);
  return fetch('/search.json')
    .then((res) => res.json())
    .then((data) => {
      searchIndex = data;
      return data;
    });
}

function renderSearch(query) {
  if (!results) return;
  const q = (query || '').trim().toLowerCase();
  const list = (searchIndex || []).filter((item) => {
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.join(' ').toLowerCase().includes(q)
    );
  });
  if (!list.length) {
    results.innerHTML = '<div class="empty">没有找到相关文章</div>';
    return;
  }
  results.innerHTML = list
    .slice(0, 8)
    .map(
      (item) =>
        '<a class="sr" href="' + item.url + '">' +
        '<div class="t">' + item.title + '</div>' +
        '<div class="m">' + item.category + ' · ' + item.date + ' · ' + item.tags.join(' / ') + '</div>' +
        '</a>'
    )
    .join('');
}

function openSearch() {
  if (!overlay) return;
  overlay.classList.add('open');
  if (results) results.innerHTML = '<div class="search-loading">载入索引…</div>';
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 30);
  }
  loadSearchIndex()
    .then(() => renderSearch(''))
    .catch(() => {
      if (results) results.innerHTML = '<div class="empty">搜索索引加载失败</div>';
    });
}

function closeSearch() {
  if (overlay) overlay.classList.remove('open');
}

document.querySelectorAll('#searchOpen, [data-search-open]').forEach((btn) => {
  btn.addEventListener('click', openSearch);
});

const searchClose = document.getElementById('searchClose');
if (searchClose) searchClose.addEventListener('click', closeSearch);
if (overlay) {
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeSearch();
  });
}
if (input) {
  input.addEventListener('input', () => renderSearch(input.value));
}
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
  }
  if (event.key === 'Escape') {
    closeSearch();
    if (mobileMenu) mobileMenu.classList.remove('open');
  }
});

/* ---------- music ---------- */
const disc = document.getElementById('disc');
const musicPanel = document.getElementById('musicPanel');
const panelClose = document.getElementById('panelClose');
const playBtn = document.getElementById('playBtn');
const audio = document.getElementById('musicAudio');
const trackName = document.getElementById('trackName');
const trackArtist = document.getElementById('trackArtist');
const trackTime = document.getElementById('trackTime');
const trackTotal = document.getElementById('trackTotal');
const trackBar = document.getElementById('trackBar');
const playlist = document.getElementById('playlist');

const playIcon =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
const pauseIcon =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';

let currentTrack = 0;

function setTrack(index) {
  if (!playlist) return;
  const rows = playlist.querySelectorAll('.pl-row');
  const row = rows[index];
  if (!row) return;
  currentTrack = index;
  rows.forEach((r) => r.classList.remove('active'));
  row.classList.add('active');
  if (trackName) trackName.textContent = row.dataset.title || '';
  if (trackArtist) trackArtist.textContent = row.dataset.artist || '';
  if (trackTime) trackTime.textContent = '00:00';
  if (trackTotal) trackTotal.textContent = row.dataset.duration || '00:00';
  if (trackBar) trackBar.style.width = '0%';
  if (audio) {
    const src = row.dataset.src || '';
    if (src) {
      audio.src = src;
      audio.load();
    } else {
      audio.removeAttribute('src');
    }
  }
}

if (disc && musicPanel) {
  disc.addEventListener('click', () => {
    musicPanel.classList.toggle('open');
  });
  if (panelClose) {
    panelClose.addEventListener('click', () => musicPanel.classList.remove('open'));
  }
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const src = audio && audio.getAttribute('src');
      if (src) {
        if (audio.paused) {
          audio.play().then(() => disc.classList.add('playing')).catch(() => {});
        } else {
          audio.pause();
          disc.classList.remove('playing');
        }
      } else {
        disc.classList.toggle('playing');
      }
      playBtn.innerHTML = disc.classList.contains('playing') ? pauseIcon : playIcon;
    });
  }
  if (playlist) {
    playlist.querySelectorAll('.pl-row').forEach((row, index) => {
      row.addEventListener('click', () => {
        setTrack(index);
        if (audio && audio.getAttribute('src')) {
          audio.play().then(() => disc.classList.add('playing')).catch(() => {});
          if (playBtn) playBtn.innerHTML = pauseIcon;
        }
      });
    });
  }
  const footer = document.querySelector('.footer');
  const musicWrap = document.querySelector('.music');
  if (footer && musicWrap && 'IntersectionObserver' in window) {
    const footerIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          musicWrap.classList.toggle('music--hidden', entry.isIntersecting);
        });
      },
      { threshold: 0.02 }
    );
    footerIo.observe(footer);
  }
  if (audio) {
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (trackBar) trackBar.style.width = pct + '%';
      if (trackTime && trackTotal) {
        const cur = Math.floor(audio.currentTime);
        const dur = Math.floor(audio.duration);
        trackTime.textContent = String(Math.floor(cur / 60)).padStart(2, '0') + ':' + String(cur % 60).padStart(2, '0');
        trackTotal.textContent = String(Math.floor(dur / 60)).padStart(2, '0') + ':' + String(dur % 60).padStart(2, '0');
      }
    });
    audio.addEventListener('ended', () => {
      disc.classList.remove('playing');
      if (playBtn) playBtn.innerHTML = playIcon;
    });
  }
}

/* ---------- copy code ---------- */
document.querySelectorAll('.prose pre.astro-code').forEach((pre) => {
  const btn = document.createElement('button');
  btn.className = 'code-copy';
  btn.type = 'button';
  btn.textContent = '复制';
  pre.appendChild(btn);
  btn.addEventListener('click', () => {
    const code = pre.querySelector('code');
    const text = code ? code.innerText : pre.innerText;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '已复制';
        setTimeout(() => {
          btn.textContent = '复制';
        }, 1600);
      });
    }
  });
});

/* ---------- toc active ---------- */
const tocLinks = document.querySelectorAll('.toc a');
if (tocLinks.length && 'IntersectionObserver' in window) {
  const map = new Map();
  tocLinks.forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) map.set(id, a);
  });
  const tocIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tocLinks.forEach((a) => a.classList.remove('active'));
          const link = map.get(entry.target.id);
          if (link) link.classList.add('active');
        }
      });
    },
    { rootMargin: '-15% 0px -70% 0px' }
  );
  map.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) tocIo.observe(el);
  });
}

/* ---------- archive filter ---------- */
const filterButtons = document.querySelectorAll('[data-archive-filter]');
if (filterButtons.length) {
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.archiveFilter;
      filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.archive-item').forEach((item) => {
        item.hidden = cat !== 'all' && item.dataset.category !== cat;
      });
      document.querySelectorAll('.archive-group').forEach((group) => {
        const visible = [...group.querySelectorAll('.archive-item')].filter((item) => !item.hidden).length;
        group.hidden = visible === 0;
        const count = group.querySelector('.archive-year span');
        if (count) count.textContent = visible + ' 篇';
      });
    });
  });
}

/* ---------- share ---------- */
document.querySelectorAll('[data-copy-link]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      const old = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(() => {
        btn.textContent = old;
      }, 1600);
    });
  });
});

document.querySelectorAll('[data-share]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const old = btn.textContent;
        btn.textContent = '链接已复制';
        setTimeout(() => {
          btn.textContent = old;
        }, 1600);
      });
    }
  });
});
