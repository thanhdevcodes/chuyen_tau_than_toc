(() => {
'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

/* ---------- dữ liệu ---------- */
const STAGES = [
  { id: 'm1', label: 'I', digit: 6 },
  { id: 'm2', label: 'II', digit: 1 },
  { id: 'p1', label: 'III', digit: null },
  { id: 'cw', label: 'IV', digit: 9 },
  { id: 'm3', label: 'V', digit: 4 },
  { id: 'm4', label: 'VI', digit: 1 },
  { id: 'circuit', label: 'MẠCH', digit: null },
  { id: 'safe', label: 'PHANH', digit: null }
];
const CODE = '11946';
const HINTS = {
  m1: ['Hàm f(n) gọi lại chính nó với n - 1 rồi cộng thêm n. Thử tính f(2), f(3) trước.', 'f(9) = 9 + 8 + 7 + … + 1 = 45. Còn lại là cộng với 1900.'],
  m2: ['Hai sự kiện sớm nhất: một là khai sinh nước Việt Nam Dân chủ Cộng hòa, một là cuộc bầu Quốc hội đầu tiên.', 'Hai sự kiện muộn nhất đều thuộc thế kỷ XXI; muộn nhất là Hiến pháp hiện hành.'],
  p1: ['Đã lật chữ cái đầu của mỗi từ trong từ khóa.', 'Đã lật thêm một nửa số chữ cái.'],
  cw: ['Cột tô vàng là chủ thể nắm mọi quyền lực nhà nước.', 'Hàng 5 là bản tuyên ngôn năm 1945.'],
  m3: ['Đáp án đúng ở ngã ba 1 có hai từ: "thống nhất" và "kiểm soát".', 'Ở ngã ba 2, không ai đứng ngoài Hiến pháp và pháp luật.'],
  m4: ['Vòng I: Đảng, Nhà nước, Nhân dân. Vòng II: đếm các vế bắt đầu bằng chữ "dân". Vòng III: lập pháp, hành pháp, tư pháp.', 'Vòng IV: đếm các tiêu chí trong mục tiêu dân giàu, nước mạnh, dân chủ, công bằng, văn minh.'],
  circuit: ['Mối nối đầu tiên: Nhân dân là chủ thể của quyền lực nhà nước.', 'Đảng Cộng sản Việt Nam lãnh đạo Nhà nước và xã hội.'],
  safe: ['Tháng viết bằng 1 chữ số, năm viết bằng 4 chữ số.', 'Mã bắt đầu bằng 1 và kết thúc bằng 6.']
};
const EASY_M1_HINTS = ['Mỗi vòng lặp cộng i vào nam, i chạy từ 1 đến 9.', '1 + 2 + … + 9 = 45.'];
const M1_CODE = {
  main: {
    image: 'code_chinh_cpp.png',
    alt: 'int f(int n) {\n    if (n <= 1) return n;\n    return f(n - 1) + n;\n}\nint main() {\n    cout << 1900 + f(9);\n}',
    lookup: 'int: số nguyên · if: nếu · return: trả giá trị về · cout <<: in ra màn hình · hàm gọi lại chính nó gọi là đệ quy'
  },
  easy: {
    image: 'code_de_cpp.png',
    alt: 'int main() {\n    int nam = 1900;\n    for (int i = 1; i < 10; i++)\n        nam += i;\n    cout << nam;\n}',
    lookup: 'for (…; …; …): lặp với i = 1, 2, …, 9 · nam += i: cộng i vào nam',
    hints: EASY_M1_HINTS
  }
};
const EVENTS = [
  ['2/9/1945', 'Tuyên ngôn độc lập, nước Việt Nam Dân chủ Cộng hòa ra đời'],
  ['6/1/1946', 'Tổng tuyển cử đầu tiên bầu Quốc hội'],
  ['9/11/1946', 'Quốc hội thông qua Hiến pháp đầu tiên'],
  ['1986', 'Đại hội VI mở đầu công cuộc Đổi mới'],
  ['2011', 'Cương lĩnh bổ sung, phát triển nêu mục tiêu dân giàu, nước mạnh, dân chủ, công bằng, văn minh'],
  ['28/11/2013', 'Quốc hội thông qua Hiến pháp hiện hành']
];
const DECK_ORDER = [3, 1, 5, 0, 4, 2];
const CW = [
  ['NHANUOC', 'NHÀNƯỚC', 0, 'Đảng lãnh đạo, ___ quản lý, Nhân dân làm chủ.'],
  ['HIENPHAP', 'HIẾNPHÁP', 0, 'Quốc hội thông qua ___ hiện hành ngày 28/11/2013.'],
  ['HANHPHAP', 'HÀNHPHÁP', 1, 'Quyền lập pháp, ___, tư pháp.'],
  ['THONGNHAT', 'THỐNGNHẤT', 3, 'Quyền lực nhà nước là ___, có phân công, phối hợp, kiểm soát.'],
  ['DOCLAP', 'ĐỘCLẬP', 0, 'Ngày 2/9/1945, Hồ Chí Minh đọc Tuyên ngôn ___.'],
  ['DANG', 'ĐẢNG', 1, '___ Cộng sản Việt Nam lãnh đạo Nhà nước.'],
  ['CONGNHAN', 'CÔNGNHÂN', 2, 'Liên minh ___ – nông dân – trí thức.']
];
const CW_KEY = 'NHANDAN';
const CW_KEY_DISPLAY = 'NHÂNDÂN';
const KEYCOL = 3;
const CWCOLS = Math.max(...CW.map(([, word, key]) => KEYCOL - key + [...word].length));
const JUNCTIONS = [
  ['Quyền lực nhà nước ở Việt Nam được tổ chức theo nguyên tắc nào?', ['Tam quyền phân lập hoàn toàn', 'Tập trung vào một cá nhân', 'Thống nhất, có phân công, phối hợp, kiểm soát'], 2],
  ['Hiến pháp và pháp luật ràng buộc ai?', ['Mọi cơ quan, tổ chức, cá nhân, kể cả cán bộ nhà nước', 'Chỉ người dân', 'Chỉ cán bộ cấp thấp'], 0],
  ['Ai có quyền giám sát hoạt động của Nhà nước?', ['Chỉ chính các cơ quan nhà nước', 'Nhân dân, cùng sự phản biện xã hội của Mặt trận Tổ quốc Việt Nam', 'Chỉ các tổ chức nước ngoài'], 1],
  ['Thực hành dân chủ phải đi đôi với điều gì?', ['Pháp chế, kỷ cương, kỷ luật', 'Nới lỏng pháp luật', 'Tách khỏi sự lãnh đạo của Đảng'], 0]
];
const LOCK = [3, 4, 3, 5];
const CIRCUIT_NODES = [
  { id: 'people', source: 'Nhân dân', target: 'Chủ thể của quyền lực nhà nước' },
  { id: 'party', source: 'Đảng Cộng sản Việt Nam', target: 'Lãnh đạo Nhà nước và xã hội' },
  { id: 'state', source: 'Nhà nước', target: 'Quản lý xã hội bằng Hiến pháp và pháp luật' },
  { id: 'powers', source: 'Lập pháp · Hành pháp · Tư pháp', target: 'Được phân công, phối hợp, kiểm soát trong quyền lực nhà nước thống nhất' }
];
const PEN = { m1: 10, m2: 20, cw: 5, m3: 15, m4: 10, circuit: 10, pic: 5, guess: 20, safe: 15, hint: 30, skip: 60 };
const PICS = {
  p1: {
    n: 1, title: 'Tấm ảnh trong tủ kính', img: 'tongtuyencu.jpg', kw: 'TỔNG TUYỂN CỬ',
    alt: ['TONGTUYENCU', 'CUOCTONGTUYENCU'],
    note: 'Cử tri đi bỏ phiếu trong cuộc Tổng tuyển cử đầu tiên ngày 6/1/1946: lần đầu tiên nhân dân thực hành quyền làm chủ.',
    qs: [
      ['Dân chủ XHCN ở Việt Nam ra đời gắn với sự kiện nào?', ['Hiệp định Giơnevơ 1954', 'Cách mạng Tháng Tám 1945', 'Đại hội VI năm 1986', 'Hiến pháp năm 2013'], 1],
      ['Nhà nước pháp quyền XHCN Việt Nam là nhà nước của ai, do ai, vì ai?', ['Của giai cấp công nhân', 'Của Đảng', 'Của Nhân dân, do Nhân dân, vì Nhân dân', 'Của đội ngũ cán bộ'], 2],
      ['Nền tảng của Nhà nước là liên minh giữa những lực lượng nào?', ['Công nhân – nông dân – đội ngũ trí thức', 'Công nhân – tư sản – địa chủ', 'Nông dân – thương nhân – quân đội', 'Công nhân – quân đội – doanh nhân'], 0],
      ['Quyền lực nhà nước ở Việt Nam được tổ chức như thế nào?', ['Tam quyền phân lập hoàn toàn', 'Tập trung vào một cá nhân', 'Các cơ quan tách rời, không phối hợp', 'Thống nhất, có phân công, phối hợp, kiểm soát giữa lập pháp, hành pháp, tư pháp'], 3],
      ['Nhà nước pháp quyền XHCN Việt Nam bảo đảm tính tối thượng của điều gì?', ['Nghị quyết của cấp ủy cơ sở', 'Hiến pháp và pháp luật', 'Quy chế nội bộ của cơ quan', 'Mệnh lệnh của người đứng đầu'], 1],
      ['Ai lãnh đạo Nhà nước pháp quyền XHCN Việt Nam?', ['Mặt trận Tổ quốc Việt Nam', 'Quốc hội', 'Đảng Cộng sản Việt Nam', 'Chính phủ'], 2],
      ['Nhà nước tôn trọng và bảo đảm điều gì?', ['Quyền con người, quyền công dân', 'Quyền của riêng cán bộ', 'Quyền của một nhóm lợi ích', 'Quyền của các tổ chức nước ngoài'], 0],
      ['Thực hành dân chủ phải đi đôi với điều gì?', ['Nới lỏng pháp luật', 'Hạn chế quyền của công dân', 'Tách khỏi sự lãnh đạo của Đảng', 'Pháp chế, kỷ cương, kỷ luật'], 3],
      ['Phương châm thực hiện dân chủ ở cơ sở là gì?', ['Dân nghe, dân biết, dân làm, dân báo cáo', 'Dân biết, dân bàn, dân làm, dân kiểm tra', 'Dân bàn, dân quyết, dân làm, dân thụ hưởng', 'Dân biết, dân làm, dân hưởng, dân giám sát'], 1]
    ]
  }
};
const NOTES = {
  m1: '1945: Cách mạng Tháng Tám thành công, ngày 2/9/1945 Chủ tịch Hồ Chí Minh đọc Tuyên ngôn độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa, nhà nước dân chủ nhân dân đầu tiên ở Đông Nam Á. Từ đây hình thành cơ chế vận hành: Đảng lãnh đạo, Nhà nước quản lý, Nhân dân làm chủ.',
  m2: 'Từ Cách mạng Tháng Tám 1945, qua Tổng tuyển cử và Hiến pháp 1946, đến Đổi mới và Hiến pháp 2013: nền dân chủ và nhà nước pháp quyền được xây dựng, hoàn thiện dần.',
  cw: 'Từ khóa hàng dọc: NHÂN DÂN. Tất cả quyền lực nhà nước thuộc về Nhân dân.',
  m3: 'Quyền lực nhà nước là thống nhất, có phân công, phối hợp, kiểm soát, không theo mô hình tam quyền phân lập. Hiến pháp và pháp luật ràng buộc mọi cơ quan, tổ chức, cá nhân. Nhân dân giám sát Nhà nước. Dân chủ đi đôi với pháp chế, kỷ cương, kỷ luật.',
  m4: 'Ổ khóa đã mở. Nối mạch quyền lực để cấp điện cho hộp phanh.',
  circuit: 'Mạch quyền lực đã thông. Tất cả quyền lực nhà nước thuộc về Nhân dân; quyền lực thống nhất, có phân công, phối hợp và kiểm soát.'
};
const ROT = ['-6deg', '4deg', '-3deg', '7deg', '-4deg'];
const ROMAN = ['I', 'II', 'III', 'IV'];
const sidx = id => STAGES.findIndex(stage => stage.id === id);
const cur = () => STAGES[S.stage].id;
const isPic = id => Object.hasOwn(PICS, id);
const norm = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'D').toUpperCase().replace(/[^A-Z0-9]/g, '');

/* ---------- trạng thái ---------- */
const fresh = () => ({
  screen: 'intro', total: 720, left: 720, running: false, paused: false, stage: 0,
  done: {}, hints: {}, errors: 0, m1: false, m1Easy: false, m2: [], cw: Array(CW.length).fill(false), cwSel: 0,
  m3: { index: 0, order: [], locked: [], busy: false, movingSlot: null }, m4: [0, 0, 0, 0], pic: { p1: { t: Array(9).fill('c'), sel: null, lock: false, wrong: Array.from({ length: 9 }, () => []) } },
  circuit: { selected: null, connected: [], targetOrder: [], hintPair: null },
  code: '', muted: false, reward: null
});
let S = fresh();
const H = id => S.hints[id] || 0;
const hintsFor = id => id === 'm1' && S.m1Easy ? EASY_M1_HINTS : HINTS[id];

/* ---------- âm thanh (tổng hợp trực tiếp, không cần tệp âm thanh) ---------- */
let AC = null;
const ac = () => {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
  } catch (error) { AC = null; }
  return AC;
};
function tone(frequency, duration, type = 'sine', volume = .2, delay = 0, endFrequency = null) {
  const context = ac(); if (!context || S.muted) return;
  const time = context.currentTime + delay, oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, time);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
  gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
  oscillator.connect(gain).connect(context.destination); oscillator.start(time); oscillator.stop(time + duration + .05);
}
function noise(duration, volume = .3, delay = 0, lowpass = 900) {
  const context = ac(); if (!context || S.muted) return;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate), samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
  const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
  filter.type = 'lowpass'; filter.frequency.value = lowpass; gain.gain.value = volume; source.buffer = buffer;
  source.connect(filter).connect(gain).connect(context.destination); source.start(context.currentTime + delay);
}
const sfx = {
  tick: () => tone(1900, .03, 'square', .025),
  heart: () => { tone(70, .14, 'sine', .5); tone(62, .16, 'sine', .4, .18); },
  ok: () => { tone(660, .18, 'triangle', .25); tone(990, .3, 'triangle', .25, .12); },
  bad: () => { tone(150, .4, 'sawtooth', .18, 0, 90); noise(.25, .15); },
  stamp: () => { noise(.18, .6, 0, 400); tone(90, .25, 'sine', .5); },
  clunk: () => { noise(.12, .5, 0, 600); tone(120, .15, 'square', .15); noise(.12, .5, .25, 600); tone(100, .15, 'square', .15, .25); },
  whistle: () => {
    const context = ac(); if (!context || S.muted) return;
    const time = context.currentTime, gain = context.createGain(), filter = context.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 1800;
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.16, time + .5);
    gain.gain.setValueAtTime(.16, time + 2.2); gain.gain.linearRampToValueAtTime(0, time + 3);
    [392, 494, 587].forEach(frequency => {
      const oscillator = context.createOscillator(); oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency * .8, time); oscillator.frequency.linearRampToValueAtTime(frequency, time + .5);
      oscillator.connect(filter); oscillator.start(time); oscillator.stop(time + 3.1);
    });
    filter.connect(gain).connect(context.destination);
  },
  alarm: () => {
    const context = ac(); if (!context || S.muted) return;
    const time = context.currentTime, oscillator = context.createOscillator(), lfo = context.createOscillator();
    const lfoGain = context.createGain(), gain = context.createGain();
    oscillator.frequency.value = 1150; lfo.frequency.value = 5; lfoGain.gain.value = 440;
    lfo.connect(lfoGain).connect(oscillator.frequency);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.12, time + .05);
    [[.6, .5], [.75, .12], [1.4, .12], [1.5, 0]].forEach(([offset, value]) => gain.gain.linearRampToValueAtTime(value, time + offset));
    oscillator.connect(gain).connect(context.destination); oscillator.start(time); lfo.start(time);
    oscillator.stop(time + 1.6); lfo.stop(time + 1.6);
  }
};

