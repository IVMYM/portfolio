import './styles.css';
import content from '../content/site.json';

const state = {
  lang: document.documentElement.lang === 'en' ? 'en' : 'zh',
  theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  menuOpen: false,
};

const ICONS = {
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M19.2 4.8l-1.6 1.6M6.4 17.6l-1.6 1.6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16.5 3.2A8.8 8.8 0 1 0 20.8 14 7 7 0 0 1 16.5 3.2z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

function t(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && (value.zh != null || value.en != null)) {
    return value[state.lang] || value.zh || value.en || '';
  }
  return String(value);
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function icon(name) {
  const span = document.createElement('span');
  span.className = 'icon';
  span.innerHTML = ICONS[name];
  return span;
}

function pad(index) {
  return String(index + 1).padStart(2, '0');
}

function badge(kind) {
  return kind === 'personal' ? t(content.ui.personalBadge) : t(content.ui.caseBadge);
}

function setMeta(title, description) {
  document.title = title;
  document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-Hans';
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', description);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', state.theme === 'dark' ? '#121411' : '#e9e4d9');
  const skip = document.querySelector('.skip');
  if (skip) skip.textContent = t(content.ui.skip);

  let ld = document.getElementById('person-ld');
  if (!ld) {
    ld = document.createElement('script');
    ld.id = 'person-ld';
    ld.type = 'application/ld+json';
    document.head.append(ld);
  }
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: content.profile.nameZh,
    alternateName: [content.profile.nameEn, content.profile.github],
    url: content.profile.githubUrl,
    sameAs: [content.profile.githubUrl],
    description: t(content.profile.tagline),
  });
}

function header() {
  const links = [
    ['work', content.ui.navWork],
    ['services', content.ui.navServices],
    ['skills', content.ui.navSkills],
    ['contact', content.ui.navContact],
  ];

  const nav = el(
    'nav',
    {
      id: 'site-nav',
      class: state.menuOpen ? 'nav open' : 'nav',
      'aria-label': state.lang === 'zh' ? '站内' : 'Primary',
    },
    links.map(([id, label]) =>
      el('a', { href: `#${id}`, text: t(label), onClick: () => { state.menuOpen = false; } }),
    ),
  );

  const lang = el('div', { class: 'lang', role: 'group', 'aria-label': t(content.ui.langGroup) }, [
    el('button', {
      type: 'button',
      text: '中文',
      'data-focuskey': 'lang-zh',
      'aria-pressed': state.lang === 'zh' ? 'true' : 'false',
      onClick: () => setLang('zh'),
    }),
    el('button', {
      type: 'button',
      text: 'EN',
      'data-focuskey': 'lang-en',
      'aria-pressed': state.lang === 'en' ? 'true' : 'false',
      onClick: () => setLang('en'),
    }),
  ]);

  const themeLabel = state.theme === 'dark' ? t(content.ui.themeToLight) : t(content.ui.themeToDark);
  const themeBtn = el('button', {
    type: 'button',
    class: 'icon-btn',
    'data-focuskey': 'theme',
    'aria-label': themeLabel,
    title: themeLabel,
    onClick: toggleTheme,
  }, [icon(state.theme === 'dark' ? 'sun' : 'moon')]);

  const menuLabel = t(content.ui.menu);
  const menuBtn = el('button', {
    type: 'button',
    class: 'menu-btn',
    'aria-label': menuLabel,
    'data-focuskey': 'menu',
    'aria-expanded': state.menuOpen ? 'true' : 'false',
    'aria-controls': 'site-nav',
    onClick: () => {
      state.menuOpen = !state.menuOpen;
      paint({ preserveScroll: true });
    },
  }, [icon(state.menuOpen ? 'close' : 'menu')]);

  return el('header', { class: 'site-header' }, [
    el('div', { class: 'wrap' }, [
      el('a', { class: 'brand', href: '#top' }, [
        el('strong', { text: content.profile.nameZh }),
        el('span', { text: content.profile.nameEn }),
      ]),
      menuBtn,
      nav,
      el('div', { class: 'tools' }, [lang, themeBtn]),
    ]),
  ]);
}

