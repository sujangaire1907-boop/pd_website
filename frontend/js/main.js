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

function observeDynamicCards(container) {
  if (!container) return;
  container.querySelectorAll('.card.reveal').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s cubic-bezier(.22,.61,.36,1)';
    cardObs.observe(el);
  });
}

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
        const apiBase = 'https://pd-website-mobq-pi.vercel.app';

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

function getApiBase() {
  return 'https://pd-website-mobq-pi.vercel.app';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char];
  });
}

function parseEventDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date;
  const parts = String(value).trim().split(/[-\/]/).map((p) => p.trim());
  if (parts.length >= 3) {
    const [year, month, day] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return null;
}

function normalizeLocalDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function eventPlaceholder(message) {
  return `<div class="card reveal" style="opacity:.75"><div class="ev-card"><div class="ev-body"><p style="margin:0; color: var(--text-light);">${escapeHtml(message)}</p></div></div></div>`;
}

function getModeBadge(mode) {
  const normalized = String(mode || '').toLowerCase();
  if (normalized.includes('webinar')) return 'bp';
  if (normalized.includes('workshop')) return 'bg-badge';
  if (normalized.includes('in person') || normalized.includes('in-person')) return 'bc';
  return 'ba';
}

function buildEventCard(event, isPast) {
  const date = parseEventDate(event.eventDate);
  const month = date ? date.toLocaleString('en-US', { month: 'short' }) : 'TBA';
  const day = date ? String(date.getDate()).padStart(2, '0') : '--';
  const year = date ? date.getFullYear() : '2025';
  const locationText = event.location ? escapeHtml(event.location) : 'Online';
  const timeText = event.startTime ? escapeHtml(`${event.startTime}${event.endTime ? ' – ' + event.endTime : ''}`) : '';
  const mode = event.mode ? escapeHtml(event.mode) : '';
  const featured = event.featured ? `<span class="badge ba">Featured</span>` : '';
  const statusLabel = isPast ? `<span class="badge badge-muted">${escapeHtml(event.status || 'Completed')}</span>` : '';
  const metaItems = [];

  if (locationText) metaItems.push(`<span>${locationText}</span>`);
  if (timeText) metaItems.push(`<span>${timeText}</span>`);

  return `
    <div class="card reveal">
      <div class="ev-card">
        <div class="ev-date">
          <div class="mo">${month}</div>
          <div class="dy">${day}</div>
          <div class="yr">${year}</div>
        </div>
        <div class="ev-body">
          <div class="event-card-header">
            <h3>${escapeHtml(event.title || 'Untitled Event')}</h3>
            ${mode ? `<span class="badge ${getModeBadge(mode)}">${mode}</span>` : ''}
            ${featured}
            ${statusLabel}
          </div>
          <div class="ev-meta">
            ${metaItems.join('')}
          </div>
          <p>${escapeHtml(event.description || 'Details coming soon.')}</p>
          ${!isPast ? `<div class="event-cta"><a href="contact.html" class="btn btn-primary btn-sm">Register Now</a></div>` : ''}
        </div>
      </div>
    </div>`;
}