/* ---------- hiển thị chung ---------- */
const fmt = seconds => {
  seconds = Math.max(0, Math.ceil(seconds));
  return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
};
function renderClock() {
  $('#clock').textContent = fmt(S.left);
  const progress = S.screen === 'intro' ? 0 : Math.min(1, Math.max(0, 1 - S.left / S.total));
  $('#threat').style.width = `${progress * 100}%`;
  const rail = $('.threat'), train = $('#train'), inset = Math.min(train.offsetWidth / 2, rail.clientWidth / 2);
  train.style.left = `${inset + progress * (rail.clientWidth - inset * 2)}px`;
  document.body.classList.toggle('danger', S.screen === 'play' && S.left <= 60);
}
function renderTrack() {
  $('#track').innerHTML = STAGES.map((stage, index) => {
    const got = !!S.done[stage.id] && stage.id !== 'safe';
    const now = S.screen === 'play' && S.stage === index;
    const title = isPic(stage.id) ? 'Tấm ảnh' : stage.id === 'safe' ? 'Hộp phanh' : stage.id === 'circuit' ? 'Nối mạch quyền lực' : `Mật mã ${stage.label}`;
    const marker = stage.label;
    return `<li class="${got ? 'got' : ''} ${now ? 'now' : ''} ${stage.id === 'safe' ? 'safe' : ''} ${isPic(stage.id) ? 'pic' : ''}" title="${title}">${marker}</li>`;
  }).join('');
}
function renderHints() {
  $$('[data-hints]').forEach(element => {
    const id = element.dataset.hints;
    element.innerHTML = hintsFor(id).slice(0, H(id)).map(text => `<div class="hint">${text}</div>`).join('');
  });
  const id = cur(), button = $('#hintBtn');
  button.disabled = S.screen !== 'play' || S.paused || H(id) >= hintsFor(id).length;
  button.style.opacity = button.disabled ? '.45' : '1';
}
function setScreen(name) {
  S.screen = name;
  $$('[data-screen]').forEach(element => { element.hidden = element.dataset.screen !== name; });
  renderTrack(); renderClock(); renderHints();
}
function shake(element) {
  if (!element) return;
  element.classList.remove('shake'); void element.offsetWidth; element.classList.add('shake');
}
function say(target, text, bad = false) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return;
  element.textContent = text; element.classList.toggle('bad', !!bad);
}
function penalty(seconds, isHint = false) {
  S.left = Math.max(0, S.left - seconds);
  if (!isHint) { S.errors++; sfx.bad(); }
  const effect = document.createElement('div');
  effect.className = 'penfx'; effect.textContent = `−${seconds} giây`;
  $('#clockbox').appendChild(effect); setTimeout(() => effect.remove(), 1400);
  renderClock(); if (S.left <= 0) lose();
}