function footer() {
  return el('footer', { class: 'site-footer' }, [
    el('div', { class: 'wrap' }, [
      el('span', { text: `© ${new Date().getFullYear()} ${content.profile.nameZh} · ${content.profile.nameEn}` }),
      el('span', { text: t(content.ui.footerNote) }),
    ]),
  ]);
}

function homeMain() {
  const profile = content.profile;
  const hero = el('section', { class: 'hero wrap', id: 'top' }, [
    el('div', {}, [
      el('p', { class: 'kicker', text: t(profile.kicker) }),
      el('h1', { text: profile.nameZh }),
      el('p', { class: 'latin', text: profile.nameEn }),
      el('p', { class: 'tagline', text: t(profile.tagline) }),
      el('p', { class: 'summary', text: t(profile.summary) }),
      el('div', { class: 'actions' }, [
        el('a', { class: 'btn', href: '#work', text: t(content.ui.viewWork) }),
        el('a', {
          class: 'btn ghost',
          href: profile.githubUrl,
          text: `GitHub · ${profile.github}`,
          rel: 'me noopener',
          target: '_blank',
        }),
      ]),
    ]),
    el('div', { class: 'seal-block' }, [
      el('div', { class: 'seal', 'aria-hidden': 'true', text: '源' }),
      el('ul', { class: 'meta-list' }, [
        el('li', { text: profile.github }),
        el('li', { text: state.lang === 'zh' ? `代表作 ${pad(content.projects.length - 1)}` : `${pad(content.projects.length - 1)} projects` }),
      ]),
    ]),
  ]);

  const services = el('section', { class: 'section wrap', id: 'services' }, [
    el('div', { class: 'section-head' }, [
      el('span', { class: 'idx', text: '01' }),
      el('h2', { text: t(content.ui.servicesTitle) }),
    ]),
    el('p', { class: 'lead', text: t(content.ui.servicesLead) }),
    el('div', { class: 'service-list' }, content.services.map((service, index) =>
      el('article', {}, [
        el('div', { class: 'num', text: pad(index) }),
        el('h3', { text: t(service.title) }),
        el('p', { text: t(service.text) }),
      ]),
    )),
  ]);

  const cards = el('ol', { class: 'cards' }, content.projects.map((project, index) =>
    el('li', {}, [
      el('a', { class: 'card', href: `#/work/${project.id}` }, [
        el('div', { class: 'card-top' }, [
          el('span', { class: 'num', text: pad(index) }),
          el('span', { class: 'badge', text: badge(project.kind) }),
        ]),
        el('h3', { text: t(project.title) }),
        el('p', { text: t(project.summary) }),
        project.period ? el('div', { class: 'period', text: t(project.period) }) : null,
        el('div', { class: 'card-foot' }, [
          el('div', { class: 'chips' }, project.stack.slice(0, 4).map((item) => el('span', { text: item }))),
          el('span', { class: 'arrow', 'aria-hidden': 'true', text: '→' }),
        ]),
      ]),
    ]),
  ));

  const work = el('section', { class: 'section wrap', id: 'work' }, [
    el('div', { class: 'section-head' }, [
      el('span', { class: 'idx', text: '02' }),
      el('h2', { text: t(content.ui.workTitle) }),
    ]),
    el('p', { class: 'lead', text: t(content.ui.workLead) }),
    cards,
  ]);

  const also = el('section', { class: 'section wrap', id: 'also' }, [
    el('div', { class: 'section-head' }, [
      el('span', { class: 'idx', text: '03' }),
      el('h2', { text: t(content.ui.alsoTitle) }),
    ]),
    el('p', { class: 'lead', text: t(content.also.intro) }),
    ...content.also.groups.map((group) =>
      el('div', { class: 'also-group' }, [
        el('h3', { text: t(group.title) }),
        el('ul', { class: 'rows' }, group.items.map((item) =>
          el('li', {}, [
            el('strong', { text: t(item.title) }),
            el('span', { text: t(item.text) }),
          ]),
        )),
      ]),
    ),
  ]);

  const skills = el('section', { class: 'section wrap', id: 'skills' }, [
    el('div', { class: 'section-head' }, [
      el('span', { class: 'idx', text: '04' }),
      el('h2', { text: t(content.ui.skillsTitle) }),
    ]),
    el('p', { class: 'lead', text: t(content.ui.skillsLead) }),
    el('div', { class: 'skill-grid' }, content.skills.map((group) =>
      el('article', {}, [
        el('h3', { text: t(group.title) }),
        el('ul', {}, group.items.map((item) => el('li', { text: item }))),
      ]),
    )),
  ]);

  const email = content.contact.email;
  const emailIsTodo = !email || email.includes('TODO');
  const contact = el('section', { class: 'section wrap', id: 'contact' }, [
    el('div', { class: 'section-head' }, [
      el('span', { class: 'idx', text: '05' }),
      el('h2', { text: t(content.ui.contactTitle) }),
    ]),
    el('div', { class: 'contact-panel' }, [
      el('div', {}, [
        el('p', { class: 'lead', text: t(content.ui.contactLead) }),
        el('div', { class: emailIsTodo ? 'todo' : 'note' }, [
          emailIsTodo ? el('strong', { text: 'TODO' }) : el('strong', { text: t(content.ui.emailLabel) }),
          el('p', {}, [
            el('a', {
              class: 'mail',
              href: `mailto:${email}`,
              text: email,
            }),
          ]),
          emailIsTodo ? el('p', { text: t(content.ui.contactTodo) }) : null,
        ]),
      ]),
      el('div', {}, [
        el('a', {
          class: 'btn',
          href: profile.githubUrl,
          text: `GitHub · ${profile.github}`,
          rel: 'me noopener',
          target: '_blank',
        }),
      ]),
    ]),
  ]);

  return el('main', { id: 'content' }, [hero, services, work, also, skills, contact]);
}

