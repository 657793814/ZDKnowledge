/**
 * 添加漏掉的节点 — 安全地只插新节点，跳过已有的
 * 
 * 用法: npx tsx scripts/add-missing-nodes.ts
 */
import { prisma, sn, sr } from '../src/seeders/helpers.js';

async function safeSn(...args: Parameters<typeof sn>) {
  const id = args[0];
  const exists = await prisma.knowledgeNode.findUnique({ where: { id } });
  if (exists) {
    console.log(`  ⏭️  ${id} 已存在，跳过`);
    return;
  }
  await sn(...args);
  console.log(`  ✅  ${id}`);
}

async function safeSr(from: string, to: string, type: string, order: number) {
  const exists = await prisma.knowledgeRelation.findFirst({
    where: { fromNodeId: from, toNodeId: to, relationType: type },
  });
  if (exists) return;
  await sr(from, to, type, order);
}

async function main() {
  console.log('📝 添加缺失知识点\n');

  console.log('--- 式: MATH-02-013 完全立方与立方和差 ---');

  await safeSn('MATH-02-013', '完全立方与立方和差公式', '高次乘法公式的扩展', 'math', '式', '高中', 3, 145, null,
    '完全立方公式和立方和差公式是乘法公式在高次中的推广',
    JSON.stringify({
      sections: [
        {
          type: 'definition',
          title: '📖 核心定义',
          content: '完全立方公式是 $(a \\pm b)^3 = a^3 \\pm 3a^2b + 3ab^2 \\pm b^3$。记忆口诀是"首立方，尾立方，积的二倍放中央，三倍首平方乘尾，三倍尾平方乘首"。立方和公式 $a^3 + b^3 = (a+b)(a^2-ab+b^2)$，立方差公式 $a^3 - b^3 = (a-b)(a^2+ab+b^2)$。这三个公式统称为"完全立方与立方和差公式"，在因式分解、代数化简、数列求和中都有广泛应用。',
          formulas: ['完全立方和：$(a+b)^3 = a^3+3a^2b+3ab^2+b^3$', '完全立方差：$(a-b)^3 = a^3-3a^2b+3ab^2-b^3$', '立方和：$a^3+b^3 = (a+b)(a^2-ab+b^2)$', '立方差：$a^3-b^3 = (a-b)(a^2+ab+b^2)$'],
        },
        {
          type: 'keypoints',
          title: '核心要点',
          items: [
            '完全立方和：$(a+b)^3 = a^3+3a^2b+3ab^2+b^3$',
            '完全立方差：$(a-b)^3 = a^3-3a^2b+3ab^2-b^3$',
            '立方和：$a^3+b^3 = (a+b)(a^2-ab+b^2)$',
            '立方差：$a^3-b^3 = (a-b)(a^2+ab+b^2)$',
            '完全平方与完全立方的对比记忆：$(a\\pm b)^2$ 展开3项，$(a\\pm b)^3$ 展开4项',
            '立方和与立方差在因式分解中处理高次多项式',
          ],
        },
        {
          type: 'example',
          title: '典型例题',
          items: [
            { title: '例1', question: '展开：$(2x+3y)^3$', steps: ['$(2x+3y)^3 = (2x)^3 + 3(2x)^2(3y) + 3(2x)(3y)^2 + (3y)^3$', '$= 8x^3 + 36x^2y + 54xy^2 + 27y^3$'], answer: '$8x^3+36x^2y+54xy^2+27y^3$' },
            { title: '例2', question: '因式分解：$8x^3 - 27y^3$', steps: ['$8x^3-27y^3 = (2x)^3 - (3y)^3$', '立方差公式：$a^3-b^3 = (a-b)(a^2+ab+b^2)$', '其中 $a=2x, b=3y$', '$= (2x-3y)(4x^2+6xy+9y^2)$'], answer: '$(2x-3y)(4x^2+6xy+9y^2)$' },
            { title: '例3', question: '化简：$\\frac{x^3+1}{x+1}$', steps: ['$x^3+1 = x^3+1^3$', '立方和公式：$x^3+1^3 = (x+1)(x^2-x+1)$', '$\\frac{x^3+1}{x+1} = x^2-x+1$'], answer: '$x^2-x+1$' },
          ],
        },
        {
          type: 'exam-focus',
          title: '考点分析',
          content: '中考/高考常考选填题。完全立方公式在多项式展开中使用；立方和/差公式在因式分解中处理高次式。注意符号规律。',
        },
        {
          type: 'strategy',
          title: '解题思路',
          items: [
            '完全立方有四项，系数按1-3-3-1排列',
            '立方和差是两数和/差乘以不完全平方',
            '不完全平方 $a^2 \\mp ab + b^2$ 没有2倍',
            '注意 $-ab$ 符号：立方和用 $-ab$，立方差用 $+ab$',
          ],
        },
        {
          type: 'common-mistakes',
          title: '易错点辨析',
          items: [
            { mistake: '$(a+b)^3 = a^3+b^3$', correct: '$(a+b)^3 = a^3+3a^2b+3ab^2+b^3$，展开有4项，系数1-3-3-1来自杨辉三角' },
            { mistake: '立方和与立方差公式中的不完全平方记反', correct: '$a^3+b^3=(a+b)(a^2{-}ab+b^2)$，$a^3-b^3=(a-b)(a^2{+}ab+b^2)$' },
          ],
        },
        {
          type: 'extended',
          title: '拓展延伸',
          content: '杨辉三角给出了 $(a+b)^n$ 展开的系数。$(a+b)^3$ 的系数1-3-3-1正是杨辉三角第4行。推广到二项式定理，系数由组合数 $C_n^k$ 给出。',
        },
        {
          type: 'analogy',
          title: '类比理解',
          content: '$(a+b)^3$ 的展开类似于搭建一个 $a+b$ 为边长的立方体——它由 1 个 $a^3$（大立方）、3 个 $a^2b$、3 个 $ab^2$ 和 1 个 $b^3$（小立方）组成。',
        },
      ],
    })
  );

  console.log('\n--- 数列与导数: MATH-07-013 常用求和公式 ---');

  await safeSn('MATH-07-013', '常用求和公式（自然数幂和）', '自然数平方和、立方和等常见求和', 'math', '数列与导数', '高中', 4, 135, null,
    '自然数平方和与立方和是数列求和中最高频使用的两个公式',
    JSON.stringify({
      sections: [
        {
          type: 'definition',
          title: '📖 核心定义',
          content: '自然数平方和 $1^2+2^2+3^2+\\cdots+n^2 = \\frac{n(n+1)(2n+1)}{6}$，立方和 $1^3+2^3+3^3+\\cdots+n^3 = [\\frac{n(n+1)}{2}]^2 = (1+2+\\cdots+n)^2$。这些公式在求数列前n项和、定积分近似计算（黎曼和）、概率统计中都有广泛应用。',
          formulas: ['$\\sum k = \\frac{n(n+1)}{2}$', '$\\sum k^2 = \\frac{n(n+1)(2n+1)}{6}$', '$\\sum k^3 = [\\frac{n(n+1)}{2}]^2$', '$\\sum k(k+1) = \\frac{n(n+1)(n+2)}{3}$', '$\\sum \\frac{1}{k(k+1)} = \\frac{n}{n+1}$'],
        },
        {
          type: 'keypoints',
          title: '核心要点',
          items: [
            '自然数平方和：$\\sum_{k=1}^n k^2 = \\frac{n(n+1)(2n+1)}{6}$',
            '自然数立方和：$\\sum_{k=1}^n k^3 = [\\frac{n(n+1)}{2}]^2$',
            '自然数和：$\\sum_{k=1}^n k = \\frac{n(n+1)}{2}$',
            '立方和的惊人性质：$1^3+2^3+\\cdots+n^3 = (1+2+\\cdots+n)^2$',
          ],
        },
        {
          type: 'example',
          title: '典型例题',
          items: [
            { title: '例1', question: '求 $1^2+2^2+\\cdots+100^2$ 的值。', steps: ['$\\sum_{k=1}^{100} k^2 = 100\\times101\\times201/6 = 338350$'], answer: '338350' },
            { title: '例2', question: '证明：$1^3+2^3+\\cdots+n^3 = (1+2+\\cdots+n)^2$', steps: ['提示：用数学归纳法或构造恒等式 $(k+1)^4-k^4 = 4k^3+6k^2+4k+1$ 左右求和'], answer: '见数学归纳法证明' },
            { title: '例3', question: '求 $\\{n(n+1)\\}$ 的前n项和。', steps: ['$a_n = n^2+n$', '$S_n = \\sum k^2 + \\sum k = n(n+1)(2n+1)/6 + n(n+1)/2 = n(n+1)(n+2)/3$'], answer: '$S_n = n(n+1)(n+2)/3$' },
          ],
        },
        {
          type: 'exam-focus',
          title: '考点分析',
          content: '高考数列大题中的常见"工具公式"。自然数平方和/立方和在裂项求和、分组求和、定积分近似计算中高频出现。',
        },
        {
          type: 'strategy',
          title: '解题思路',
          items: [
            '平方和公式：$n(n+1)(2n+1)/6$',
            '立方和公式：$[n(n+1)/2]^2$ 即 (自然数和)²',
            '记忆技巧：平方和"六分之一恩乘恩加一乘二恩加一"',
          ],
        },
        {
          type: 'common-mistakes',
          title: '易错点辨析',
          items: [
            { mistake: '混淆平方和与自然数和的公式', correct: '$\\sum k = n(n+1)/2$，$\\sum k^2 = n(n+1)(2n+1)/6$，两个不同' },
            { mistake: '认为 $\\sum k^3$ 难记', correct: '记住"立方和 = (自然数和)²"即可，$\\sum k^3 = (\\sum k)^2$' },
          ],
        },
      ],
    })
  );

  console.log('\n--- 添加关系 ---');

  // MATH-02-013 的关系
  await safeSr('MATH-02-005', 'MATH-02-013', 'reference', 100);
  await safeSr('MATH-02-013', 'MATH-02-006', 'prerequisite', 100);

  // MATH-07-013 的关系
  await safeSr('MATH-07-004', 'MATH-07-013', 'reference', 100);
  await safeSr('MATH-07-013', 'MATH-07-012', 'reference', 100);

  const count = await prisma.knowledgeNode.count();
  console.log(`\n✅ 完成！总节点数: ${count}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
