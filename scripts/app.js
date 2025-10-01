// Маленькие «iOS-like» анимация и фишки интерфейса

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// Переключатель тем Twitch/Kick в виде дропдауна
(function themeDropdown() {
  const switcher = $('.theme-switcher');
  if (!switcher) return;

  const toggleBtn = $('#theme-toggle-btn', switcher);
  const dropdown = $('#theme-dropdown', switcher);
  const themeOptions = $$('.theme-option', switcher);

  // 1. Установить тему при загрузке
  let currentTheme = localStorage.getItem('theme') || 'twitch';
  applyTheme(currentTheme);

  // 2. Показать/скрыть дропдаун
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('is-open');
  });

  // 3. Закрыть дропдаун при клике вне его
  document.addEventListener('click', () => {
    dropdown.classList.remove('is-open');
  });

  // 4. Установить тему при выборе опции
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const newTheme = option.dataset.theme;
      if (newTheme) {
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      }
    });
  });

  function applyTheme(theme) {
    if (theme === 'twitch') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }
})();

// Сглаживание якорных переходов
(function smoothAnchors(){
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(target){
      e.preventDefault();
      // Добавляем смещение для хедера
      const headerOffset = 70;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
           top: offsetPosition,
           behavior: "smooth"
      });
    }
  });
})();

// Анимации при прокрутке
(function scrollAnimations() {
  const animatedElements = $$('.section, .hero > *, .widgets > *, .news-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // observer.unobserve(entry.target); // Можно раскомментировать, если анимация нужна только один раз
      } else {
        // entry.target.classList.remove('in-view'); // Можно раскомментировать для повторной анимации
      }
    });
  }, {
    threshold: 0.1,
  });

  animatedElements.forEach(el => {
    observer.observe(el);
  });
})();

// Twitch Chat Toggle
const chatContainer = document.getElementById('twitch-chat-container');
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatCloseBtn = document.getElementById('chat-close-btn');
const chatIframe = chatContainer ? chatContainer.querySelector('iframe') : null;
const chatTitle = document.getElementById('chat-title');

// Хранилище инициализации провайдера чата
const CHAT_PROVIDER_KEY = 'chatProvider';
const defaultProvider = localStorage.getItem(CHAT_PROVIDER_KEY) || 'twitch';

function getTwitchChatSrc() {
  try {
    const host = location.hostname;
    const parents = [host, 'hesusinside.netlify.app', 'localhost', '127.0.0.1']
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
    const parentParams = parents.map(p => `parent=${encodeURIComponent(p)}`).join('&');
    return `https://www.twitch.tv/embed/jesusavgn/chat?${parentParams}&darkpopout`;
  } catch (e) {
    return 'https://www.twitch.tv/embed/jesusavgn/chat?darkpopout';
  }
}

function getKickChatSrc() {
  // Kick не требует parent. Стандартный виджет чата:
  // Используем /embed/ для чата канала jesusavgn
  return 'https://kick.com/embed/chat/jesusavgn';
}

function applyChatProvider(provider) {
  if (!chatIframe) return;
  if (provider === 'kick') {
    chatIframe.src = getKickChatSrc();
    if (chatTitle) chatTitle.textContent = 'Чат Kick';
  } else {
    chatIframe.src = getTwitchChatSrc();
    if (chatTitle) chatTitle.textContent = 'Чат Twitch';
  }
}

applyChatProvider(defaultProvider);

if (chatContainer && chatToggleBtn && chatCloseBtn) {
  chatToggleBtn.addEventListener('click', () => {
    chatContainer.classList.add('is-visible');
  });

  chatCloseBtn.addEventListener('click', () => {
    chatContainer.classList.remove('is-visible');
  });
}

// Dropdown для выбора провайдера чата (аналогично теме)
(function chatDropdown() {
  const switcher = document.querySelector('.chat-switcher');
  if (!switcher) return;

  const toggleBtn = document.getElementById('chat-provider-btn');
  const dropdown = document.getElementById('chat-dropdown');
  const options = Array.from(dropdown ? dropdown.querySelectorAll('.chat-option') : []);

  // Установить текущую платформу на кнопку
  function setBtnLabel(provider) {
    toggleBtn.textContent = provider === 'kick' ? 'Kick' : 'Twitch';
  }
  setBtnLabel(defaultProvider);

  // Показать/скрыть
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('is-open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('is-open'));

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const provider = opt.dataset.chat;
      if (!provider) return;
      localStorage.setItem(CHAT_PROVIDER_KEY, provider);
      applyChatProvider(provider);
      setBtnLabel(provider);
      dropdown.classList.remove('is-open');
    });
  });
})();

// Блокировка для мобильных и планшетов
(function deviceBlocker(){
  const overlay = document.getElementById('mobile-block');
  if (!overlay) return;

  const BYPASS_KEY = 'mobileBypass';

  function isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  function isSmallViewport() {
    // Блокируем когда ширина окна меньше 1024 и это тач-устройство или мобильный UA
    return window.innerWidth <= 1024;
  }

  const ua = navigator.userAgent.toLowerCase();
  const isMobileUA = /(iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm|mobile)/i.test(ua);

  const userBypassed = localStorage.getItem(BYPASS_KEY) === '1';
  const shouldBlock = (isTouchDevice() || isMobileUA) && isSmallViewport() && !userBypassed;
  if (shouldBlock) {
    overlay.classList.add('visible');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  // Обработчик кнопки «Открыть всё равно»
  const bypassBtn = document.getElementById('mobile-bypass-btn');
  if (bypassBtn) {
    bypassBtn.addEventListener('click', () => {
      localStorage.setItem(BYPASS_KEY, '1');
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }
})();
