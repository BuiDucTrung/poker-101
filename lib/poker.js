// ===== Lá bài =====
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS = ['s', 'h', 'd', 'c']; // bích, cơ, rô, chuồn

export const SUIT_SYMBOL = { s: '♠', h: '♥', d: '♦', c: '♣' };
export const RANK_LABEL = { T: '10' };

export function rankValue(rank) {
  return RANKS.indexOf(rank) + 2; // 2..14 (A = 14)
}

export function createDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ rank: r, suit: s, id: r + s });
  return deck;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== Xếp hạng tay bài =====
// category: 9 Royal, 8 Straight flush, 7 Four of a kind, 6 Full house, 5 Flush,
//           4 Straight, 3 Three of a kind, 2 Two pair, 1 One pair, 0 High card
export const HAND_NAMES = {
  9: { vi: 'Thùng phá sảnh lớn', en: 'Royal Flush' },
  8: { vi: 'Thùng phá sảnh', en: 'Straight Flush' },
  7: { vi: 'Tứ quý', en: 'Four of a Kind' },
  6: { vi: 'Cù lũ', en: 'Full House' },
  5: { vi: 'Thùng', en: 'Flush' },
  4: { vi: 'Sảnh', en: 'Straight' },
  3: { vi: 'Sám cô', en: 'Three of a Kind' },
  2: { vi: 'Thú (hai đôi)', en: 'Two Pair' },
  1: { vi: 'Đôi', en: 'One Pair' },
  0: { vi: 'Mậu thầu', en: 'High Card' },
};

export function handName(category) {
  const n = HAND_NAMES[category];
  return `${n.vi} (${n.en})`;
}

/** Đánh giá 5 lá. Trả về { category, values } — values dùng để so sánh khi cùng category. */
export function evaluate5(cards) {
  const vals = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);
  const isFlush = cards.every((c) => c.suit === cards[0].suit);

  // Sảnh (kể cả sảnh A-2-3-4-5, lá cao nhất là 5)
  const uniq = [...new Set(vals)];
  let straightHigh = 0;
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) straightHigh = uniq[0];
    else if (uniq.join(',') === '14,5,4,3,2') straightHigh = 5;
  }

  // Nhóm theo số lần xuất hiện, sắp theo (số lượng giảm dần, giá trị giảm dần)
  const counts = {};
  for (const v of vals) counts[v] = (counts[v] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([v, n]) => ({ v: Number(v), n }))
    .sort((a, b) => b.n - a.n || b.v - a.v);
  const ordered = groups.map((g) => g.v);
  const pattern = groups.map((g) => g.n).join('');

  if (straightHigh && isFlush) return { category: straightHigh === 14 ? 9 : 8, values: [straightHigh] };
  if (pattern === '41') return { category: 7, values: ordered };
  if (pattern === '32') return { category: 6, values: ordered };
  if (isFlush) return { category: 5, values: vals };
  if (straightHigh) return { category: 4, values: [straightHigh] };
  if (pattern === '311') return { category: 3, values: ordered };
  if (pattern === '221') return { category: 2, values: ordered };
  if (pattern === '2111') return { category: 1, values: ordered };
  return { category: 0, values: vals };
}

/** So sánh 2 kết quả: >0 nếu a mạnh hơn, <0 nếu b mạnh hơn, 0 nếu bằng. */
export function compareScores(a, b) {
  // Royal flush và straight flush cùng hệ: so như straight flush
  const ca = a.category === 9 ? 8 : a.category;
  const cb = b.category === 9 ? 8 : b.category;
  if (ca !== cb) return ca - cb;
  for (let i = 0; i < Math.max(a.values.length, b.values.length); i++) {
    const d = (a.values[i] || 0) - (b.values[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function discardKey(i, j) {
  return i < j ? `${i}-${j}` : `${j}-${i}`;
}

/**
 * Phân tích 7 lá: thử tất cả 21 cách bỏ 2 lá.
 * Trả về điểm mạnh nhất và danh sách TẤT CẢ các cặp bỏ đúng
 * (có thể có nhiều cặp cùng cho ra bộ 5 lá mạnh nhất, ví dụ khi lá bỏ đi không ảnh hưởng).
 */
export function analyzeHand(seven) {
  let best = null;
  let correctKeys = [];
  for (let i = 0; i < 7; i++) {
    for (let j = i + 1; j < 7; j++) {
      const five = seven.filter((_, k) => k !== i && k !== j);
      const score = evaluate5(five);
      const cmp = best ? compareScores(score, best) : 1;
      if (cmp > 0) {
        best = score;
        correctKeys = [discardKey(i, j)];
      } else if (cmp === 0) {
        correctKeys.push(discardKey(i, j));
      }
    }
  }
  return { best, correctKeys };
}

/** Chia 7 lá (2 lá dealer + 5 lá chung). minCategory để luyện các tay bài mạnh hơn. */
export function dealHand(minCategory = 0) {
  const deck = createDeck();
  for (let t = 0; t < 5000; t++) {
    const seven = shuffle(deck).slice(0, 7);
    const analysis = analyzeHand(seven);
    if (analysis.best.category >= minCategory) return { cards: seven, ...analysis };
  }
  const seven = shuffle(deck).slice(0, 7);
  return { cards: seven, ...analyzeHand(seven) };
}
