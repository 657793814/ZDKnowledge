import { useTTS } from '@/hooks/useTTS';

interface TTSButtonProps {
  /** 要朗读的文本 */
  text: string;
  /** 按钮尺寸 */
  size?: 'small' | 'default';
  /** 额外的 CSS class */
  className?: string;
}

/**
 * 🔊 TTS 朗读按钮
 * 点击切换 朗读/停止
 */
export function TTSButton({ text, size = 'small', className }: TTSButtonProps) {
  const { isSpeaking, speak, stop } = useTTS();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const btnSize = size === 'small' ? 24 : 32;
  const iconSize = size === 'small' ? 11 : 13;

  return (
    <button
      onClick={handleClick}
      className={`tts-btn ${isSpeaking ? 'tts-speaking' : ''} ${className || ''}`}
      title={isSpeaking ? '停止朗读' : '朗读本节'}
      style={{
        width: btnSize,
        height: btnSize,
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        background: isSpeaking ? '#fee2e2' : 'rgba(255,255,255,0.9)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        fontSize: iconSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        flexShrink: 0,
        lineHeight: 1,
        padding: 0,
      }}
    >
      {isSpeaking ? '⏹' : '🔊'}
    </button>
  );
}
