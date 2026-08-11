// 가짜 번역 사전
const DICT = {
  '안녕하세요. 만나서 반갑습니다.': {
    en: 'Hello. Nice to meet you.',
    ja: 'こんにちは。お会いできて嬉しいです。',
    zh: '你好。很高兴见到你。',
    vi: 'Xin chào. Rất vui được gặp bạn.',
    es: 'Hola. Encantado de conocerte.',
  },
  '이 도서관까지 어떻게 가나요?': {
    en: 'How do I get to this library?',
    ja: 'この図書館にはどうやって行きますか？',
    zh: '怎么去这个图书馆？',
    vi: 'Làm thế nào để đến thư viện này?',
    es: '¿Cómo llego a esta biblioteca?',
  },
  '회의는 오후 3시에 시작합니다.': {
    en: 'The meeting starts at 3 PM.',
    ja: '会議は午後3時に始まります。',
    zh: '会议下午3点开始。',
    vi: 'Cuộc họp bắt đầu lúc 3 giờ chiều.',
    es: 'La reunión comienza a las 3 PM.',
  },
  '이 음식 정말 맛있어요!': {
    en: 'This food is really delicious!',
    ja: 'この料理、本当においしいです！',
    zh: '这道菜真好吃！',
    vi: 'Món ăn này thực sự rất ngon!',
    es: '¡Esta comida está realmente deliciosa!',
  },
};

const LANG_LABEL = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文', vi: 'Tiếng Việt', es: 'Español', auto: '자동 감지' };

const src = document.getElementById('src');
const dst = document.getElementById('dst');
const fromSel = document.getElementById('from');
const toSel = document.getElementById('to');
const fromLabel = document.getElementById('fromLabel');
const toLabel = document.getElementById('toLabel');
const cc = document.getElementById('cc');
const conf = document.getElementById('conf');
const alt = document.getElementById('alt');
const dict = document.getElementById('dict');

let typeTimer = null;
let debounce = null;

function translate(text) {
  if (!text.trim()) {
    dst.innerHTML = '<span class="placeholder">번역 결과가 여기에 표시됩니다.</span>';
    conf.textContent = '신뢰도: -';
    alt.textContent = '텍스트를 번역하면 대체 표현을 추천해드립니다.';
    dict.innerHTML = '<li class="muted">번역된 텍스트의 주요 단어를 분석합니다.</li>';
    return;
  }

  const lang = toSel.value;
  const result = DICT[text.trim()]?.[lang] || `[${LANG_LABEL[lang]} 번역] ${text}`;

  clearInterval(typeTimer);
  dst.innerHTML = '';
  const p = document.createElement('span');
  p.className = 'cursor';
  dst.appendChild(p);

  let i = 0;
  typeTimer = setInterval(() => {
    p.textContent = result.slice(0, ++i);
    if (i >= result.length) {
      clearInterval(typeTimer);
      p.classList.remove('cursor');
      conf.textContent = `신뢰도: ${(85 + Math.random() * 13).toFixed(1)}%`;
      showAlt(result);
      showDict(text);
    }
  }, 25);
}

function showAlt(result) {
  const variants = [
    `격식체: ${result}`,
    `구어체: ${result.replace(/\.$/, '!')}`,
  ];
  alt.innerHTML = variants.join('<br/>');
}

function showDict(text) {
  const words = text.split(/[\s.,!?]+/).filter(Boolean).slice(0, 4);
  dict.innerHTML = words.map((w, i) => `<li><b>${w}</b><span>주요 단어 ${i + 1}</span></li>`).join('');
}

src.addEventListener('input', () => {
  cc.textContent = src.value.length;
  clearTimeout(debounce);
  debounce = setTimeout(() => translate(src.value), 400);
});
toSel.addEventListener('change', () => { toLabel.textContent = LANG_LABEL[toSel.value]; translate(src.value); });
fromSel.addEventListener('change', () => { fromLabel.textContent = LANG_LABEL[fromSel.value]; });

document.getElementById('swap').addEventListener('click', () => {
  if (fromSel.value === 'auto') return;
  const f = fromSel.value, t = toSel.value;
  fromSel.value = t; toSel.value = f;
  fromLabel.textContent = LANG_LABEL[t]; toLabel.textContent = LANG_LABEL[f];
  src.value = dst.textContent.startsWith('[') ? '' : dst.textContent;
  translate(src.value);
  cc.textContent = src.value.length;
});

document.getElementById('clearBtn').addEventListener('click', () => { src.value = ''; cc.textContent = 0; translate(''); });
document.getElementById('copyBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(dst.textContent); alert('복사되었어요'); } catch {}
});
document.getElementById('micBtn').addEventListener('click', () => alert('실제 환경에서는 Web Speech API를 사용합니다.'));
document.getElementById('speakBtn').addEventListener('click', () => {
  if (!('speechSynthesis' in window)) return alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
  const u = new SpeechSynthesisUtterance(dst.textContent);
  u.lang = toSel.value === 'ko' ? 'ko-KR' : toSel.value === 'ja' ? 'ja-JP' : 'en-US';
  speechSynthesis.speak(u);
});

document.querySelectorAll('.ex button').forEach((b) => {
  b.addEventListener('click', () => { src.value = b.dataset.t; cc.textContent = src.value.length; translate(src.value); });
});
