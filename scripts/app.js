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
    // Закрыть дропдаун чата если открыт
    const chatDropdown = document.getElementById('chat-dropdown');
    if (chatDropdown) chatDropdown.classList.remove('is-open');
    
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

// Chat Toggle with Provider Selection
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
  // Kick чат виджет - используем правильный URL формат
  return 'https://kick.com/jesusavgn/chatroom';
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

if (chatCloseBtn) {
  chatCloseBtn.addEventListener('click', () => {
    chatContainer.classList.remove('is-visible');
  });
}

// Combined Chat Toggle and Provider Selection
(function chatDropdown() {
  const switcher = document.querySelector('.chat-switcher');
  if (!switcher) return;

  const toggleBtn = document.getElementById('chat-toggle-btn');
  const dropdown = document.getElementById('chat-dropdown');
  const options = Array.from(dropdown ? dropdown.querySelectorAll('.chat-option') : []);

  // Показать дропдаун при клике на кнопку "Чат"
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Закрыть дропдаун темы если открыт
      const themeDropdown = document.getElementById('theme-dropdown');
      if (themeDropdown) themeDropdown.classList.remove('is-open');
      
      dropdown.classList.toggle('is-open');
    });
  }

  // Закрыть дропдаун при клике вне его
  document.addEventListener('click', () => dropdown.classList.remove('is-open'));

  // Выбор платформы и открытие чата
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const provider = opt.dataset.chat;
      if (!provider) return;
      
      // Сохранить выбор
      localStorage.setItem(CHAT_PROVIDER_KEY, provider);
      
      // Применить провайдера
      applyChatProvider(provider);
      
      // Закрыть дропдаун
      dropdown.classList.remove('is-open');
      
      // Открыть чат
      if (chatContainer) {
        chatContainer.classList.add('is-visible');
      }
    });
  });
})();

// Stream Status Checker
(function streamStatus() {
  const twitchStatus = document.getElementById('twitch-status');
  const kickStatus = document.getElementById('kick-status');
  const twitchText = document.getElementById('twitch-text');
  const kickText = document.getElementById('kick-text');
  const twitchDot = document.getElementById('twitch-dot');
  const kickDot = document.getElementById('kick-dot');
  const twitchWatch = document.getElementById('twitch-watch');
  const kickWatch = document.getElementById('kick-watch');

  if (!twitchStatus || !kickStatus) return;

  // Проверка статуса Twitch через TwitchTracker API (более надёжно)
  async function checkTwitchStatus() {
    // Показать анимацию загрузки
    twitchDot.classList.add('loading');
    twitchText.textContent = 'Проверяем...';
    twitchWatch.style.display = 'none';
    
    try {
      // Используем несколько методов проверки
      const methods = [
        // Метод 1: Twitch Embed API
        async () => {
          const response = await fetch('https://api.twitch.tv/helix/streams?user_login=jesusavgn', {
            headers: {
              'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
            }
          });
          const data = await response.json();
          return data.data && data.data.length > 0;
        },
        // Метод 2: Проверка через CORS proxy
        async () => {
          const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://twitchtracker.com/jesusavgn'));
          const data = await response.json();
          return data.contents && data.contents.includes('Live');
        }
      ];

      let isLive = false;
      for (const method of methods) {
        try {
          isLive = await method();
          if (isLive) break;
        } catch (e) {
          continue;
        }
      }
      
      // Убрать анимацию загрузки
      twitchDot.classList.remove('loading');
      
      if (isLive) {
        twitchStatus.classList.add('online', 'twitch');
        twitchText.textContent = 'В эфире';
        twitchWatch.style.display = 'inline-block';
      } else {
        twitchStatus.classList.remove('online', 'twitch');
        twitchText.textContent = 'Офлайн';
        twitchWatch.style.display = 'none';
      }
    } catch (error) {
      console.log('Twitch status check failed:', error);
      twitchDot.classList.remove('loading');
      twitchStatus.classList.remove('online', 'twitch');
      twitchText.textContent = 'Офлайн';
      twitchWatch.style.display = 'none';
    }
  }

  // Проверка статуса Kick
  async function checkKickStatus() {
    // Показать анимацию загрузки
    kickDot.classList.add('loading');
    kickText.textContent = 'Проверяем...';
    kickWatch.style.display = 'none';
    
    try {
      // Используем публичный CORS proxy
      const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://kick.com/api/v1/channels/jesusavgn'));
      const data = await response.json();
      const kickData = JSON.parse(data.contents);
      
      const isLive = kickData && kickData.livestream && kickData.livestream.is_live === true;
      
      // Убрать анимацию загрузки
      kickDot.classList.remove('loading');
      
      if (isLive) {
        kickStatus.classList.add('online', 'kick');
        kickText.textContent = 'В эфире';
        kickWatch.style.display = 'inline-block';
      } else {
        kickStatus.classList.remove('online', 'kick');
        kickText.textContent = 'Офлайн';
        kickWatch.style.display = 'none';
      }
    } catch (error) {
      console.log('Kick status check failed:', error);
      kickDot.classList.remove('loading');
      kickStatus.classList.remove('online', 'kick');
      kickText.textContent = 'Офлайн';
      kickWatch.style.display = 'none';
    }
  }

  // Начальная проверка
  checkTwitchStatus();
  checkKickStatus();

  // Обновление каждые 60 секунд
  setInterval(() => {
    checkTwitchStatus();
    checkKickStatus();
  }, 60000);
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