/* ---------- từng chặng ---------- */
const RENDER = {
  m1: renderM1, m2: renderM2, p1: () => renderPic('p1'),
  cw: renderCW, m3: renderJunction, m4: renderM4, circuit: renderCircuit, safe: renderSafe
};
function enterStage(index) {
  S.stage = index;
  const id = STAGES[index].id;
  $$('[data-stage]').forEach(element => { element.hidden = element.dataset.stage !== id; });
  renderTrack(); renderHints(); RENDER[id]();
}
function solve(id) {
  if (S.done[id] || S.screen !== 'play') return;
  S.done[id] = true; S.paused = true; sfx.ok(); renderTrack(); renderHints();
  if (isPic(id)) { S.pic[id].t = S.pic[id].t.map(() => 'o'); S.pic[id].sel = null; renderPic(id); }
  setTimeout(() => { if (S.screen === 'play' && S.done[id]) showReward(id); }, isPic(id) ? 1200 : 650);
}
function showReward(id) {
  if (S.screen !== 'play') return;
  S.reward = id;
  const stage = STAGES[sidx(id)], picture = PICS[id];
  const hasDigit = stage.digit != null;
  $('#rwTitle').textContent = picture ? 'Tấm ảnh đã giải' : id === 'circuit' ? 'Mạch quyền lực đã nối' : `Mật mã ${stage.label} đã giải`;
  $('#rwDigit').hidden = !hasDigit; $('#rwPic').hidden = !picture; $('#rwKw').hidden = !picture;
  if (picture) {
    $('#rwPic').src = picture.img; $('#rwPic').alt = picture.title;
    $('#rwKw').textContent = picture.kw;
  } else if (hasDigit) $('#rwDigit').textContent = stage.digit;
  $('#rwNote').textContent = picture ? picture.note : NOTES[id];
  $('#rwNext').textContent = STAGES[sidx(id) + 1].id === 'safe' ? 'Tới hộp phanh ▸' : 'Chặng tiếp theo ▸';
  $('#reward').hidden = false; sfx.stamp(); $('#rwNext').focus();
}
function closeReward() {
  const id = S.reward; if (id == null) return;
  S.reward = null; $('#reward').hidden = true; S.paused = false;
  enterStage(sidx(id) + 1); renderHints();
}

