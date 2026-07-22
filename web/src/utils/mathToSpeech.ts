/**
 * Math-to-Speech 预处理器
 * 将 LaTeX 公式和数学符号转换为适合 TTS 朗读的中文文本
 */

const MATH_MAP: [RegExp, string][] = [
  // 指数
  [/x\s*\}\^\{2\}/g, 'x 的平方'],
  [/x\^\{2\}/g, 'x 的平方'],
  [/x\^2/g, 'x 的平方'],
  [/(\w)\^\{2\}/g, '$1 的平方'],
  [/(\w)\^2/g, '$1 的平方'],
  [/x\^\{3\}/g, 'x 的三次方'],
  [/x\^3/g, 'x 的三次方'],
  [/(\w)\^\{(\d+)\}/g, '$1 的 $2 次方'],
  [/(\w)\^(\d+)/g, '$1 的 $2 次方'],

  // 平方根
  [/\\sqrt\s*\{\s*(\w+)\s*\}/g, '根号 $1'],
  [/\\sqrt\[3\]\{([^}]*)\}/g, '三次根号 $1'],
  [/\\sqrt/g, '根号'],
  [/√(\w+)/g, '根号 $1'],
  [/√/g, '根号'],

  // 分数
  [/\\frac\s*\{\s*([^}]*)\s*\}\s*\{\s*([^}]*)\s*\}/g, '$1 分之 $2'],

  // 求和/积分/极限
  [/\\sum/g, '求和'],
  [/\\int/g, '积分'],
  [/\\prod/g, '累乘'],
  [/\\lim/g, '极限'],
  [/\\infty/g, '无穷大'],

  // 关系运算符
  [/\\le/g, '小于等于'],
  [/\\ge/g, '大于等于'],
  [/\\neq/g, '不等于'],
  [/\\ne/g, '不等于'],
  [/\\approx/g, '约等于'],
  [/\\equiv/g, '恒等于'],
  [/\\sim/g, '相似于'],
  [/\\propto/g, '正比于'],
  [/\\perp/g, '垂直于'],
  [/\\parallel/g, '平行于'],
  [/\\in/g, '属于'],
  [/\\notin/g, '不属于'],
  [/\\subset/g, '包含于'],
  [/\\supset/g, '包含'],
  [/\\subseteq/g, '包含于或等于'],
  [/\\supseteq/g, '包含或等于'],
  [/\\cap/g, '交集'],
  [/\\cup/g, '并集'],
  [/\\forall/g, '任意'],
  [/\\exists/g, '存在'],
  [/\\to/g, '趋向于'],
  [/\\Rightarrow/g, '推出'],
  [/\\Leftarrow/g, '被推出'],
  [/\\iff/g, '当且仅当'],
  [/\\rightarrow/g, '向右'],
  [/\\leftarrow/g, '向左'],

  // 希腊字母
  [/\\alpha/g, '阿尔法'],
  [/\\beta/g, '贝塔'],
  [/\\gamma/g, '伽马'],
  [/\\delta/g, '德尔塔'],
  [/\\epsilon/g, '伊普西龙'],
  [/\\zeta/g, '泽塔'],
  [/\\eta/g, '伊塔'],
  [/\\theta/g, '西塔'],
  [/\\iota/g, '约塔'],
  [/\\kappa/g, '卡帕'],
  [/\\lambda/g, '兰布达'],
  [/\\mu/g, '缪'],
  [/\\nu/g, '纽'],
  [/\\xi/g, '克西'],
  [/\\pi/g, '派'],
  [/\\rho/g, '柔'],
  [/\\sigma/g, '西格马'],
  [/\\tau/g, '套'],
  [/\\upsilon/g, '宇普西龙'],
  [/\\phi/g, '斐'],
  [/\\chi/g, '喜'],
  [/\\psi/g, '普西'],
  [/\\omega/g, '欧米伽'],

  // 大写希腊字母
  [/\\Delta/g, '德尔塔'],
  [/\\Gamma/g, '伽马'],
  [/\\Theta/g, '西塔'],
  [/\\Lambda/g, '兰布达'],
  [/\\Xi/g, '克西'],
  [/\\Pi/g, '派'],
  [/\\Sigma/g, '西格马'],
  [/\\Phi/g, '斐'],
  [/\\Psi/g, '普西'],
  [/\\Omega/g, '欧米伽'],

  // 数学符号
  [/\\cdot/g, '点乘'],
  [/\\times/g, '乘'],
  [/\\div/g, '除以'],
  [/\\pm/g, '正负'],
  [/\\mp/g, '负正'],
  [/\\circ/g, '度'],
  [/\\angle/g, '角'],
  [/\\triangle/g, '三角形'],
  [/\\because/g, '因为'],
  [/\\therefore/g, '所以'],
  [/\\dots/g, '等等'],
  [/\\cdots/g, '等等'],
  [/\\emptyset/g, '空集'],
  [/\\varnothing/g, '空集'],
  [/\\partial/g, '偏微分'],
  [/\\nabla/g, '梯度'],

  // 常见函数
  [/\\sin/g, '正弦'],
  [/\\cos/g, '余弦'],
  [/\\tan/g, '正切'],
  [/\\cot/g, '余切'],
  [/\\sec/g, '正割'],
  [/\\csc/g, '余割'],
  [/\\arcsin/g, '反正弦'],
  [/\\arccos/g, '反余弦'],
  [/\\arctan/g, '反正切'],
  [/\\log/g, '对数'],
  [/\\ln/g, '自然对数'],
  [/\\lg/g, '常用对数'],
];

/**
 * 将包含 LaTeX 的文本转化为适合 TTS 朗读的中文文本
 * 输入: "若 a \\neq 0，则方程 $a x^2 + b x + c = 0$ 的根为..."
 * 输出: "若 a 不等于 0，则方程 a x 的平方 加 b x 加 c 等于 0 的根为..."
 */
export function mathToSpeech(text: string): string {
  let result = text
    // 先处理 $...$ 内的内容（保留内容但清理 LaTeX）
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => applyMathMap(m.trim()))
    .replace(/\$([^$]*)\$/g, (_, m) => applyMathMap(m.trim()));

  // 处理剩下的行内 LaTeX 命令
  result = applyMathMap(result);

  return result;
}

function applyMathMap(text: string): string {
  let result = text;
  for (const [pattern, replacement] of MATH_MAP) {
    result = result.replace(pattern, replacement);
  }
  // 清理残留的花括号和上下标符号
  result = result
    .replace(/[{}^_]/g, ' ')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return result;
}
