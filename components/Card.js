import { SUIT_SYMBOL, RANK_LABEL } from '../lib/poker';

export default function Card({ card, selected, onClick, disabled, highlight }) {
  const red = card.suit === 'h' || card.suit === 'd';
  const label = RANK_LABEL[card.rank] || card.rank;
  const symbol = SUIT_SYMBOL[card.suit];
  const cls = [
    'card',
    red ? 'red' : 'black',
    selected ? 'selected' : '',
    highlight ? `hl-${highlight}` : '',
    disabled ? 'disabled' : '',
  ].join(' ');

  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${label} ${symbol}${selected ? ' (đã chọn bỏ)' : ''}`}
    >
      <span className="corner tl">
        {label}
        <br />
        {symbol}
      </span>
      <span className="pip">{symbol}</span>
      <span className="corner br">
        {label}
        <br />
        {symbol}
      </span>
    </button>
  );
}