function renderM1() {
  const code = S.m1Easy ? M1_CODE.easy : M1_CODE.main;
  $('#m1CodeImage').src = code.image;
  $('#m1CodeImage').alt = code.alt;
  $('#m1QuickRef').textContent = code.lookup;
  $('#m1Difficulty').textContent = S.m1Easy ? 'Đổi về đề chính' : 'Đổi sang đề dễ';
  $('#m1A').readOnly = S.m1; $('#m1A').classList.toggle('ok', S.m1);
  if (S.m1) $('#m1A').value = '1945';
  else if (S.screen === 'play' && cur() === 'm1') setTimeout(() => $('#m1A').focus(), 50);
}
$('#m1A').addEventListener('input', event => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
});
$('#m1Form').addEventListener('submit', event => {
  event.preventDefault(); if (S.done.m1) return;
  if ($('#m1A').value.trim() === '1945') {
    S.m1 = true; sfx.ok(); say('#m1Msg', 'Giải đúng!'); renderM1(); solve('m1');
  } else {
    shake($('#m1A')); say('#m1Msg', 'Sai rồi! Hãy tính lại kết quả đoạn mã.', true); penalty(PEN.m1); $('#m1A').select();
  }
});

function renderM2() {
  const count = S.m2.length, done = !!S.done.m2;
  $('#rail').innerHTML = EVENTS.map((event, index) => {
    if (index >= count) return `<div class="slot">${index + 1}</div>`;
    const key = S.m2[index], letter = 'ABCDEF'[DECK_ORDER.indexOf(key)];
    return `<div class="slot filled"><button type="button" class="card placed" data-k="${key}"><span class="tag">${letter}</span><span class="ord">${index + 1}</span>${done ? `<span class="yr">${EVENTS[key][0]}</span>` : ''}${EVENTS[key][1]}</button></div>`;
  }).join('');
  $('#deck').innerHTML = DECK_ORDER.map(key => {
    if (S.m2.includes(key)) return '<span class="card gone" aria-hidden="true"></span>';
    return `<button type="button" class="card" data-k="${key}"><span class="tag">${'ABCDEF'[DECK_ORDER.indexOf(key)]}</span>${EVENTS[key][1]}</button>`;
  }).join('');
  $('#m2Submit').disabled = done || count < EVENTS.length;
  $('#m2Submit').style.opacity = $('#m2Submit').disabled ? '.45' : '1';
  $('#m2Clear').hidden = done;
}
$('#deck').addEventListener('click', event => {
  const button = event.target.closest('button.card'); if (!button || S.done.m2) return;
  S.m2.push(Number(button.dataset.k)); tone(520, .08, 'triangle', .15); say('#m2Msg', ''); renderM2();
});
$('#rail').addEventListener('click', event => {
  const button = event.target.closest('button.card'); if (!button || S.done.m2) return;
  S.m2 = S.m2.filter(key => key !== Number(button.dataset.k)); tone(380, .08, 'triangle', .12); renderM2();
});
$('#m2Clear').addEventListener('click', () => { if (!S.done.m2) { S.m2 = []; renderM2(); } });
$('#m2Submit').addEventListener('click', () => {
  if (S.done.m2 || S.m2.length < EVENTS.length) return;
  if (S.m2.every((key, index) => key === index)) {
    renderM2(); say('#m2Msg', 'Đúng toàn bộ thứ tự!'); solve('m2');
  } else {
    shake($('#rail')); S.m2 = []; renderM2(); say('#m2Msg', 'Sai thứ tự! Toàn bộ trang sổ bị trả lại.', true); penalty(PEN.m2);
  }
});

