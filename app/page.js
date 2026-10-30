'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '../components/Card';
import { dealHand, discardKey, handName, evaluate5, HAND_NAMES } from '../lib/poker';

const LEVELS = [
  { id: 0, label: 'Ngẫu nhiên' },
  { id: 2, label: 'Từ Thú trở lên' },
  { id: 4, label: 'Từ Sảnh trở lên' },
];

export default function Home() {
  const [level, setLevel] = useState(0);
  const [hand, setHand] = useState(null);
  const [selected, setSelected] = useState([]); // index trong mảng 7 lá
  const [status, setStatus] = useState('playing'); // playing | wrong | correct
  const [attempts, setAttempts] = useState(0);
  const [stats, setStats] = useState({ done: 0, firstTry: 0, streak: 0 });
  const [showHint, setShowHint] = useState(false);

  const newHand = useCallback((lv = level) => {
    setHand(dealHand(lv));
    setSelected([]);
    setStatus('playing');
    setAttempts(0);
    setShowHint(false);
  }, [level]);

  // Chia bài ở client để tránh lệch giữa server render và client
  useEffect(() => {
    newHand(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hand) return <main className="page" />;

  const toggle = (idx) => {
    if (status === 'correct') return;
    if (status === 'wrong') setStatus('playing');
    setSelected((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= 2) return prev; // chỉ được bỏ đúng 2 lá
      return [...prev, idx];
    });
  };

  const confirm = () => {
    if (selected.length !== 2) return;
    const ok = hand.correctKeys.includes(discardKey(selected[0], selected[1]));
    setAttempts((a) => a + 1);
    if (ok) {
      setStatus('correct');
      setStats((s) => ({
        done: s.done + 1,
        firstTry: s.firstTry + (attempts === 0 ? 1 : 0),
        streak: attempts === 0 ? s.streak + 1 : 0,
      }));
    } else {
      setStatus('wrong');
      setStats((s) => ({ ...s, streak: 0 }));
    }
  };

  const retry = () => {
    setSelected([]);
    setStatus('playing');
  };

  const changeLevel = (lv) => {
    setLevel(lv);
    newHand(lv);
  };

  // Tay bài người học đã chọn (để giải thích khi sai)
  const chosenFive =
    selected.length === 2 ? hand.cards.filter((_, i) => !selected.includes(i)) : null;
  const chosenScore = chosenFive ? evaluate5(chosenFive) : null;

  // Một đáp án đúng để hiển thị gợi ý / kết quả
  const [ai, bi] = hand.correctKeys[0].split('-').map(Number);
  const answerSet = new Set([ai, bi]);

  const highlightFor = (idx) => {
    if (status === 'correct') return selected.includes(idx) ? 'discard' : 'keep';
    if (showHint) return answerSet.has(idx) ? 'hint' : null;
    if (status === 'wrong' && selected.includes(idx)) return 'wrong';
    return null;
  };

  const renderCard = (idx) => (
    <Card
      key={hand.cards[idx].id}
      card={hand.cards[idx]}
      selected={selected.includes(idx)}
      highlight={highlightFor(idx)}
      onClick={() => toggle(idx)}
      disabled={status === 'correct'}
    />
  );

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Dealer Trainer</h1>
          <p className="sub">Texas Hold&apos;em · Chọn 5 lá mạnh nhất</p>
        </div>
        <div className="stats">
          <div><b>{stats.done}</b><span>Đã xong</span></div>
          <div><b>{stats.firstTry}</b><span>Đúng ngay lần đầu</span></div>
          <div><b>{stats.streak}</b><span>Chuỗi đúng</span></div>
        </div>
      </header>

      <section className="instructions">
        Bạn là <b>dealer</b>. Từ 2 lá của bạn và 5 lá chung, <b>bấm vào 2 lá cần bỏ</b> (lá được chọn sẽ
        nhô lên), giữ lại 5 lá tạo thành tay bài mạnh nhất, rồi bấm <b>Xác nhận</b>.
      </section>

      <div className="levels">
        <span>Độ khó:</span>
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`chip ${level === l.id ? 'active' : ''}`}
            onClick={() => changeLevel(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <section className="table">
        <div className="zone">
          <div className="zone-label">Bài chung (Community cards)</div>
          <div className="row">{[2, 3, 4, 5, 6].map(renderCard)}</div>
        </div>
        <div className="zone">
          <div className="zone-label">Bài của dealer</div>
          <div className="row">{[0, 1].map(renderCard)}</div>
        </div>
      </section>

      <section className="panel">
        {status === 'playing' && (
          <p className="msg">
            Đã chọn bỏ <b>{selected.length}/2</b> lá
            {attempts > 0 && <> · Lần thử thứ {attempts + 1}</>}
          </p>
        )}

        {status === 'wrong' && (
          <div className="msg wrong">
            <b>Chưa đúng — hãy làm lại câu này.</b>
            {chosenScore && (
              <p>
                5 lá bạn giữ tạo thành <b>{handName(chosenScore.category)}</b>, nhưng vẫn còn cách giữ
                mạnh hơn.
              </p>
            )}
          </div>
        )}

        {status === 'correct' && (
          <div className="msg correct">
            <b>Chính xác!</b>
            <p>
              Tay bài mạnh nhất: <b>{handName(hand.best.category)}</b>
              {attempts > 1 && <> · Đúng sau {attempts} lần thử</>}
            </p>
          </div>
        )}

        <div className="actions">
          {status === 'correct' ? (
            <button type="button" className="btn primary" onClick={() => newHand()}>
              Câu tiếp theo →
            </button>
          ) : status === 'wrong' ? (
            <button type="button" className="btn primary" onClick={retry}>
              Làm lại
            </button>
          ) : (
            <button
              type="button"
              className="btn primary"
              disabled={selected.length !== 2}
              onClick={confirm}
            >
              Xác nhận
            </button>
          )}
          {status !== 'correct' && attempts >= 2 && (
            <button type="button" className="btn ghost" onClick={() => setShowHint((h) => !h)}>
              {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
            </button>
          )}
        </div>
      </section>

      <details className="ranking">
        <summary>Bảng xếp hạng tay bài (mạnh → yếu)</summary>
        <ol>
          {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((c) => (
            <li key={c}>
              <b>{HAND_NAMES[c].vi}</b> <span>{HAND_NAMES[c].en}</span>
            </li>
          ))}
        </ol>
      </details>
    </main>
  );
}
