// ===== NAVBAR: TOGGLE + SCROLL =====
const toggle   = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar   = document.querySelector('.navbar');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) navLinks.classList.remove('open');
  });
}
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ===== ACTIVE NAV LINK =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html') ||
      (currentPage === 'index.html' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ===== SCROLL REVEAL =====
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('visible'), Number(delay));
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
  if (!el.dataset.delay) el.dataset.delay = (i % 5) * 80;
  revealObs.observe(el);
});

// ===== AUTO-REVEAL CARDS (stagger) =====
const cardObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const siblings = [...e.target.parentElement.children];
      const idx = siblings.indexOf(e.target);
      setTimeout(() => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
      }, idx * 100);
      cardObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.card, .case-card, .testimonial-card, .article-card, .gallery-item, .admin-stat'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s cubic-bezier(.22,.61,.36,1)';
  cardObs.observe(el);
});

// ===== ANIMATED COUNTER =====
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const isFloat = target !== Math.floor(target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const val = parseFloat(el.dataset.count);
      if (!isNaN(val)) animateCounter(el, val);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// ===== HERO TYPING EFFECT =====
const typingEl = document.getElementById('heroTyping');
if (typingEl) {
  const phrases = [
    'Intelligent AI Solutions',
    'Digital Transformation',
    'Smarter Enterprises',
    'The Future of Work',
  ];
  let pIdx = 0, cIdx = 0, deleting = false;
  const cursor = document.getElementById('heroCursor');

  function type() {
    const phrase = phrases[pIdx];
    if (!deleting) {
      typingEl.textContent = phrase.slice(0, cIdx + 1);
      cIdx++;
      if (cIdx === phrase.length) { deleting = true; setTimeout(type, 2200); return; }
    } else {
      typingEl.textContent = phrase.slice(0, cIdx - 1);
      cIdx--;
      if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; setTimeout(type, 400); return; }
    }
    setTimeout(type, deleting ? 55 : 90);
  }
  setTimeout(type, 800);
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const thankYou    = document.getElementById('thankYou');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;
    const fields = ['fullName','email','phone','company','country','jobTitle','jobDetails'];
    fields.forEach(id => {
      const el  = document.getElementById(id);
      const err = document.getElementById(id + 'Error');
      if (!el || !err) return;
      el.classList.remove('error'); err.classList.remove('show');
      if (!el.value.trim()) {
        el.classList.add('error'); err.classList.add('show'); valid = false;
      }
    });
    const emailEl  = document.getElementById('email');
    const emailErr = document.getElementById('emailError');
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('error');
      if (emailErr) { emailErr.textContent = 'Please enter a valid email.'; emailErr.classList.add('show'); }
      valid = false;
    }
    if (valid) {
        const apiBase = (window.location.protocol === 'file:'
          || window.location.hostname === '127.0.0.1'
          || window.location.hostname === 'localhost'
          || (window.location.port && window.location.port !== '4000')) ? 'http://localhost:4000' : '';

        const payload = {
          fullName: document.getElementById('fullName').value.trim(),
          email: document.getElementById('email').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          company: document.getElementById('company').value.trim(),
          country: document.getElementById('country').value.trim(),
          jobTitle: document.getElementById('jobTitle').value.trim(),
          jobDetails: document.getElementById('jobDetails').value.trim(),
        };

        const contactError = document.getElementById('contactError');
        if (contactError) { contactError.style.display = 'none'; contactError.textContent = ''; }

        // show inline loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const prevBtnText = submitBtn ? submitBtn.textContent : null;
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

        fetch(`${apiBase}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            const text = await res.text();
            let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
            if (!res.ok) {
              throw new Error((data && data.message) || res.statusText || 'Unable to send enquiry.');
            }
            contactForm.style.display = 'none';
            if (thankYou) thankYou.style.display = 'block';
          })
          .catch((err) => {
            if (contactError) { contactError.style.display = 'block'; contactError.textContent = err.message; }
            // restore form
            contactForm.style.display = 'block';
          })
          .finally(() => {
            if (submitBtn) { submitBtn.disabled = false; if (prevBtnText) submitBtn.textContent = prevBtnText; }
          });
    }
  });
}

// ===== ADMIN LOGIN =====
const loginForm       = document.getElementById('loginForm');
const loginError      = document.getElementById('loginError');
const loginSection    = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');

if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const stored = JSON.parse(localStorage.getItem('orbit_user') || 'null');
    const validAdmin = (user === 'admin' && pass === 'orbitai123');
    const validUser = stored && user === stored.username && pass === stored.password;
    if (validAdmin || validUser) {
      const remember = document.getElementById('remember');
      if (remember && remember.checked) localStorage.setItem('orbit_keep_user', user);
      if (loginSection && dashboardSection) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        renderDashboard();
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      if (loginError) {
        loginError.textContent = 'Invalid credentials. Please try again.';
        loginError.style.display = 'block';
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
      }
    }
  });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    dashboardSection.style.display = 'none';
    loginSection.style.display = 'flex';
    loginForm.reset();
    loginError.classList.remove('show');
  });
}

// ===== SIGNUP HANDLER (client-side demo) =====
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const su = (document.getElementById('signup_username')||{}).value.trim();
    const sp = (document.getElementById('signup_password')||{}).value.trim();
    const sem = (document.getElementById('signup_email')||{}).value.trim();
    if (!su || !sp || !sem) { alert('Please fill all fields'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sem)) { alert('Please enter a valid email'); return; }
    localStorage.setItem('orbit_user', JSON.stringify({ username: su, password: sp, email: sem }));
    alert('Account created. Please sign in.');
    window.location.href = 'login.html';
  });
}

const mockInquiries = [
  { id:1, name:'Sarah Johnson',  email:'sarah.j@techcorp.com',   company:'TechCorp Inc.',       jobTitle:'CTO',            country:'United States', date:'Jun 10, 2025', status:'new' },
  { id:2, name:'Michael Chen',   email:'m.chen@globalfin.sg',    company:'Global Finance',      jobTitle:'VP Technology',  country:'Singapore',     date:'Jun 9, 2025',  status:'review' },
  { id:3, name:'Emma Williams',  email:'emma.w@health360.uk',    company:'Health360',           jobTitle:'Digital Director', country:'United Kingdom', date:'Jun 7, 2025', status:'resolved' },
  { id:4, name:'Carlos Martinez',email:'carlos.m@logix.es',      company:'LogiX Solutions',     jobTitle:'COO',            country:'Spain',          date:'Jun 5, 2025',  status:'new' },
  { id:5, name:'Aisha Patel',    email:'aisha@nexta.in',         company:'Nexta Retail',        jobTitle:'Head of IT',     country:'India',          date:'Jun 3, 2025',  status:'review' },
  { id:6, name:'David Müller',   email:'d.muller@autohaus.de',   company:'AutoHaus GmbH',       jobTitle:'Innovation Lead', country:'Germany',       date:'Jun 1, 2025',  status:'resolved' },
  { id:7, name:'Priya Nguyen',   email:'priya.n@edusmart.vn',    company:'EduSmart',            jobTitle:'CEO',            country:'Vietnam',        date:'May 28, 2025', status:'new' },
];

function renderDashboard() {
  const totalEl    = document.getElementById('totalCount');
  const newEl      = document.getElementById('newCount');
  const resolvedEl = document.getElementById('resolvedCount');
  const tbody      = document.getElementById('inquiryTableBody');
  if (totalEl)    { totalEl.dataset.count    = mockInquiries.length;                                 counterObs.observe(totalEl); }
  if (newEl)      { newEl.dataset.count      = mockInquiries.filter(i=>i.status==='new').length;      counterObs.observe(newEl); }
  if (resolvedEl) { resolvedEl.dataset.count = mockInquiries.filter(i=>i.status==='resolved').length; counterObs.observe(resolvedEl); }
  if (tbody) {
    tbody.innerHTML = mockInquiries.map(i => `
      <tr>
        <td><strong style="color:var(--white)">${i.name}</strong><br><small style="color:var(--text-light)">${i.email}</small></td>
        <td>${i.company}</td>
        <td>${i.jobTitle}</td>
        <td>${i.country}</td>
        <td style="color:var(--text-light)">${i.date}</td>
        <td><span class="status-badge status-${i.status}">${i.status.charAt(0).toUpperCase()+i.status.slice(1)}</span></td>
      </tr>`).join('');
  }
}

// ===== SUBSCRIBE (articles page) =====
window.handleSubscribe = function() {
  const email = document.getElementById('subscribeEmail');
  const msg   = document.getElementById('subscribeMsg');
  if (!email || !msg) return;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    msg.style.display = 'block';
    email.value = '';
  } else {
    email.style.borderColor = '#ef4444';
    setTimeout(() => email.style.borderColor = '', 1500);
  }
};