function buildPic(id) {
  const picture = PICS[id], panel = $(`[data-stage="${id}"]`);
  panel.innerHTML = `
    <div class="head"><div><div class="eyebrow">Bức ảnh bị che</div><h2 class="ptitle">${picture.title}</h2>
      <p class="task">Chọn một ô, trả lời đúng để lật ô; đáp án sai sẽ bị gạch và trừ ${PEN.pic} giây. Thử lại đến khi đúng. Lật 5/9 ô để hiện khung từ khóa. Có thể đoán bất cứ lúc nào (sai −${PEN.guess} giây).</p></div></div>
    <div class="pic"><div class="frame"><img alt="${picture.title}" src="${picture.img}"><div class="tiles"></div></div>
      <div class="side"><div class="qcard"></div><div class="keyhead kwhead"></div><div class="kw"></div>
        <form class="answer" autocomplete="off"><input id="${id}Guess" placeholder="Đoán từ khóa…" aria-label="Đoán từ khóa"><button class="btn" type="submit">Đoán</button></form>
        <div class="msg" aria-live="polite"></div><p class="pic-note" hidden></p></div></div>
    <div class="hints" data-hints="${id}"></div>`;
  panel.querySelector('.tiles').addEventListener('click', event => {
    const button = event.target.closest('.tile');
    if (!button || S.done[id] || S.paused) return;
    const index = Number(button.dataset.k);
    if (S.pic[id].t[index] !== 'c') return;
    S.pic[id].sel = index; tone(800, .05, 'square', .06); renderPic(id);
  });
  panel.querySelector('.qcard').addEventListener('click', event => {
    const button = event.target.closest('.opt');
    if (button) answerPic(id, Number(button.dataset.o));
  });
  panel.querySelector('form').addEventListener('submit', event => {
    event.preventDefault(); if (S.done[id]) return;
    const input = panel.querySelector('input'), value = norm(input.value);
    if (!value) return;
    if (value === norm(picture.kw) || picture.alt.includes(value)) {
      say(panel.querySelector('.msg'), `Chính xác: ${picture.kw}!`); solve(id);
    } else {
      shake(panel.querySelector('form')); say(panel.querySelector('.msg'), `“${input.value.trim().toUpperCase()}” chưa đúng!`, true);
      input.select(); penalty(PEN.guess);
    }
  });
}
function kwShown(id) {
  const words = PICS[id].kw.split(' '), level = H(id);
  return words.map(word => [...word].map((character, index) => S.done[id] || (level >= 1 && index === 0) || (level >= 2 && index % 2 === 0) ? character : ''));
}
function renderPic(id) {
  const picture = PICS[id], state = S.pic[id], panel = $(`[data-stage="${id}"]`);
  panel.querySelector('.tiles').innerHTML = state.t.map((status, index) =>
    `<button type="button" class="tile ${status === 'o' ? 'open' : ''} ${status === 'x' ? 'burnt' : ''} ${state.sel === index ? 'sel' : ''}" data-k="${index}" ${status !== 'c' ? 'tabindex="-1"' : ''}>${status === 'x' ? '✕' : index + 1}</button>`
  ).join('');
  const opened = state.t.filter(status => status === 'o').length;
  const remaining = state.t.length - opened;
  const question = state.sel != null ? picture.qs[state.sel] : null;
  panel.querySelector('.qcard').innerHTML = S.done[id]
    ? `<div class="qtext">Từ khóa: <b>${picture.kw}</b></div>`
    : question
      ? `<div class="keyhead">Ô số ${state.sel + 1}</div><div class="qtext">${question[0]}</div><div class="opts">${question[1].map((option, index) =>       `<button type="button" class="opt ${state.wrong[state.sel].includes(index) ? 'wrong' : ''}" data-o="${index}" ${state.wrong[state.sel].includes(index) ? 'disabled' : ''}><b>${'ABCD'[index]}</b><span>${option}</span></button>`).join('')}</div>`
      : `<div class="qtext">${remaining ? 'Chọn một ô số trên bức ảnh.' : 'Đã hết ô. Nhìn ảnh và đoán từ khóa!'}</div><div class="tally"><span>Đã lật <b>${opened}</b></span><span>Còn <b>${remaining}</b></span></div>`;
  const showKeyword = S.done[id] || opened >= Math.ceil(state.t.length / 2) || H(id) > 0;
  const words = picture.kw.split(' ');
  panel.querySelector('.kwhead').textContent = showKeyword ? `Từ khóa · ${words.length} từ · ${norm(picture.kw).length} chữ cái` : 'Từ khóa';
  panel.querySelector('.kw').innerHTML = showKeyword
    ? kwShown(id).map(word => `<div class="word">${word.map(character => `<span>${character}</span>`).join('')}</div>`).join('')
    : `<div class="kwlock">Khung chữ hiện ra khi lật được 5 / 9 ô (đã lật ${opened})</div>`;
  const note = panel.querySelector('.pic-note');
  note.hidden = opened !== state.t.length; note.textContent = opened === state.t.length ? picture.note : '';
  renderHints();
}
function answerPic(id, answer) {
  const state = S.pic[id];
  if (state.sel == null || S.done[id] || state.lock || S.paused) return;
  const index = state.sel, correct = PICS[id].qs[index][2] === answer;
  const options = $$(`[data-stage="${id}"] .opt`);
  state.lock = true;
  if (correct) {
    options[answer].classList.add('right');
    tone(660, .15, 'triangle', .22); tone(990, .25, 'triangle', .22, .1);
    setTimeout(() => {
      state.lock = false;
      if (S.screen !== 'play' || S.stage !== sidx(id)) return;
      state.t[index] = 'o'; state.sel = null; renderPic(id);
    }, 700);
  } else {
    state.wrong[index].push(answer);
    options[answer].classList.add('wrong'); options[answer].disabled = true;
    penalty(PEN.pic);
    setTimeout(() => {
      state.lock = false;
      if (S.screen !== 'play' || S.stage !== sidx(id)) return;
      renderPic(id);
    }, 450);
  }
}

function renderCW() {
  const grid = $('#cw'); grid.style.setProperty('--cw-cols', CWCOLS);
  grid.innerHTML = CW.map(([, displayed, keyIndex], row) => {
    const offset = KEYCOL - keyIndex, letters = [...displayed], keyLetter = [...CW_KEY_DISPLAY][row];
    let cells = `<button type="button" class="cwn ${S.cwSel === row && !S.cw[row] ? 'sel' : ''}" data-r="${row}">${row + 1}</button>`;
    for (let column = 0; column < CWCOLS; column++) {
      const characterIndex = column - offset;
      cells += characterIndex >= 0 && characterIndex < letters.length
        ? `<span class="box ${column === KEYCOL ? 'key' : ''} ${S.cw[row] ? 'on' : ''}">${S.cw[row] ? (column === KEYCOL ? keyLetter : letters[characterIndex]) : ''}</span>`
        : '<span></span>';
    }
    return cells;
  }).join('');
  $('#clues').innerHTML = CW.map(([, , , question], row) => `<li><button type="button" data-r="${row}" class="${S.cwSel === row && !S.cw[row] ? 'sel' : ''} ${S.cw[row] ? 'done' : ''}"><b>${row + 1}</b><span>${question}</span></button></li>`).join('');
  $('#cwInput').placeholder = `Hàng ${S.cwSel + 1} hoặc hàng dọc…`;
  $('#cw').classList.toggle('solved', S.cw.every(Boolean));
  if (!S.done.cw) setTimeout(() => $('#cwInput').focus(), 50);
}
function pickRow(row) {
  if (S.cw[row] || S.done.cw) return;
  S.cwSel = row; $('#cwInput').value = ''; renderCW();
}
$('#clues').addEventListener('click', event => { const button = event.target.closest('button'); if (button) pickRow(Number(button.dataset.r)); });
$('#cw').addEventListener('click', event => { const button = event.target.closest('.cwn'); if (button) pickRow(Number(button.dataset.r)); });
$('#cwForm').addEventListener('submit', event => {
  event.preventDefault(); if (S.done.cw) return;
  const value = norm($('#cwInput').value); if (!value) return;
  const row = S.cwSel;
  if (value === CW_KEY) {
    S.cw = S.cw.map(() => true); $('#cwInput').value = ''; renderCW();
    say('#cwMsg', 'Đoán trúng hàng dọc: NHÂN DÂN!'); solve('cw'); return;
  }
  if (value === CW[row][0]) {
    S.cw[row] = true; $('#cwInput').value = ''; tone(700, .12, 'triangle', .2); tone(940, .2, 'triangle', .2, .1);
    const next = S.cw.findIndex(solved => !solved); if (next >= 0) S.cwSel = next;
    say('#cwMsg', `Đúng hàng ${row + 1}!`); renderCW();
    if (next < 0) { say('#cwMsg', 'Hàng dọc: NHÂN DÂN!'); solve('cw'); }
  } else {
    shake($('#cwForm')); say('#cwMsg', `Sai rồi! Thử lại hàng ${row + 1}.`, true); penalty(PEN.cw); $('#cwInput').select();
  }
});

