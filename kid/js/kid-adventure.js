/**
 * kid-adventure.js — Playful interactive features designed specifically
 * for the Kids Edition:
 *   1. Kid Distance Translator (trips to the Moon, laps around Earth, airplane years)
 *   2. Interactive "Send a Radio Message to Voyager!" simulator
 *   3. 4-question Space Explorer Quiz with collectible sticker badges
 * Localized in en, zh, es, and ja.
 */
(() => {
  'use strict';

  const KID_COPY = {
    en: {
      chapters: [
        ['#mission', '🚀 Meet the Twins'],
        ['#kid-signal', '📡 Send a Signal'],
        ['#solar-map', '🪐 Space Map'],
        ['#golden-record', '🎵 Golden Record'],
        ['#gallery', '📸 Space Photos'],
        ['#kid-quiz-section', '🏆 Space Quiz']
      ],
      heroSpeechV1: 'Hi from way out here!',
      heroSpeechV2: 'I visited 4 giant planets!',
      distTitle: '🤯 How Far Is That, Really?',
      distSub: 'Space numbers are HUGE! Here is how far Voyager 1 has flown in kid-sized comparisons:',
      distMoonLabel: 'Trips to the Moon',
      distEarthLabel: 'Laps around Earth',
      distPlaneLabel: 'Years on a passenger jet',
      signalTitle: '📡 Beep! Send a Message to Voyager!',
      signalSub: 'Pick a spacecraft and press the big button to send a radio "Hello!" at the speed of light.',
      signalPickV1: '🛰️ Voyager 1',
      signalPickV2: '🛰️ Voyager 2',
      signalBtn: '📡 Send "Hello!" Now',
      signalSending: '⚡ Zipping through space at light speed…',
      signalReady: 'Press the button to launch your radio wave from Earth!',
      signalResult: (name, oneWay, roundTrip) =>
        `Message delivered to ${name}! In real life, your "Hello!" takes ${oneWay} to get there — and ${roundTrip} to hear "Hi back!"`,
      quizTitle: '🏆 Space Explorer Quiz!',
      quizSub: 'Answer 4 fun questions to unlock all 4 Space Explorer Sticker Badges!',
      quizReset: '🔄 Play Quiz Again',
      quizScore: (n, total) => `Badges Unlocked: ${n} / ${total}`,
      quizAllDone: '🎉 Woohoo! You are an Official Interstellar Captain!',
      curiousSummary: '🔭 Curious Kids & Parents Corner (Extra Charts, Instruments & NASA Sources)',
      badges: ['🚀 Launch Cadet', '🪐 Planet Hopper', '🎵 Cosmic DJ', '⭐ Star Captain'],
      questions: [
        {
          q: 'Which year did the Voyager twins blast off from Earth?',
          options: ['1977', '2005', '1999'],
          answer: 0,
          fact: 'Both Voyager 1 and Voyager 2 launched in 1977 — almost 50 years ago!'
        },
        {
          q: 'Which Voyager is the ONLY spacecraft to visit all 4 giant planets (Jupiter, Saturn, Uranus & Neptune)?',
          options: ['Voyager 1', 'Voyager 2', 'Apollo 11'],
          answer: 1,
          fact: 'Voyager 2 completed the Grand Tour of all four giant outer planets!'
        },
        {
          q: 'What special gift do both Voyagers carry in case aliens find them?',
          options: ['A giant pizza', 'The Golden Record', 'A teddy bear'],
          answer: 1,
          fact: 'The Golden Record holds music, greetings in 55 languages, and sounds of Earth!'
        },
        {
          q: 'Where are Voyager 1 and Voyager 2 flying right now?',
          options: ['Around the Moon', 'Inside Mars', 'In Interstellar Space!'],
          answer: 2,
          fact: 'Both twins crossed beyond the Sun’s protective bubble into interstellar space!'
        }
      ]
    },
    zh: {
      chapters: [
        ['#mission', '🚀 認識雙胞胎'],
        ['#kid-signal', '📡 呼叫太空船'],
        ['#solar-map', '🪐 太陽系地圖'],
        ['#golden-record', '🎵 宇宙金唱片'],
        ['#gallery', '📸 太空相簿'],
        ['#kid-quiz-section', '🏆 太空小測驗']
      ],
      heroSpeechV1: '哈囉！我在好遠的宇宙！',
      heroSpeechV2: '我拜訪過 4 顆大行星喔！',
      distTitle: '🤯 這麼遠到底有多遠？',
      distSub: '宇宙的數字超大！來看看航海家 1 號飛了多遠，用小朋友聽得懂的方式比一比：',
      distMoonLabel: '趟去月球的距離',
      distEarthLabel: '圈繞著地球飛',
      distPlaneLabel: '年搭飛機不休息',
      signalTitle: '📡 嗶嗶！發送訊號給航海家！',
      signalSub: '選一艘太空船，按下大按鈕，用「光速」從地球發送一聲「哈囉！」過去吧！',
      signalPickV1: '🛰️ 航海家 1 號',
      signalPickV2: '🛰️ 航海家 2 號',
      signalBtn: '📡 立刻發送「哈囉！」',
      signalSending: '⚡ 訊號正以光速飛越深空中…',
      signalReady: '按下按鈕，從地球發射你的太空無線電波！',
      signalResult: (name, oneWay, roundTrip) =>
        `成功送達 ${name}！在真實世界裡，這聲「哈囉！」單程要飛 ${oneWay}，等它回傳「你好！」來回要 ${roundTrip} 喔！`,
      quizTitle: '🏆 太空探險家小測驗！',
      quizSub: '答對 4 題趣味問題，收集全部 4 枚太空貼紙徽章！',
      quizReset: '🔄 再玩一次測驗',
      quizScore: (n, total) => `已解鎖徽章：${n} / ${total}`,
      quizAllDone: '🎉 太棒了！你已經成為正式的「星際小艦長」囉！',
      curiousSummary: '🔭 給好奇寶寶與家長的進階資料（完整比較表、科學儀器與 NASA 來源）',
      badges: ['🚀 發射小見習', '🪐 行星跳跳虎', '🎵 宇宙小 DJ', '⭐ 星際小艦長'],
      questions: [
        {
          q: '航海家 1 號與 2 號雙胞胎是在哪一年從地球發射升空的？',
          options: ['1977 年', '2005 年', '1999 年'],
          answer: 0,
          fact: '它們兩位都是在 1977 年出發的，已經在太空飛了將近 50 年！'
        },
        {
          q: '哪一艘太空船是史上唯一拜訪過木星、土星、天王星、海王星 4 顆巨行星的探險家？',
          options: ['航海家 1 號', '航海家 2 號', '阿波羅 11 號'],
          answer: 1,
          fact: '航海家 2 號完成了超厲害的「外太陽系大巡禮」，一口氣拍下 4 顆巨行星！'
        },
        {
          q: '航海家身上帶著什麼特別的「地球名片」，準備送給可能遇見的外星朋友？',
          options: ['一片大披薩', '宇宙金唱片', '一隻泰迪熊'],
          answer: 1,
          fact: '金唱片裡收錄了 55 種語言的問候、各國音樂與地球上的自然聲音！'
        },
        {
          q: '航海家 1 號與 2 號現在正在哪裡飛行？',
          options: ['繞著月球轉', '在火星裡面', '在星際空間裡！'],
          answer: 2,
          fact: '兩艘雙胞胎都已經飛出太陽風泡泡，正在遙遠的星際空間探險！'
        }
      ]
    },
    es: {
      chapters: [
        ['#mission', '🚀 Los Gemelos'],
        ['#kid-signal', '📡 Enviar Señal'],
        ['#solar-map', '🪐 Mapa Espacial'],
        ['#golden-record', '🎵 Disco de Oro'],
        ['#gallery', '📸 Fotos del Espacio'],
        ['#kid-quiz-section', '🏆 Quiz Espacial']
      ],
      heroSpeechV1: '¡Hola desde muy lejos!',
      heroSpeechV2: '¡Visité 4 planetas gigantes!',
      distTitle: '🤯 ¿Qué Tan Lejos Es Eso?',
      distSub: '¡Los números del espacio son enormes! Mira cuánto ha volado Voyager 1:',
      distMoonLabel: 'Viajes a la Luna',
      distEarthLabel: 'Vueltas a la Tierra',
      distPlaneLabel: 'Años en avión sin parar',
      signalTitle: '📡 ¡Bip! ¡Envía un Mensaje a Voyager!',
      signalSub: 'Elige una nave y presiona el botón para enviar un "¡Hola!" a la velocidad de la luz.',
      signalPickV1: '🛰️ Voyager 1',
      signalPickV2: '🛰️ Voyager 2',
      signalBtn: '📡 Enviar "¡Hola!"',
      signalSending: '⚡ Viajando a la velocidad de la luz…',
      signalReady: '¡Presiona el botón para lanzar tu señal desde la Tierra!',
      signalResult: (name, oneWay, roundTrip) =>
        `¡Mensaje entregado a ${name}! En la vida real tarda ${oneWay} en llegar y ${roundTrip} en volver.`,
      quizTitle: '🏆 ¡Quiz de Explorador Espacial!',
      quizSub: '¡Responde 4 preguntas divertidas y desbloquea las 4 insignias!',
      quizReset: '🔄 Jugar de nuevo',
      quizScore: (n, total) => `Insignias: ${n} / ${total}`,
      quizAllDone: '🎉 ¡Genial! ¡Eres un Capitán Interestelar oficial!',
      curiousSummary: '🔭 Rincón para Niños Curiosos y Padres (Tablas, Instrumentos y Fuentes NASA)',
      badges: ['🚀 Cadete', '🪐 Saltaplanetas', '🎵 DJ Cósmico', '⭐ Capitán Estelar'],
      questions: [
        {
          q: '¿En qué año despegaron Voyager 1 y Voyager 2?',
          options: ['1977', '2005', '1999'],
          answer: 0,
          fact: '¡Ambas naves despegaron en 1977, hace casi 50 años!'
        },
        {
          q: '¿Qué Voyager visitó los 4 planetas gigantes (Júpiter, Saturno, Urano y Neptuno)?',
          options: ['Voyager 1', 'Voyager 2', 'Apolo 11'],
          answer: 1,
          fact: '¡Voyager 2 es la única nave que ha visitado los cuatro planetas gigantes!'
        },
        {
          q: '¿Qué regalo especial llevan las naves Voyager para posibles extraterrestres?',
          options: ['Una pizza gigante', 'El Disco de Oro', 'Un oso de peluche'],
          answer: 1,
          fact: '¡El Disco de Oro lleva música, saludos en 55 idiomas y sonidos de la Tierra!'
        },
        {
          q: '¿Dónde están volando Voyager 1 y Voyager 2 ahora mismo?',
          options: ['Cerca de la Luna', 'Dentro de Marte', '¡En el espacio interestelar!'],
          answer: 2,
          fact: '¡Ambas salieron de la burbuja del Sol hacia el espacio interestelar!'
        }
      ]
    },
    ja: {
      chapters: [
        ['#mission', '🚀 ふたごの探査機'],
        ['#kid-signal', '📡 しんごう送信'],
        ['#solar-map', '🪐 うちゅうマップ'],
        ['#golden-record', '🎵 ゴールデンレコード'],
        ['#gallery', '📸 うちゅう写真'],
        ['#kid-quiz-section', '🏆 うちゅうクイズ']
      ],
      heroSpeechV1: 'とおい宇宙からこんにちは！',
      heroSpeechV2: '4つの巨大わくせいを見たよ！',
      distTitle: '🤯 どれくらい遠いの？',
      distSub: '宇宙のきょりはすごく大きいよ！ボイジャー1号が飛んだきょりをくらべてみよう：',
      distMoonLabel: '回 月まで行けるきょり',
      distEarthLabel: '周 地球をまわるきょり',
      distPlaneLabel: '年 飛行機で飛びつづける時間',
      signalTitle: '📡 ピピッ！ボイジャーにメッセージを送ろう！',
      signalSub: '探査機をえらんで大きなボタンをおすと、光の速さで「こんにちは！」を送れるよ。',
      signalPickV1: '🛰️ ボイジャー1号',
      signalPickV2: '🛰️ ボイジャー2号',
      signalBtn: '📡 「こんにちは！」を送る',
      signalSending: '⚡ 光の速さで宇宙を飛んでいます…',
      signalReady: 'ボタンをおして、地球からでんぱを飛ばそう！',
      signalResult: (name, oneWay, roundTrip) =>
        `${name} にとどいたよ！ほんとうの宇宙では片道 ${oneWay}、返事まで往復 ${roundTrip} かかるんだ！`,
      quizTitle: '🏆 うちゅう探検クイズ！',
      quizSub: '4つのクイズに答えて、キラキラの宇宙バッジをぜんぶ集めよう！',
      quizReset: '🔄 もういちど挑戦',
      quizScore: (n, total) => `あつめたバッジ：${n} / ${total}`,
      quizAllDone: '🎉 やったね！きみは今日から「うちゅう船長」だ！',
      curiousSummary: '🔭 もっと知りたいキッズ＆おとなコーナー（くわしい表・観測機器・NASA資料）',
      badges: ['🚀 ロケット見習い', '🪐 わくせい博士', '🎵 うちゅうDJ', '⭐ うちゅう船長'],
      questions: [
        {
          q: 'ボイジャー1号と2号は、何年に地球から打ち上げられたかな？',
          options: ['1977年', '2005年', '1999年'],
          answer: 0,
          fact: '2機とも1977年に旅立ち、もう50年ちかく宇宙を飛びつづけています！'
        },
        {
          q: '木星・土星・天王星・海王星の4つの巨大わくせいを全部まわったのはどっち？',
          options: ['ボイジャー1号', 'ボイジャー2号', 'アポロ11号'],
          answer: 1,
          fact: 'ボイジャー2号は4つの巨大わくせいを全部おとずれた世界で唯一の探査機だよ！'
        },
        {
          q: 'ボイジャーが宇宙人へのプレゼントとして積んでいる特別なものは？',
          options: ['大きなピザ', 'ゴールデンレコード', 'くまのぬいぐるみ'],
          answer: 1,
          fact: '55の言葉のあいさつや音楽、地球の自然の音がレコードに入っているよ！'
        },
        {
          q: 'いまボイジャー1号と2号はどこを飛んでいる？',
          options: ['月のまわり', '火星のなか', '星間空間（せいかんくうかん）！'],
          answer: 2,
          fact: '太陽のあわを飛び出して、星と星のあいだの広い宇宙を旅しているよ！'
        }
      ]
    }
  };

  function getCopy() {
    const lang = typeof getLang === 'function' ? getLang() : 'en';
    return KID_COPY[lang] || KID_COPY.en;
  }

  // ============ 1. Chapter Sticker Bar & Hero Speech ============
  function renderKidChrome() {
    const c = getCopy();
    const nav = document.getElementById('kid-chapter-bar');
    if (nav) {
      const frag = document.createDocumentFragment();
      c.chapters.forEach(([href, label], idx) => {
        const a = document.createElement('a');
        a.href = href;
        a.className = `chapter-pill chapter-pill--${idx + 1}`;
        a.textContent = label;
        frag.appendChild(a);
      });
      nav.replaceChildren(frag);
    }

    const s1 = document.getElementById('hero-speech-v1');
    const s2 = document.getElementById('hero-speech-v2');
    if (s1) s1.textContent = c.heroSpeechV1;
    if (s2) s2.textContent = c.heroSpeechV2;

    const curious = document.getElementById('curious-summary-text');
    if (curious) curious.textContent = c.curiousSummary;
  }

  // ============ 2. Kid Distance Translator ============
  function renderKidDistanceFun() {
    const wrap = document.getElementById('kid-distance-fun');
    if (!wrap || !window.VOYAGER_DATA || !VOYAGER_DATA.voyager1) return;
    const c = getCopy();
    const lang = getLang();
    const est = currentEstimate(VOYAGER_DATA.voyager1);
    const loc = typeof localeCode === 'function' ? localeCode(lang) : 'en-US';

    const moonTrips = Math.round(est.km / 384400).toLocaleString(loc);
    const earthLaps = Math.round(est.km / 40075).toLocaleString(loc);
    const jetYears = Math.round(est.km / (900 * 24 * 365.25)).toLocaleString(loc);

    const h3 = document.createElement('h3');
    h3.className = 'kid-subhead';
    h3.textContent = c.distTitle;

    const sub = document.createElement('p');
    sub.className = 'kid-subcopy';
    sub.textContent = c.distSub;

    const grid = document.createElement('div');
    grid.className = 'fun-fact-grid';
    const cards = [
      ['🌙', moonTrips, c.distMoonLabel, 'fun-card--moon'],
      ['🌍', earthLaps, c.distEarthLabel, 'fun-card--earth'],
      ['✈️', jetYears, c.distPlaneLabel, 'fun-card--plane']
    ];
    cards.forEach(([emoji, num, label, cls]) => {
      const card = document.createElement('div');
      card.className = `fun-card ${cls}`;
      const icon = document.createElement('div');
      icon.className = 'fun-card__emoji';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = emoji;
      const val = document.createElement('div');
      val.className = 'fun-card__num';
      val.textContent = num;
      const lbl = document.createElement('div');
      lbl.className = 'fun-card__label';
      lbl.textContent = label;
      card.append(icon, val, lbl);
      grid.appendChild(card);
    });

    wrap.replaceChildren(h3, sub, grid);
  }

  // ============ 3. Interactive Radio Signal Simulator ============
  let signalTarget = 'voyager1';
  let signalTimer = null;

  function renderSignalGame() {
    const root = document.getElementById('kid-signal-game');
    if (!root) return;
    const c = getCopy();

    const title = document.getElementById('kid-signal-title');
    const sub = document.getElementById('kid-signal-sub');
    if (title) title.textContent = c.signalTitle;
    if (sub) sub.textContent = c.signalSub;

    const picker = document.createElement('div');
    picker.className = 'signal-picker';
    picker.setAttribute('role', 'group');

    [
      ['voyager1', c.signalPickV1],
      ['voyager2', c.signalPickV2]
    ].forEach(([id, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `signal-pick-btn${signalTarget === id ? ' active' : ''}`;
      btn.setAttribute('aria-pressed', signalTarget === id ? 'true' : 'false');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        signalTarget = id;
        renderSignalGame();
      });
      picker.appendChild(btn);
    });

    const stage = document.createElement('div');
    stage.className = 'signal-stage';

    const earth = document.createElement('div');
    earth.className = 'signal-node';
    earth.innerHTML = '<span class="signal-node__emoji" aria-hidden="true">🌍</span><span>Earth</span>';

    const track = document.createElement('div');
    track.className = 'signal-track';
    const wave = document.createElement('div');
    wave.className = 'signal-wave';
    wave.id = 'kid-signal-wave';
    wave.setAttribute('aria-hidden', 'true');
    wave.textContent = '📡';
    track.appendChild(wave);

    const craft = document.createElement('div');
    craft.className = 'signal-node';
    const craftName = signalTarget === 'voyager1' ? 'Voyager 1' : 'Voyager 2';
    craft.innerHTML = `<span class="signal-node__emoji" aria-hidden="true">🛰️</span><span>${craftName}</span>`;

    stage.append(earth, track, craft);

    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.className = 'kid-big-btn';
    sendBtn.textContent = c.signalBtn;

    const status = document.createElement('p');
    status.className = 'signal-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = c.signalReady;

    sendBtn.addEventListener('click', () => {
      if (signalTimer) clearTimeout(signalTimer);
      wave.classList.remove('is-flying');
      void wave.offsetWidth;
      wave.classList.add('is-flying');
      status.textContent = c.signalSending;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const delay = reduceMotion ? 150 : 1250;
      signalTimer = setTimeout(() => {
        const lang = getLang();
        const v = window.VOYAGER_DATA && VOYAGER_DATA[signalTarget];
        if (v) {
          const est = currentEstimate(v);
          const name = v.name[lang] || v.name.en;
          status.textContent = c.signalResult(
            name,
            formatHours(est.delayOneWay, lang),
            formatHours(est.delayRoundTrip, lang)
          );
        }
      }, delay);
    });

    root.replaceChildren(picker, stage, sendBtn, status);
  }

  // ============ 4. Interactive Space Explorer Quiz ============
  const quizAnswers = {};

  function renderQuiz() {
    const root = document.getElementById('kid-quiz');
    if (!root) return;
    const c = getCopy();

    const title = document.getElementById('kid-quiz-title');
    const sub = document.getElementById('kid-quiz-sub');
    if (title) title.textContent = c.quizTitle;
    if (sub) sub.textContent = c.quizSub;

    const correctCount = c.questions.reduce(
      (sum, q, idx) => sum + (quizAnswers[idx] === q.answer ? 1 : 0),
      0
    );

    const badgeBar = document.createElement('div');
    badgeBar.className = 'badge-shelf';
    c.badges.forEach((bLabel, idx) => {
      const unlocked = quizAnswers[idx] === c.questions[idx].answer;
      const b = document.createElement('div');
      b.className = `sticker-badge${unlocked ? ' is-unlocked' : ''}`;
      b.textContent = unlocked ? bLabel : '🔒 ???';
      badgeBar.appendChild(b);
    });

    const scoreLine = document.createElement('p');
    scoreLine.className = 'quiz-score-line';
    scoreLine.setAttribute('aria-live', 'polite');
    scoreLine.textContent =
      correctCount === c.questions.length
        ? c.quizAllDone
        : c.quizScore(correctCount, c.questions.length);

    const list = document.createElement('div');
    list.className = 'quiz-grid';

    c.questions.forEach((item, qIdx) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';

      const qText = document.createElement('h3');
      qText.className = 'quiz-card__q';
      qText.textContent = `${qIdx + 1}. ${item.q}`;

      const opts = document.createElement('div');
      opts.className = 'quiz-options';

      const chosen = quizAnswers[qIdx];
      item.options.forEach((optText, oIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        if (chosen !== undefined) {
          if (oIdx === item.answer) btn.classList.add('is-correct');
          else if (oIdx === chosen) btn.classList.add('is-wrong');
        }
        btn.textContent = optText;
        btn.addEventListener('click', () => {
          quizAnswers[qIdx] = oIdx;
          renderQuiz();
        });
        opts.appendChild(btn);
      });

      card.append(qText, opts);

      if (chosen !== undefined) {
        const fact = document.createElement('p');
        fact.className = `quiz-fact ${chosen === item.answer ? 'is-right' : 'is-try'}`;
        fact.textContent = (chosen === item.answer ? '✅ ' : '💡 ') + item.fact;
        card.appendChild(fact);
      }

      list.appendChild(card);
    });

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'quiz-reset-btn';
    resetBtn.textContent = c.quizReset;
    resetBtn.addEventListener('click', () => {
      Object.keys(quizAnswers).forEach((k) => delete quizAnswers[k]);
      renderQuiz();
    });

    root.replaceChildren(badgeBar, scoreLine, list, resetBtn);
  }

  function renderAllKidAdventure() {
    renderKidChrome();
    renderKidDistanceFun();
    renderSignalGame();
    renderQuiz();
  }

  document.addEventListener('langchange', renderAllKidAdventure);
  window.addEventListener('DOMContentLoaded', () => {
    renderAllKidAdventure();
    // Refresh distance comparisons once NASA JSON finishes loading
    const poll = setInterval(() => {
      if (window.VOYAGER_DATA && VOYAGER_DATA.voyager1) {
        renderKidDistanceFun();
        clearInterval(poll);
      }
    }, 250);
    setTimeout(() => clearInterval(poll), 8000);
  });
})();