function detailMain(id) {
  const index = content.projects.findIndex((project) => project.id === id);
  const project = content.projects[index];
  if (!project) {
    return el('main', { id: 'content', class: 'detail' }, [
      el('div', { class: 'wrap' }, [
        el('a', { class: 'back', href: '#work', text: `← ${t(content.ui.back)}` }),
        el('h1', { text: t(content.ui.notFound) }),
      ]),
    ]);
  }

  const prev = content.projects[(index - 1 + content.projects.length) % content.projects.length];
  const next = content.projects[(index + 1) % content.projects.length];
  const steps = project.diagram.steps;

  return el('main', { id: 'content', class: 'detail' }, [
    el('article', { class: 'wrap' }, [
      el('a', { class: 'back', href: '#work', text: `← ${t(content.ui.back)}` }),
      el('div', { class: 'detail-kicker' }, [
        el('span', { class: 'badge', text: badge(project.kind) }),
        el('span', { class: 'num', text: pad(index) }),
        project.period ? el('span', { class: 'period', text: t(project.period) }) : null,
      ]),
      el('h1', { id: 'detail-title', tabindex: '-1', text: t(project.title) }),
      el('p', { class: 'summary', text: t(project.summary) }),
      el('div', { class: 'split' }, [
        el('section', {}, [
          el('h2', { text: t(content.ui.problem) }),
          el('p', { text: t(project.problem) }),
        ]),
        el('section', {}, [
          el('h2', { text: t(content.ui.role) }),
          el('ul', { class: 'role-list' }, project.role.map((item) => el('li', { text: t(item) }))),
        ]),
      ]),
      el('section', { class: 'block' }, [
        el('h2', { text: t(content.ui.architecture) }),
        el('div', { class: `diagram cols-${steps.length}` }, steps.map((step, stepIndex) =>
          el('div', { class: 'step' }, [
            el('div', { class: 'num', text: pad(stepIndex) }),
            el('h3', { text: t(step.title) }),
            el('ul', {}, step.items.map((item) => el('li', { text: t(item) }))),
          ]),
        )),
        el('p', { class: 'caption', text: t(project.diagram.caption) }),
      ]),
      el('section', { class: 'block' }, [
        el('h2', { text: t(content.ui.stack) }),
        el('div', { class: 'tag-row' }, project.stack.map((item) => el('span', { class: 'tag', text: item }))),
      ]),
      project.related ? el('section', { class: 'block' }, [
        el('h2', { text: t(content.ui.related) }),
        el('div', { class: 'related note' }, [el('p', { text: t(project.related) })]),
      ]) : null,
      project.note ? el('section', { class: 'block' }, [
        el('h2', { text: t(content.ui.note) }),
        el('div', { class: 'note' }, [el('p', { text: t(project.note) })]),
        project.links?.length ? el('div', { class: 'link-row' }, project.links.map((link) =>
          el('a', {
            class: 'btn ghost',
            href: link.href,
            text: link.label,
            target: '_blank',
            rel: 'noopener noreferrer',
          }),
        )) : null,
      ]) : null,
      el('nav', { class: 'pager', 'aria-label': state.lang === 'zh' ? '相邻项目' : 'Adjacent projects' }, [
        el('a', { href: `#/work/${prev.id}` }, [
          el('span', { text: t(content.ui.prev) }),
          el('strong', { text: t(prev.title) }),
        ]),
        el('a', { class: 'next', href: `#/work/${next.id}` }, [
          el('span', { text: t(content.ui.next) }),
          el('strong', { text: t(next.title) }),
        ]),
      ]),
    ]),
  ]);
}