function shuffledBranches() {
  const order = [0, 1, 2];
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }
  return order;
}
function renderJunction() {
  const state = S.m3, [question, answers] = JUNCTIONS[state.index];
  if (!state.order.length) state.order = shuffledBranches();
  $('#junctionProgress').textContent = `Đã qua ${state.index} / ${JUNCTIONS.length} ngã ba`;
  $('#junctionQuestion').textContent = `${state.index + 1}. ${question}`;
  const paths = state.order.map((answerIndex, branch) => {
    const x = [180, 500, 820][branch];
    const d = `M500 125 C500 170 ${x} 165 ${x} 214`;
    const disabled = state.locked.includes(answerIndex);
    const chosen = state.busy && state.order[state.movingSlot] === answerIndex;
    const status = disabled ? 'locked' : chosen ? (answerIndex === JUNCTIONS[state.index][2] ? 'chosen' : 'dead-end') : '';
    return `<path class="junction-track-bed ${status}" d="${d}" /><path class="junction-track-ties ${status}" d="${d}" /><path class="junction-track-rail ${status}" d="${d}" transform="translate(-7 0)" /><path class="junction-track-rail ${status}" d="${d}" transform="translate(7 0)" />`;
  }).join('');
  $('#junctionSvg').innerHTML = `
    <path class="junction-main" d="M500 70V125" />
    ${paths}
    <path class="junction-switch" d="M475 145L500 125L525 145" />
    <circle class="junction-node" cx="500" cy="125" r="12" />`;
  const movingAnswer = state.busy ? state.order[state.movingSlot] : null;
  $('#junctionBranches').innerHTML = state.order.map((answerIndex, slot) => {
    const locked = state.locked.includes(answerIndex);
    const chosenCorrect = state.busy && movingAnswer === answerIndex && answerIndex === JUNCTIONS[state.index][2];
    return `<button type="button" class="junction-choice ${locked ? 'locked' : ''} ${chosenCorrect ? 'chosen' : ''}" data-slot="${slot}" ${locked || state.busy ? 'disabled' : ''}>
      <span class="junction-key">${slot + 1}</span>${answers[answerIndex]}</button>`;
  }).join('');
  const deadEnd = movingAnswer != null && movingAnswer !== JUNCTIONS[state.index][2];
  $('#junctionTrain').className = `junction-train ${state.busy ? 'moving' : ''} ${deadEnd ? 'dead-end' : ''} ${state.busy ? `route-${state.movingSlot}` : ''}`;
  $('#junctionBranches').querySelectorAll('.junction-choice').forEach(button => {
    button.addEventListener('click', () => chooseJunctionBranch(Number(button.dataset.slot)));
  });
}
function chooseJunctionBranch(slot) {
  const state = S.m3;
  if (S.screen !== 'play' || cur() !== 'm3' || S.paused || state.busy) return;
  const answerIndex = state.order[slot];
  if (answerIndex == null || state.locked.includes(answerIndex)) return;
  state.busy = true; state.movingSlot = slot;
  if (answerIndex === JUNCTIONS[state.index][2]) {
    if (state.index < JUNCTIONS.length - 1) sfx.ok();
    say('#m3Msg', 'Bẻ ghi thành công! Tàu đang qua nhánh an toàn.');
    renderJunction();
    setTimeout(() => {
      if (S.screen !== 'play' || cur() !== 'm3') return;
      state.index++;
      state.order = []; state.locked = []; state.busy = false; state.movingSlot = null;
      if (state.index === JUNCTIONS.length) {
        say('#m3Msg', 'Đã qua đủ 4 ngã ba!');
        solve('m3');
      } else {
        say('#m3Msg', '');
        renderJunction();
      }
    }, 850);
  } else {
    state.locked.push(answerIndex); penalty(PEN.m3);
    say('#m3Msg', 'Sai nhánh! Tàu lao vào đường cụt rồi lùi lại.', true);
    shake($('[data-stage="m3"]')); renderJunction();
    setTimeout(() => {
      if (S.screen !== 'play' || cur() !== 'm3') return;
      state.busy = false; state.movingSlot = null; renderJunction();
    }, 700);
  }
}
function renderM4() {
  $('#dials').innerHTML = S.m4.map((value, index) => `<div class="dial"><small>${ROMAN[index]}</small>
    <button type="button" data-d="${index}" data-s="1" aria-label="Tăng vòng ${index + 1}">▲</button>
    <output>${value}</output><button type="button" data-d="${index}" data-s="-1" aria-label="Giảm vòng ${index + 1}">▼</button></div>`).join('');
  $('#lock').classList.toggle('open', !!S.done.m4);
}