async function fetchEvents() {
  const upcomingContainer = document.getElementById('upcomingEvents');
  const pastContainer = document.getElementById('pastEvents');
  const loading = document.getElementById('eventsLoading');
  const error = document.getElementById('eventsError');
  if (!upcomingContainer || !pastContainer) return;

  try {
    const res = await fetch(`${getApiBase()}/api/events`);
    if (!res.ok) throw new Error('Unable to load events.');
    const items = await res.json();
    const now = normalizeLocalDate(new Date());
    const upcoming = [];
    const past = [];

    (Array.isArray(items) ? items : []).forEach((event) => {
      const date = parseEventDate(event.eventDate);
      const completed = String(event.status || '').toLowerCase() === 'completed';
      const eventLocalDate = date instanceof Date && !Number.isNaN(date.getTime()) ? normalizeLocalDate(date) : null;
      const isPast = completed || (eventLocalDate && eventLocalDate < now);
      if (isPast) past.push(event); else upcoming.push(event);
    });

    const sortByDate = (a, b, reverse = false) => {
      const da = parseEventDate(a.eventDate);
      const db = parseEventDate(b.eventDate);
      const aTime = da instanceof Date && !Number.isNaN(da.getTime()) ? da.getTime() : 0;
      const bTime = db instanceof Date && !Number.isNaN(db.getTime()) ? db.getTime() : 0;
      return reverse ? bTime - aTime : aTime - bTime;
    };

    upcoming.sort((a, b) => sortByDate(a, b));
    past.sort((a, b) => sortByDate(a, b, true));

    upcomingContainer.innerHTML = upcoming.length
      ? upcoming.map((event) => buildEventCard(event, false)).join('')
      : eventPlaceholder('No upcoming events are available yet.');

    pastContainer.innerHTML = past.length
      ? past.map((event) => buildEventCard(event, true)).join('')
      : eventPlaceholder('No past events are available yet.');

    observeDynamicCards(upcomingContainer);
    observeDynamicCards(pastContainer);
  } catch (err) {
    if (error) {
      error.textContent = err.message || 'Unable to load event data.';
      error.style.display = 'block';
    }
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

const eventsPageSections = document.getElementById('upcomingEvents');
if (eventsPageSections) fetchEvents();

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

// ===== FLOATING AI ASSISTANT =====
(function initAIAssistant() {
  const btn = document.getElementById('aiAssistantBtn');
  const modal = document.getElementById('aiChatModal');
  const closeBtn = document.getElementById('aiCloseBtn');
  const chatInput = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const messagesContainer = document.getElementById('aiChatMessages');

  if (!btn || !modal || !messagesContainer) return;

  // AI Response Database
  const aiResponses = {
    'solutions|product': [
      'Our core solutions include AI Virtual Assistants, Prototyping Solutions, and Digital Employee Experience platforms. Each is designed to transform how your organization operates.',
      'We offer three main solutions: 1) AI Virtual Assistant - handles 24/7 customer queries, 2) Prototyping Solutions - accelerates product development, 3) Digital Employee Experience - streamlines workplace operations.'
    ],
    'pricing|cost|price': [
      'For pricing details, please contact our sales team through the Contact page. We offer customized enterprise solutions based on your needs.',
      'Visit our Contact page to discuss pricing and get a personalized quote tailored to your organization.'
    ],
    'demo|trial|test': [
      'Would you like to see a live demo? Please visit our Contact page and our team will arrange a personalized demonstration.',
      'Schedule a demo by contacting us through the Contact page. Our sales team will walk you through our AI solutions.'
    ],
    'careers|jobs|hiring': [
      'We\'re hiring across engineering, product, and customer success. Check out our open roles on the Careers page!',
      'Interested in joining Orbit AI? Visit our Careers page to explore exciting opportunities with our global team.'
    ],
    'security|compliance|safe': [
      'Security is our priority. We are SOC 2 Type II certified with end-to-end data encryption for enterprise-grade protection.',
      'We maintain enterprise-level security standards including SOC 2 Type II certification and comprehensive data encryption.'
    ],
    'company|about|history': [
      'Orbit AI is a global AI technology company founded in 2015. We serve 500+ enterprise clients across 40+ countries with 12M+ daily interactions.',
      'Founded in 2015, Orbit AI revolutionizes how businesses operate through AI solutions. We have a global presence and serve Fortune 500 companies.'
    ],
    'case studies|success|results': [
      'We have numerous success stories! Our case studies show how clients reduced costs by up to 72% and improved efficiency significantly. Visit our Case Studies page to learn more.',
      'Check out our Case Studies page to see real-world results from our enterprise clients worldwide.'
    ],
    'team|contact|support': [
      'You can reach us through our Contact page. Our team is available to help with any questions or support needs.',
      'Have questions? Visit our Contact page or reach out to our support team. We\'re here to help!'
    ],
    'hello|hi|hey|greetings': [
      '👋 Hi there! How can I assist you with Orbit AI today? Feel free to ask about our solutions, pricing, or anything else!',
      'Hello! Welcome to Orbit AI. What would you like to know about our AI solutions?'
    ],
    'thank|thanks|appreciate': [
      'You\'re welcome! Feel free to ask if you have any other questions.',
      'Happy to help! Is there anything else you\'d like to know?'
    ]
  };

  // Get AI Response
  function getAIResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    
    for (const [keywords, responses] of Object.entries(aiResponses)) {
      const keywordList = keywords.split('|');
      if (keywordList.some(keyword => message.includes(keyword))) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    // Default response
    return 'Great question! For more detailed information, please visit our Solutions page or contact us for personalized assistance.';
  }

  // Add message to chat
  function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${isUser ? 'ai-user-message' : 'ai-bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
  }

  // Show typing indicator
  function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message ai-bot-message';
    messageDiv.id = 'typingIndicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content ai-typing-indicator';
    contentDiv.innerHTML = '<div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div>';
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  // Handle send message
  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, true);
    chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Simulate AI response delay
    setTimeout(() => {
      removeTypingIndicator();
      const response = getAIResponse(text);
      addMessage(response, false);
    }, 800 + Math.random() * 500);
  }

  // Event listeners
  btn.addEventListener('click', () => {
    modal.classList.toggle('open');
    if (modal.classList.contains('open')) {
      chatInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.ai-assistant-widget')) {
      modal.classList.remove('open');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
    }
  });
})();
