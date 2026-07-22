/**
 * 简单的 LRU 缓存，避免重复生成 TTS 音频
 */
export class TTSCache {
  private cache: Map<string, Buffer>;
  private maxSize: number;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(text: string): Buffer | undefined {
    const key = this.normalize(text);
    const val = this.cache.get(key);
    // LRU：访问时重新插入以提升优先级
    if (val !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, val);
    }
    return val;
  }

  set(text: string, audio: Buffer): void {
    const key = this.normalize(text);
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未访问的条目（Map 的第一个 key）
      const oldest = this.cache.keys().next();
      if (!oldest.done) this.cache.delete(oldest.value);
    }
    this.cache.set(key, audio);
  }

  private normalize(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }
}

export const ttsCache = new TTSCache(200);