function drawCircuitWires() {
  const board = $('#circuitBoard'), svg = $('#circuitWires');
  if (!board || !svg) return;
  const boardRect = board.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${board.clientWidth} ${board.clientHeight}`);
  svg.innerHTML = S.circuit.connected.map(id => {
    const source = board.querySelector(`[data-wire-source="${id}"]`);
    const target = board.querySelector(`[data-wire-target="${id}"]`);
    if (!source || !target) return '';
    const sourceRect = source.getBoundingClientRect(), targetRect = target.getBoundingClientRect();
    const x1 = sourceRect.right - boardRect.left, y1 = sourceRect.top + sourceRect.height / 2 - boardRect.top;
    const x2 = targetRect.left - boardRect.left, y2 = targetRect.top + targetRect.height / 2 - boardRect.top;
    const curve = Math.max(24, (x2 - x1) * .45);
    return `<path class="circuit-wire" d="M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}"/>`;
  }).join('');
}
function renderCircuit() {
  const state = S.circuit;
  if (!state.targetOrder.length) state.targetOrder = ['powers', 'state', 'party', 'people'];
  const connected = new Set(state.connected);
  $('#circuitProgress').textContent = `Đã nối ${connected.size} / ${CIRCUIT_NODES.length} đường`;
  $('#circuitSources').innerHTML = CIRCUIT_NODES.map(node =>
    `<button type="button" class="circuit-node ${state.selected === node.id ? 'selected' : ''} ${connected.has(node.id) ? 'connected' : ''} ${state.hintPair === node.id ? 'hinted' : ''}" data-wire-source="${node.id}" aria-pressed="${state.selected === node.id}" ${connected.has(node.id) ? 'disabled' : ''}>${node.source}</button>`
  ).join('');
  $('#circuitTargets').innerHTML = state.targetOrder.map(id => {
    const node = CIRCUIT_NODES.find(item => item.id === id);
    return `<button type="button" class="circuit-node ${connected.has(id) ? 'connected' : ''} ${state.hintPair === id ? 'hinted' : ''}" data-wire-target="${id}" ${connected.has(id) ? 'disabled' : ''}>${node.target}</button>`;
  }).join('');
  drawCircuitWires();
}
$('#circuitBoard').addEventListener('click', event => {
  if (S.done.circuit || S.screen !== 'play' || S.paused) return;
  const state = S.circuit, source = event.target.closest('[data-wire-source]'), target = event.target.closest('[data-wire-target]');
  if (source) {
    state.selected = state.selected === source.dataset.wireSource ? null : source.dataset.wireSource;
    say('#circuitMsg', state.selected ? 'Đã chọn đầu mạch. Chọn mô tả phù hợp để nối.' : 'Đã bỏ chọn đầu mạch.');
    renderCircuit(); return;
  }
  if (!target) return;
  if (!state.selected) { say('#circuitMsg', 'Hãy chọn một đầu mạch bên trái trước.', true); return; }
  if (state.selected === target.dataset.wireTarget) {
    state.connected.push(state.selected); state.selected = null; state.hintPair = null;
    renderCircuit(); say('#circuitMsg', 'Nối đúng! Mạch đã thông thêm một nhánh.');
    tone(700, .12, 'triangle', .2); tone(940, .2, 'triangle', .2, .1);
    if (state.connected.length === CIRCUIT_NODES.length) {
      say('#circuitMsg', 'Toàn bộ mạch đã thông! Hộp phanh được cấp điện.');
      solve('circuit');
    }
  } else {
    say('#circuitMsg', 'Sai đường nối! Hãy thử ghép lại.', true); penalty(PEN.circuit);
  }
});
window.addEventListener('resize', () => {
  if (S.screen === 'play' && cur() === 'circuit') drawCircuitWires();
});
$('#dials').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || S.done.m4) return;
  const index = Number(button.dataset.d);
  S.m4[index] = (S.m4[index] + Number(button.dataset.s) + 10) % 10;
  tone(1200, .04, 'square', .05); renderM4();
});
$('#m4Try').addEventListener('click', () => {
  if (S.done.m4) return;
  if (S.m4.every((value, index) => value === LOCK[index])) {
    $('#lock').classList.add('open'); sfx.clunk(); say('#m4Msg', 'Cạch! Ổ khóa đã bật.'); solve('m4');
  } else {
    shake($('#lock')); say('#m4Msg', 'Khóa không nhúc nhích. Có ít nhất một vòng sai.', true); penalty(PEN.m4);
  }
});

/* ---------- két/phanh ---------- */
function renderSafe() {
  $('#pieces').innerHTML = STAGES.filter(stage => stage.digit != null).map((stage, index) =>
    `<div class="piece" style="--r:${ROT[index]}">${S.done[stage.id] ? stage.digit : '?'}</div>`).join('');
  $$('#lcd span').forEach((element, index) => { element.textContent = S.code[index] || ''; });
}
$('#pad').innerHTML = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Xóa', '0', 'Mở'].map(key =>
  `<button type="button" data-k="${key}" class="${key === 'Mở' ? 'go' : ''}">${key}</button>`).join('');
function safeKey(key) {
  if (S.screen !== 'play' || cur() !== 'safe' || S.paused || $('#brakeCabinet').classList.contains('engaged')) return;
  if (key === 'Xóa') S.code = S.code.slice(0, -1);
  else if (key === 'Mở') return trySafe();
  else if (S.code.length < CODE.length) { S.code += key; tone(900 + Number(key) * 40, .06, 'square', .06); }
  renderSafe();
}
$('#pad').addEventListener('click', event => { const button = event.target.closest('button'); if (button) safeKey(button.dataset.k); });
function trySafe() {
  if (S.code.length < CODE.length) { say('#safeMsg', `Cần nhập đủ ${CODE.length} chữ số.`, true); return; }
  if (S.code === CODE) {
    S.running = false; say('#safeMsg', 'Mã đúng! Kéo cần gạt phanh khẩn cấp xuống.');
    $('#brakeCabinet').classList.add('engaged'); sfx.clunk();
    setTimeout(() => { if (S.screen === 'play') win(); }, 1500);
  } else {
    shake($('#lcd')); say('#safeMsg', 'Sai mã! Chuông báo động khẽ rung…', true);
    S.code = ''; renderSafe(); penalty(PEN.safe);
  }
}

/* ---------- kết thúc ---------- */
function win() {
  if (S.screen !== 'play') return;
  S.running = false; setScreen('win'); sfx.whistle();
  const hints = Object.values(S.hints).reduce((sum, count) => sum + count, 0);
  $('#sLeft').textContent = fmt(S.left); $('#sHints').textContent = hints; $('#sErr').textContent = S.errors;
  $('#badge').textContent = S.left >= 180 ? 'Danh hiệu: Kíp lái xuất sắc' : S.left >= 60 ? 'Danh hiệu: Kíp lái gan dạ' : 'Danh hiệu: Dừng tàu trong gang tấc';
}
function lose() {
  if (S.screen !== 'play') return;
  S.running = false; S.left = 0; $('#reward').hidden = true; $('#pauseOv').hidden = true; sfx.alarm(); setScreen('lose');
}
function clearUI() {
  $('#brakeCabinet').classList.remove('engaged'); $('#lock').classList.remove('open');
  ['#m1Msg', '#m2Msg', '#cwMsg', '#m3Msg', '#m4Msg', '#circuitMsg', '#safeMsg'].forEach(selector => say(selector, ''));
  ['#m1A', '#cwInput', '#p1Guess'].forEach(selector => {
    const element = $(selector); if (!element) return;
    element.value = ''; element.readOnly = false; element.classList.remove('ok');
  });
  $$('.pic .msg').forEach(element => say(element, ''));
}
function start() {
  if (S.screen !== 'intro' || !$('#boardingWarning').hidden) return;
  $('#boardingWarning').hidden = false;
  $('#boardAgree').focus();
}
function board(extraSeconds) {
  $('#boardingWarning').hidden = true;
  ac(); const muted = S.muted, m1Easy = S.m1Easy;
  S = fresh(); S.muted = muted; S.m1Easy = m1Easy;
  $('#mPause').firstChild.textContent = 'Tạm dừng ';
  S.total = S.left = Number($('#timeSeg [aria-pressed="true"]').dataset.min) * 60 + extraSeconds;
  S.running = true; clearUI(); setScreen('play'); enterStage(0); sfx.stamp();
}
let resetArmed = false;
function reset() {
  S.running = false; $('#reward').hidden = true; $('#pauseOv').hidden = true; $('#boardingWarning').hidden = true;
  const muted = S.muted, total = S.total, m1Easy = S.m1Easy;
  S = fresh(); S.muted = muted; S.total = S.left = total; S.m1Easy = m1Easy;
  clearUI(); closeMenu(); $('#mPause').firstChild.textContent = 'Tạm dừng '; setScreen('intro');
}
function togglePause(force) {
  if (S.screen !== 'play' || S.reward != null) return;
  S.paused = force == null ? !S.paused : force;
  $('#pauseOv').hidden = !S.paused;
  $('#mPause').firstChild.textContent = S.paused ? 'Tiếp tục ' : 'Tạm dừng ';
  renderHints();
  if (S.paused) $('#resumeBtn').focus();
}
function hint() {
  const id = cur();
  if (S.screen !== 'play' || S.paused || H(id) >= hintsFor(id).length) return;
  S.hints[id] = H(id) + 1; penalty(PEN.hint, true); tone(440, .2, 'triangle', .2); renderHints();
  if (id === 'm2') renderM2();
  if (id === 'm3' && H(id) >= 2) {
    const state = S.m3;
    const correct = JUNCTIONS[state.index][2];
    const availableWrong = state.order.filter(answer => answer !== correct && !state.locked.includes(answer));
    if (availableWrong.length) state.locked.push(availableWrong[Math.floor(Math.random() * availableWrong.length)]);
    renderJunction();
  }
  if (id === 'circuit') {
    S.circuit.hintPair = H(id) === 1 ? 'people' : 'party';
    renderCircuit();
  }
  if (isPic(id)) renderPic(id);
}
function closeMenu() {
  $('#menu').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false');
  resetArmed = false; $('#mReset').textContent = 'Chơi lại từ đầu';
}
function fullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(error => console.error('Không thể thoát toàn màn hình:', error));
  else document.documentElement.requestFullscreen().catch(error => console.error('Không thể bật toàn màn hình:', error));
}

/* ---------- điều khiển ---------- */
$('#timeSeg').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  $$('#timeSeg button').forEach(option => option.setAttribute('aria-pressed', option === button ? 'true' : 'false'));
  S.total = S.left = Number(button.dataset.min) * 60; renderClock();
});
$('#startBtn').addEventListener('click', start);
$('#boardAgree').addEventListener('click', () => board(0));
$('#boardVeryAgree').addEventListener('click', () => board(30));
$('#rwNext').addEventListener('click', closeReward);
$('#resumeBtn').addEventListener('click', () => togglePause(false));
$('#hintBtn').addEventListener('click', hint);
$('#soundBtn').addEventListener('click', () => {
  S.muted = !S.muted; $('#soundBtn').textContent = `Âm thanh: ${S.muted ? 'tắt' : 'bật'}`;
});
$('#menuBtn').addEventListener('click', event => {
  event.stopPropagation();
  const wasOpen = !$('#menu').hidden; closeMenu();
  if (!wasOpen) { $('#menu').hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); }
});
document.addEventListener('click', event => {
  if (!event.target.closest('#menu') && !event.target.closest('#menuBtn')) closeMenu();
});
$('#mPause').addEventListener('click', () => { togglePause(); closeMenu(); });
$('#mPlus').addEventListener('click', () => {
  if (S.screen === 'play') { S.left += 60; S.total = Math.max(S.total, S.left); renderClock(); }
  closeMenu();
});
$('#m1Difficulty').addEventListener('click', () => {
  S.m1Easy = !S.m1Easy;
  if (!$('#m1Zoom').hidden) closeM1Zoom();
  if (S.screen === 'play' && cur() === 'm1') renderM1();
  else $('#m1Difficulty').textContent = S.m1Easy ? 'Đổi về đề chính' : 'Đổi sang đề dễ';
  renderHints(); closeMenu();
});
$('#mSkip').addEventListener('click', () => {
  closeMenu(); if (S.screen !== 'play' || S.paused) return;
  const id = cur();
  if (id !== 'safe') {
    penalty(PEN.skip, true); if (S.screen === 'play') solve(id);
  } else {
    S.code = CODE; renderSafe(); penalty(PEN.skip, true); if (S.screen === 'play') trySafe();
  }
});
$('#mFull').addEventListener('click', () => { closeMenu(); fullscreen(); });
$('#mReset').addEventListener('click', () => {
  if (!resetArmed) { resetArmed = true; $('#mReset').textContent = 'Bấm lần nữa để chơi lại'; return; }
  reset();
});
$$('[data-act="reset"]').forEach(button => button.addEventListener('click', reset));
$('#moreBtn').addEventListener('click', () => {
  S.left = 60; S.total = Math.max(S.total, 60); S.running = true; S.paused = false;
  $('#brakeCabinet').classList.remove('engaged'); setScreen('play'); enterStage(S.stage);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('#m1Zoom').hidden) {
    closeM1Zoom(); return;
  }
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
  const key = event.key, id = cur();
  if (key === 'Enter') {
    if (!$('#boardingWarning').hidden) return;
    if (S.screen === 'intro') { event.preventDefault(); start(); }
    else if (S.reward != null) { event.preventDefault(); closeReward(); }
    else if (S.screen === 'play' && id === 'safe') { event.preventDefault(); safeKey('Mở'); }
    return;
  }
  if (S.screen === 'play' && isPic(id) && S.pic[id].sel != null && /^[abcd]$/i.test(key)) {
    answerPic(id, 'abcd'.indexOf(key.toLowerCase())); return;
  }
  if (S.screen === 'play' && id === 'm3' && /^[123]$/.test(key)) {
    chooseJunctionBranch(Number(key) - 1); return;
  }
  if (key === 'h' || key === 'H') hint();
  else if (key === 'p' || key === 'P') togglePause();
  else if (key === 'f' || key === 'F') fullscreen();
  else if (key === 'm' || key === 'M') $('#soundBtn').click();
  else if (S.screen === 'play' && id === 'safe' && /^[0-9]$/.test(key)) safeKey(key);
  else if (S.screen === 'play' && id === 'safe' && key === 'Backspace') safeKey('Xóa');
});

function openM1Zoom() {
  const source = $('#m1CodeImage');
  $('#m1ZoomImage').src = source.src;
  $('#m1ZoomImage').alt = source.alt;
  $('#m1Zoom').hidden = false;
  $('#m1ZoomClose').focus();
}
function closeM1Zoom() {
  $('#m1Zoom').hidden = true;
  $('#m1ImageButton').focus();
}
$('#m1ImageButton').addEventListener('click', openM1Zoom);
$('#m1Zoom').addEventListener('click', closeM1Zoom);

/* ---------- đồng hồ ---------- */
let last = performance.now();
setInterval(() => {
  const now = performance.now(), delta = (now - last) / 1000; last = now;
  if (!S.running || S.paused || S.screen !== 'play') return;
  const before = Math.ceil(S.left); S.left -= delta; const after = Math.ceil(S.left);
  if (after !== before) { if (after <= 30) sfx.heart(); else if (after <= 90) sfx.tick(); }
  renderClock(); if (S.left <= 0) lose();
}, 100);

buildPic('p1');
setScreen('intro');
renderM2(); renderCW(); renderJunction(); renderM4(); renderSafe();
$('#soundBtn').textContent = `Âm thanh: ${S.muted ? 'tắt' : 'bật'}`;
})();