function paint(options = {}) {
  const app = document.getElementById('app');
  const y = options.preserveScroll ? window.scrollY : 0;
  const focusKey = options.preserveScroll ? document.activeElement?.dataset?.focuskey : null;
  const match = location.hash.match(/^#\/work\/([a-z0-9-]+)$/);
  const main = match ? detailMain(match[1]) : homeMain();
  app.replaceChildren(header(), main, footer());

  const name = `${content.profile.nameZh} · ${content.profile.nameEn}`;
  if (match) {
    const project = content.projects.find((item) => item.id === match[1]);
    const title = project ? `${t(project.title)} · ${name}` : name;
    setMeta(title, project ? t(project.summary) : t(content.profile.tagline));
    if (!options.preserveScroll) window.scrollTo(0, 0);
    else window.scrollTo(0, y);
    if (options.focusHeading) document.getElementById('detail-title')?.focus({ preventScroll: true });
    else if (focusKey) document.querySelector(`[data-focuskey="${focusKey}"]`)?.focus({ preventScroll: true });
  } else {
    setMeta(`${name} · ${t(content.ui.titleSuffix)}`, t(content.profile.tagline));
    if (focusKey) document.querySelector(`[data-focuskey="${focusKey}"]`)?.focus({ preventScroll: true });
    if (options.preserveScroll) window.scrollTo(0, y);
    else {
      const id = location.hash.replace('#', '');
      if (id && !id.startsWith('/')) {
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
      } else window.scrollTo(0, 0);
    }
  }
}

function setLang(lang) {
  if (state.lang === lang) return;
  state.lang = lang;
  localStorage.setItem('lang', lang);
  paint({ preserveScroll: true });
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('theme', state.theme);
  paint({ preserveScroll: true });
}

window.addEventListener('hashchange', () => {
  state.menuOpen = false;
  paint({ focusHeading: location.hash.startsWith('#/work/') });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && location.hash.startsWith('#/work/')) {
    location.hash = '#work';
  }
});

paint();
