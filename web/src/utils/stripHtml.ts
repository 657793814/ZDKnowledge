/**
 * 剥离 HTML 标签，保留 $...$ LaTeX 内容供 mathToSpeech 处理
 */
export function stripHtml(text: string): string {
  return text
    // 移除 HTML 标签（保留 $...$ 内的内容）
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]*>/g, '')
    // 解码 HTML 实体
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#\d+;/g, '')
    // $...$ 原样保留（后续由 mathToSpeech 处理）
    // 合并空白
    .replace(/\s+/g, ' ')
    .trim();
}
