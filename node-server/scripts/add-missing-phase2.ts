/**
 * 批量添加 Phase A-2 所有缺漏节点
 * 用法: npx tsx scripts/add-missing-phase2.ts
 */
import { prisma } from '../src/seeders/helpers.js';

async function safeSn(id: string, title: string, subtitle: string | null,
  subject: string, domain: string, level: string,
  difficulty: number, sortOrder: number, visualType: string | null, summary: string,
  contentJson: string) {
  const exists = await prisma.knowledgeNode.findUnique({ where: { id } });
  if (exists) { console.log(`  ⏭️  ${id} 已存在`); return; }
  await prisma.knowledgeNode.create({
    data: { id, title, subtitle, subject, domain, level, difficulty, sortOrder, visualType, summary, contentJson, status: 1 },
  });
  console.log(`  ✅ ${id} ${title}`);
}

async function safeSr(from: string, to: string, type: string, order: number) {
  const exists = await prisma.knowledgeRelation.findFirst({
    where: { fromNodeId: from, toNodeId: to, relationType: type },
  });
  if (exists) return;
  await prisma.knowledgeRelation.create({
    data: { fromNodeId: from, toNodeId: to, relationType: type, sortOrder: order, description: null },
  });
}

function jc(sections: any[]) {
  return JSON.stringify({ sections });
}

async function main() {
  console.log('📝 Phase A-2: 补齐9个缺漏知识点\n');

  // ================================================================
  // 1. MATH-04-014 三角函数Ⅱ（诱导公式与恒等变换）
  // ================================================================
  await safeSn(
    'MATH-04-014', '三角函数Ⅱ（诱导公式与恒等变换）', '三角恒等变形是三角函数的核心技巧',
    'math', '函数', '高中', 4, 185, null,
    '诱导公式将任意角化锐角，和差倍半公式实现三角恒等变换',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '诱导公式是一组将任意角的三角函数转化为锐角三角函数的公式，口诀"奇变偶不变，符号看象限"。和差角公式 $\sin(\alpha\pm\beta)=\sin\alpha\cos\beta\pm\cos\alpha\sin\beta$，$\cos(\alpha\pm\beta)=\cos\alpha\cos\beta\mp\sin\alpha\sin\beta$。倍角公式 $\sin2\alpha=2\sin\alpha\cos\alpha$，$\cos2\alpha=\cos^2\alpha-\sin^2\alpha=2\cos^2\alpha-1=1-2\sin^2\alpha$。半角公式 $\sin^2\frac{\alpha}{2}=\frac{1-\cos\alpha}{2}$，$\cos^2\frac{\alpha}{2}=\frac{1+\cos\alpha}{2}$。和积互化公式可以实现和差与积的相互转化。这些公式共同组成三角恒等变换的工具箱。',
        formulas: ['诱导公式："奇变偶不变，符号看象限"', '和差角：$\sin(\alpha\pm\beta)=\sin\alpha\cos\beta\pm\cos\alpha\sin\beta$', '和差角：$\cos(\alpha\pm\beta)=\cos\alpha\cos\beta\mp\sin\alpha\sin\beta$', '倍角：$\sin2\alpha=2\sin\alpha\cos\alpha$', '倍角：$\cos2\alpha=\cos^2\alpha-\sin^2\alpha=2\cos^2\alpha-1=1-2\sin^2\alpha$', '半角：$\sin^2\frac{\alpha}{2}=\frac{1-\cos\alpha}{2}$', '半角：$\cos^2\frac{\alpha}{2}=\frac{1+\cos\alpha}{2}$', '和积互化：$\sin\alpha+\sin\beta=2\sin\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2}$'] },
      { type: 'keypoints', title: '核心要点', items: [
        '诱导公式：$\\sin(\\pi-\\alpha)=\\sin\\alpha$，$\\cos(\\pi-\\alpha)=-\\cos\\alpha$ 等',
        '两角和差的正余弦公式是恒等变换的基础',
        '倍角公式可由和角公式令 $\\alpha=\\beta$ 推出',
        '降幂公式：$\\sin^2\\alpha=\\frac{1-\\cos2\\alpha}{2}$，$\\cos^2\\alpha=\\frac{1+\\cos2\\alpha}{2}$',
        '辅助角公式：$a\\sin\\theta+b\\cos\\theta=\\sqrt{a^2+b^2}\\sin(\\theta+\\varphi)$',
        '三角恒等变换的目标：化同名、化同角、化一次',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: '化简：$\\sin15°\\cos15°$', steps: ['这是 $\\frac{1}{2}\\sin30°$ 的形式', '$\\sin15°\\cos15° = \\frac{1}{2}\\sin30° = \\frac{1}{2}\\times\\frac{1}{2}=\\frac{1}{4}$'], answer: '$\\frac{1}{4}$' },
        { title: '例2', question: '已知 $\\sin\\alpha=\\frac{3}{5}$，$\\alpha\\in(\\frac{\\pi}{2},\\pi)$，求 $\\sin2\\alpha$', steps: ['由 $\\sin^2\\alpha+\\cos^2\\alpha=1$ 得 $\\cos\\alpha=-\\frac{4}{5}$', '$\\sin2\\alpha=2\\sin\\alpha\\cos\\alpha=2\\times\\frac{3}{5}\\times(-\\frac{4}{5})=-\\frac{24}{25}$'], answer: '$-\\frac{24}{25}$' },
        { title: '例3', question: '求证：$\\frac{\\sin2\\alpha}{1+\\cos2\\alpha}=\\tan\\alpha$', steps: ['左 $= \\frac{2\\sin\\alpha\\cos\\alpha}{1+(2\\cos^2\\alpha-1)}$', '$= \\frac{2\\sin\\alpha\\cos\\alpha}{2\\cos^2\\alpha} = \\frac{\\sin\\alpha}{\\cos\\alpha} = \\tan\\alpha$'], answer: '等式成立' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '高考必考！三角恒等变换是高考数学的核心考点之一。主要题型：（1）利用诱导公式化简求值（选填）；（2）利用和差倍半公式进行恒等变换（大题第一问常见）；（3）辅助角公式将三角函数化为标准形式求性质。' },
      { type: 'strategy', title: '解题思路', items: [
        '诱导公式："奇变偶不变，符号看象限"',
        '恒等变换三看：看角（拆分组合）、看名（化同名）、看次（升幂降幂）',
        '遇到 $\\sin\\alpha\\pm\\cos\\alpha$ 考虑两边平方',
        '辅助角公式：$a\\sin x+b\\cos x=\\sqrt{a^2+b^2}\\sin(x+\\varphi)$',
        '切割化弦是常用技巧（$\\tan$、$\\cot$ 化为 $\\sin$、$\\cos$）',
      ]},
      { type: 'common-mistakes', title: '易错点辨析', items: [
        { mistake: '诱导公式符号判断错误', correct: '口诀"奇变偶不变，符号看象限"——将 $\\alpha$ 视为锐角判断原函数在各象限的符号' },
        { mistake: '两角和的余弦公式记反为 $\\cos(\\alpha+\\beta)=\\cos\\alpha\\cos\\beta+\\sin\\alpha\\sin\\beta$', correct: '$\\cos(\\alpha+\\beta)=\\cos\\alpha\\cos\\beta\\color{red}{-}\\sin\\alpha\\sin\\beta$，正余余正符号反' },
        { mistake: '倍角公式中 $\\cos2\\alpha$ 的三种形式混乱', correct: '掌握 $\cos2\\alpha=\\cos^2\\alpha-\\sin^2\\alpha=2\\cos^2\\alpha-1=1-2\\sin^2\\alpha$ 及其变形用于降幂' },
      ]},
      { type: 'extended', title: '拓展延伸', content: '和差化积与积化和差公式在高考中虽不直接考查，但在积分计算和信号处理中极其重要。欧拉公式 $e^{i\\theta}=\\cos\\theta+i\\sin\\theta$ 给出了三角函数的复数表示——所有三角恒等式都可以从指数运算律推导出来，展现了数学的统一之美。' },
    ])
  );

  // ================================================================
  // 2. MATH-07-014 递推数列进阶（特征根法、不动点法）
  // ================================================================
  await safeSn(
    'MATH-07-014', '递推数列进阶（特征根法、不动点法）', '高考压轴题的利器',
    'math', '数列与导数', '高中', 5, 137, null,
    '特征根法和不动点法是求解线性递推和分式递推的通用方法',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '特征根法用于求解二阶线性递推数列 $a_{n+2}=pa_{n+1}+qa_n$。令 $x^2=px+q$ 为特征方程，若有两个不等实根 $\\alpha,\\beta$，则 $a_n=A\\alpha^{n-1}+B\\beta^{n-1}$；若重根 $\\alpha$，则 $a_n=(A+Bn)\\alpha^{n-1}$。不动点法用于求解一阶分式递推 $a_{n+1}=\\frac{ka_n+b}{ca_n+d}$，令 $x=\\frac{kx+b}{cx+d}$ 解出不动点，构造等比数列求解。',
        formulas: ['特征方程：$x^2=px+q$', '两异根：$a_n=A\\alpha^{n-1}+B\\beta^{n-1}$', '重根：$a_n=(A+Bn)\\alpha^{n-1}$', '不动点方程：$x=\\frac{kx+b}{cx+d}$'] },
      { type: 'keypoints', title: '核心要点', items: [
        '一阶线性递推 $a_{n+1}=pa_n+q$：构造等比 $a_{n+1}-\\lambda=p(a_n-\\lambda)$',
        '二阶线性递推 $a_{n+1}=pa_n+qa_{n-1}$：特征根法',
        '分式递推 $a_{n+1}=\\frac{ka_n+b}{ca_n+d}$：不动点法',
        'A、B 由初始值 $a_1,a_2$ 确定',
        '特征根为复数时仍适用，通项用三角函数表示',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: '已知 $a_1=1,a_2=2$，$a_{n+2}=3a_{n+1}-2a_n$，求通项。', steps: ['特征方程：$x^2-3x+2=0$，$x_1=1,x_2=2$', '$a_n=A\\cdot1^{n-1}+B\\cdot2^{n-1}=A+B\\cdot2^{n-1}$', '代入 $n=1$：$1=A+B$，$n=2$：$2=A+2B$', '解得 $A=0,B=1$', '$a_n=2^{n-1}$'], answer: '$a_n=2^{n-1}$' },
        { title: '例2', question: '已知 $a_1=2$，$a_{n+1}=\\frac{2a_n+1}{a_n+3}$，求通项。', steps: ['不动点方程：$x=\\frac{2x+1}{x+3}$，$x^2+3x=2x+1$', '$x^2+x-1=0$，$\\alpha,\\beta=\\frac{-1\\pm\\sqrt{5}}{2}$', '构造 $\\frac{a_{n+1}-\\alpha}{a_{n+1}-\\beta}=k\\frac{a_n-\\alpha}{a_n-\\beta}$', '由递推式可算 $k$，代入 $a_1$ 求通项' ], answer: '用不动点法可得等比数列' },
        { title: '例3', question: 'Fibonacci数列：$a_1=1,a_2=1$，$a_{n+2}=a_{n+1}+a_n$，求通项。', steps: ['特征方程：$x^2-x-1=0$，$x=\\frac{1\\pm\\sqrt{5}}{2}$', '$a_n=\\frac{1}{\\sqrt{5}}[(\\frac{1+\\sqrt{5}}{2})^{n-1}-(\\frac{1-\\sqrt{5}}{2})^{n-1}]$'], answer: 'Binet公式' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '高考压轴题常考题型。特征根法解决二阶递推和分式递推求通项。部分省份选考或竞赛难度。' },
      { type: 'strategy', title: '解题思路', items: [
        '先判断递推类型（线性/分式/非线性）',
        '一阶线性 $a_{n+1}=pa_n+q$：待定系数找 $\\lambda$',
        '二阶线性 $a_{n+2}=pa_{n+1}+qa_n$：列特征方程',
        '分式递推：求解不动点方程',
        '最后用初始值确定待定系数',
      ]},
      { type: 'common-mistakes', title: '易错点辨析', items: [
        { mistake: '二阶线性递推中通项形式用错', correct: '两异根 $a_n=A\\alpha^{n-1}+B\\beta^{n-1}$，重根 $a_n=(A+Bn)\\alpha^{n-1}$，底数是 $n-1$ 不是 $n$' },
        { mistake: '特征根法中 A、B 代入 n=1、n=2 解', correct: '根据初始值代入通项公式（底数为 $n-1$ 时用 $a_1$ 和 $a_2$）' },
      ]},
    ])
  );

  // ================================================================
  // 3. PHY-01-017 动量与动量守恒
  // ================================================================
  await safeSn(
    'PHY-01-017', '动量与动量守恒', '力在时间上的累积效应',
    'physics', '力学', '高中', 4, 170, null,
    '动量定理和动量守恒定律是解决碰撞、爆炸等问题的重要工具',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '动量 $p=mv$ 是描述物体运动状态的物理量（矢量，单位 $\\text{kg}\\cdot\\text{m/s}$）。冲量 $I=F\\Delta t$ 是力对时间的累积效应（矢量）。动量定理：合外力的冲量等于动量的变化 $I=\\Delta p$。动量守恒定律：系统不受外力或合外力为零时，系统总动量守恒 $m_1v_1+m_2v_2=m_1v_1\'+m_2v_2\'$。碰撞分为弹性碰撞（动量守恒+机械能守恒）、非弹性碰撞（动量守恒、机械能损失）和完全非弹性碰撞（碰后共速）。',
        formulas: ['动量：$p=mv$', '冲量：$I=F\\Delta t$', '动量定理：$F\\Delta t=\\Delta p=mv\'-mv$', '动量守恒：$m_1v_1+m_2v_2=m_1v_1\'+m_2v_2\'$'] },
      { type: 'keypoints', title: '核心要点', items: [
        '动量是矢量，方向与速度方向相同',
        '动量定理是牛顿第二定律在时间上的积分形式',
        '动量守恒定律是自然界最普遍的守恒定律之一',
        '弹性碰撞：动量守恒+动能守恒',
        '完全非弹性碰撞：碰后共速，动能损失最大',
        '反冲运动：火箭、喷气式飞机',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: '质量 $2\\text{kg}$ 的物体以 $3\\text{m/s}$ 运动，受 $4\\text{N}$ 阻力 $1\\text{s}$ 后速度多少？', steps: ['动量定理：$-F\\Delta t=mv\'-mv$', '$-4\\times1=2v\'-2\\times3$', '$2v\'=6-4=2$', '$v\'=1\\text{m/s}$'], answer: '$1\\text{m/s}$' },
        { title: '例2', question: '$m_1=1\\text{kg}$ 以 $v_1=4\\text{m/s}$ 撞静止 $m_2=2\\text{kg}$，弹性碰撞求碰后速度。', steps: ['动量守恒：$1\\times4=1\\times v_1\'+2\\times v_2\'$', '动能守恒：$\\frac{1}{2}\\times1\\times4^2=\\frac{1}{2}\\times1\\times v_1\'^2+\\frac{1}{2}\\times2\\times v_2\'^2$', '解得 $v_1\'=-\\frac{4}{3}\\text{m/s}$（反向），$v_2\'=\\frac{8}{3}\\text{m/s}$'], answer: '$v_1\'=-\\frac{4}{3}\\text{m/s}$，$v_2\'=\\frac{8}{3}\\text{m/s}$' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '高考必考！动量守恒定律常结合能量守恒考查碰撞、爆炸、板块模型。动量定理多用于变力问题。' },
      { type: 'strategy', title: '解题思路', items: [
        '先判断系统合外力是否为零（或近似为零）',
        '选定正方向，各速度带正负号',
        '列出动量守恒方程',
        '结合能量关系（弹性/非弹性）列第二方程',
        '注意：动量守恒的矢量性',
      ]},
      { type: 'common-mistakes', title: '易错点辨析', items: [
        { mistake: '动量守恒列式时忽略方向，速度全部代正值', correct: '必须规定正方向，速度与正方向相同取正，相反取负' },
        { mistake: '把非弹性碰撞当成弹性碰撞用动能守恒', correct: '只有弹性碰撞（无机械能损失）才可列动能守恒方程' },
      ]},
      { type: 'extended', title: '拓展延伸', content: '动量守恒定律比牛顿定律更基本——在微观世界（量子力学）和相对论中，牛顿定律失效但动量守恒仍然成立。这是由空间的均匀性（平移对称性）决定的（诺特定理）。' },
    ])
  );

  // ================================================================
  // 4. PHY-01-018 机械振动与简谐运动
  // ================================================================
  await safeSn(
    'PHY-01-018', '机械振动与简谐运动', '周期性运动的数学模型',
    'physics', '力学', '高中', 4, 175, null,
    '简谐运动是最基本的周期性运动，振动的位移-时间关系为正弦函数',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '简谐运动（SHM）中回复力 $F=-kx$（与位移成正比、方向相反）。其运动学方程 $x=A\\sin(\\omega t+\\varphi)$，周期 $T=2\\pi\\sqrt{\\frac{m}{k}}$。单摆在小角度下近似简谐振动，周期 $T=2\\pi\\sqrt{\\frac{l}{g}}$。弹簧振子无论水平还是竖直放置，周期均为 $T=2\\pi\\sqrt{\\frac{m}{k}}$。',
        formulas: ['回复力：$F=-kx$', '位移：$x=A\\sin(\\omega t+\\varphi)$', '弹簧振子周期：$T=2\\pi\\sqrt{m/k}$', '单摆周期：$T=2\\pi\\sqrt{l/g}$', '简谐运动能量：$E=\\frac{1}{2}kA^2$'] },
      { type: 'keypoints', title: '核心要点', items: [
        '回复力方向始终指向平衡位置',
        '周期T与振幅A无关（等时性）',
        '位移、速度、加速度随时间按正弦规律变化',
        '平衡位置速度最大、加速度为零',
        '最大位移处速度为零、加速度最大',
        '单摆周期与振幅、摆球质量无关',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: '弹簧振子振幅4cm，周期0.5s，求最大速度和最大加速度。', steps: ['$\\omega=2\\pi/T=4\\pi\\text{rad/s}$', '$v_{max}=\\omega A=4\\pi\\times0.04=0.5\\text{m/s}$', '$a_{max}=\\omega^2 A=(4\\pi)^2\\times0.04=6.3\\text{m/s}^2$'], answer: '$v_{max}=0.5\\text{m/s}$，$a_{max}=6.3\\text{m/s}^2$' },
        { title: '例2', question: '单摆摆长1m，求周期（$g=10$）。', steps: ['$T=2\\pi\\sqrt{l/g}=2\\pi\\sqrt{1/10}=2\\pi\\times0.316=1.99\\text{s}$'], answer: '约$2.0\\text{s}$' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '选考/会考常见题型。简谐运动的特征（回复力、周期公式）和单摆周期公式为考查重点。' },
      { type: 'strategy', title: '解题思路', items: [
        '判断是否为简谐运动：看回复力是否满足 $F=-kx$',
        '简谐运动中 $x$、$v$、$a$ 的相位关系：$a$ 比 $x$ 超前 $\\pi$，$v$ 比 $x$ 超前 $\\pi/2$',
        '利用对称性：从平衡位置到最大位移的时间为 $T/4$',
      ]},
    ])
  );

  // ================================================================
  // 5. PHY-01-019 机械波
  // ================================================================
  await safeSn(
    'PHY-01-019', '机械波', '振动的传播',
    'physics', '力学', '高中', 4, 180, null,
    '机械波是机械振动在介质中的传播，横波纵波各有特色',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '机械波是机械振动在弹性介质中的传播。横波质点振动方向与波传播方向垂直，纵波平行。波速 $v=\\lambda f=\\frac{\\lambda}{T}$。波的干涉：频率相同、相位差恒定的两列波叠加形成稳定干涉图样。波的衍射：波遇到障碍物后偏离直线传播的现象，障碍物尺寸与波长可比时衍射明显。惠更斯原理：波面上的每一点都是新的子波波源。',
        formulas: ['波速：$v=\\lambda/T=\\lambda f$', '波的干涉条件：频率相同、相位差恒定', '惠更斯原理：子波包络面为新波面'] },
      { type: 'keypoints', title: '核心要点', items: [
        '波传播的是振动形式和能量，介质本身不迁移',
        '横波有波峰和波谷，纵波有疏部和密部',
        '波速由介质决定，频率由波源决定',
        '干涉：加强点振幅 $A_1+A_2$，减弱点 $|A_1-A_2|$',
        '衍射明显条件：障碍物尺寸 $\\leq$ 波长',
        '多普勒效应：波源与观察者有相对运动时频率变化',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: '波速 $10\\text{m/s}$，频率 $5\\text{Hz}$，求波长。', steps: ['$\\lambda=v/f=10/5=2\\text{m}$'], answer: '$2\\text{m}$' },
        { title: '例2', question: '两相干波源 $S_1S_2$ 相距 $3\\lambda$，$S_1S_2$ 中点处是加强还是减弱？', steps: ['中点距 $S_1$ 和 $S_2$ 均为 $1.5\\lambda$', '波程差 $\\Delta r=0$，为加强点'], answer: '加强点' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '高考选考模块。波长/波速/频率关系、干涉衍射条件、多普勒效应为高频考点。' },
      { type: 'common-mistakes', title: '易错点辨析', items: [
        { mistake: '混淆波传播方向与质点振动方向', correct: '横波中质点上下振动，波水平传播——质点并不随波迁移' },
        { mistake: '误以为波速由波源决定', correct: '波速由介质决定（同种介质波速相同），频率由波源决定' },
      ]},
    ])
  );

  // ================================================================
  // 6. CHEM-01-010 化学键
  // ================================================================
  await safeSn(
    'CHEM-01-010', '化学键（离子键、共价键、金属键）', '原子间结合力的三种基本形式',
    'chemistry', '物质结构与分类', '高中', 3, 130, null,
    '离子键、共价键、金属键分别通过电子转移、共用和自由电子形成',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '化学键是相邻原子间的强相互作用力。离子键通过电子转移形成阴阳离子，靠静电引力结合（如 NaCl）。共价键通过共用电子对形成（如 H₂、H₂O）。金属键是金属阳离子与自由电子间的静电作用。键能是拆开1mol化学键所需能量。键长是两原子核间的平衡距离。键角决定分子空间构型。',
        formulas: ['离子键：阴阳离子间静电引力', '共价键：共用电子对', '金属键：金属阳离子+自由电子', '键能越大化学键越稳定'] },
      { type: 'keypoints', title: '核心要点', items: [
        '离子键：活泼金属+活泼非金属（如 NaCl、MgO）',
        '共价键：非金属原子之间（如 H₂、HCl、CO₂）',
        '金属键：金属单质和合金内部',
        '共价键分为非极性键（同种原子）和极性键（不同原子）',
        '配位键：一方提供孤电子对的特殊共价键',
        '分子间作用力（范德华力和氢键）不是化学键',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: '判断 NaCl、HCl、Cl₂ 的化学键类型。', steps: ['NaCl：Na 金属+Cl 非金属→电子转移→离子键', 'HCl：H 和 Cl 都是非金属→共用电子对→极性共价键', 'Cl₂：同种非金属→非极性共价键'], answer: 'NaCl 离子键、HCl 极性共价键、Cl₂ 非极性共价键' },
        { title: '例2', question: '下列物质含离子键的是：A. H₂O  B. CO₂  C. MgCl₂  D. HCl', steps: ['H₂O：共价键', 'CO₂：共价键', 'MgCl₂：Mg²⁺和 Cl⁻间的离子键 ✓', 'HCl：共价键'], answer: 'C. MgCl₂' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '会考/高考基础题。判断化学键类型、比较键能大小、区分化学键与分子间作用力。' },
      { type: 'common-mistakes', title: '易错点辨析', items: [
        { mistake: '认为所有含金属的化合物都是离子化合物', correct: 'AlCl₃ 是共价化合物（Al 与 Cl 电负性差不够大）' },
        { mistake: '将氢键当成化学键', correct: '氢键是分子间作用力的一种，比化学键弱得多' },
      ]},
    ])
  );

  // ================================================================
  // 7. CHEM-02-011 电化学基础（原电池与电解池）
  // ================================================================
  await safeSn(
    'CHEM-02-011', '电化学基础（原电池与电解池）', '化学能与电能的互相转化',
    'chemistry', '化学反应', '高中', 4, 155, null,
    '原电池将化学能转化为电能，电解池将电能转化为化学能',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '原电池将自发氧化还原反应的化学能转化为电能，负极发生氧化反应（失电子），正极发生还原反应（得电子）。常见原电池：铜锌原电池（Zn|H₂SO₄|Cu）、燃料电池。电解池在外加电源下使非自发反应发生，阳极（接电源正极）氧化，阴极（接负极）还原。电解饱和食盐水、电镀、金属精炼都是电解的应用。金属腐蚀的本质是原电池反应。',
        formulas: ['铜锌原电池正极：$2H^++2e^-\\to H_2\\uparrow$', '铜锌原电池负极：$Zn-2e^-\\to Zn^{2+}$', '电解水：$2H_2O\\to 2H_2\\uparrow+O_2\\uparrow$', '金属腐蚀：$Fe-2e^-\\to Fe^{2+}$'] },
      { type: 'keypoints', title: '核心要点', items: [
        '原电池：活泼金属为负极（失电子），不活泼金属为正极',
        '电解质溶液中的离子定向移动形成内电路',
        '电解池：阳极与电源正极相连（氧化），阴极与负极相连（还原）',
        '电解规律：阳极发生氧化（活性阳极溶解、惰性阳极析出阴离子对应物质）',
        '金属腐蚀：电化学腐蚀比化学腐蚀快得多',
        '防护方法：牺牲阳极保护法、外加电流保护法',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: 'Cu-Zn原电池，电解质稀H₂SO₄，写出电极反应。', steps: ['负极（Zn）：$Zn-2e^-\\to Zn^{2+}$（氧化）', '正极（Cu）：$2H^++2e^-\\to H_2\\uparrow$（还原）', '总反应：$Zn+2H^+\\to Zn^{2+}+H_2\\uparrow$'], answer: '见步骤' },
        { title: '例2', question: '电解NaCl溶液，写出电极反应。', steps: ['阳极（石墨）：$2Cl^--2e^-\\to Cl_2\\uparrow$', '阴极（石墨）：$2H^++2e^-\\to H_2\\uparrow$', '总反应：$2NaCl+2H_2O\\to 2NaOH+Cl_2\\uparrow+H_2\\uparrow$'], answer: '见步骤' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '高考必考！原电池和电解池的电极判断、电极反应式的书写、电子转移计算。原电池部分常结合新型电池（锂电池、燃料电池）出题。' },
      { type: 'common-mistakes', title: '易错点辨析', items: [
        { mistake: '混淆原电池和电解池的电极名称', correct: '原电池：负极（氧化）、正极（还原）。电解池：阳极（氧化）、阴极（还原）——"阳氧阴还"' },
        { mistake: '认为原电池中较活泼金属一定为负极', correct: '一般是的，但若活泼金属不与电解质反应则不是（如Mg-Al-NaOH中Al为负极）' },
      ]},
    ])
  );

  // ================================================================
  // 8. CHEM-05-011 同分异构体
  // ================================================================
  await safeSn(
    'CHEM-05-011', '同分异构体', '同分子式不同结构的现象',
    'chemistry', '有机化学基础', '高中', 4, 155, null,
    '同分异构现象是有机物种类繁多的根本原因',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '同分异构体是分子式相同但结构不同的化合物。主要类型：（1）碳链异构——碳骨架不同（如正丁烷、异丁烷）；（2）位置异构——官能团位置不同（如1-丁醇、2-丁醇）；（3）官能团异构——官能团不同（如乙醇与甲醚）；（4）立体异构——顺反异构、对映异构。书写同分异构体时，可采用"减碳法"从最长碳链开始逐步缩短主链。',
        formulas: ['C₄H₁₀：正丁烷 CH₃CH₂CH₂CH₃（沸点-0.5°C）和异丁烷 (CH₃)₃CH（沸点-11.7°C）'] },
      { type: 'keypoints', title: '核心要点', items: [
        'C₄H₁₀有2种同分异构体',
        'C₅H₁₂有3种同分异构体',
        'C₆H₁₄有5种同分异构体',
        '同一碳原子上的氢原子等效（判断一卤代物种类）',
        '对称法：利用分子对称性快速判断异构体数目',
        '官能团异构示例：烯烃与环烷烃、醇与醚、醛与酮',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: '写出 C₅H₁₂ 的所有同分异构体。', steps: ['正戊烷：CH₃CH₂CH₂CH₂CH₃', '异戊烷：CH₃CH(CH₃)CH₂CH₃', '新戊烷：C(CH₃)₄'], answer: '3种（正戊烷、异戊烷、新戊烷）' },
        { title: '例2', question: '分子式 C₄H₁₀O 属于醇的同分异构体有几种？', steps: ['丁醇：C₄H₉OH，丁基有4种异构', '正丁基→1-丁醇', '仲丁基→2-丁醇', '异丁基→2-甲基-1-丙醇', '叔丁基→2-甲基-2-丙醇'], answer: '4种' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '高考必考！同分异构体数目的判断是选择题高频题型。一般考查C₅以内烷烃、一卤代物、醇、羧酸等简单衍生物的同分异构体数目。' },
      { type: 'common-mistakes', title: '易错点辨析', items: [
        { mistake: '写同分异构体时漏写或重复', correct: '用"减碳法"系统书写：先写最长碳链→减1个C作支链→移动支链位置→再减C→保证不重复' },
        { mistake: '不考虑碳原子的四价原则', correct: '每个碳原子必须形成4个共价键，画结构式后检查每个碳的连键数' },
      ]},
    ])
  );

  // ================================================================
  // 9. CHEM-05-012 官能团与有机反应类型
  // ================================================================
  await safeSn(
    'CHEM-05-012', '官能团与有机反应类型', '有机化学的"功能模块"',
    'chemistry', '有机化学基础', '高中', 4, 160, null,
    '官能团决定有机物主要化学性质，反应类型体现有机反应规律',
    jc([
      { type: 'definition', title: '📖 核心定义',
        content: '官能团是决定有机物化学特性的原子或基团。常见官能团：碳碳双键 C=C（烯烃）、碳碳三键 C≡C（炔烃）、羟基 -OH（醇/酚）、醛基 -CHO（醛）、羰基 C=O（酮）、羧基 -COOH（羧酸）、酯基 -COO-（酯）、氨基 -NH₂（胺）、酰胺基 -CONH-（酰胺）。主要有机反应类型：取代（烷烃卤代、苯的硝化、酯化、水解）、加成（烯烃与Br₂/H₂/HX、乙炔水化）、消去（醇脱水、卤代烃脱HX）、氧化（醇→醛→酸、烯烃氧化）、还原（醛→醇）、加聚（烯烃聚合）、缩聚（酚醛树脂、聚酯）。',
        formulas: ['烯烃加成：$RCH=CH_2+Br_2\\to RCHBrCH_2Br$', '酯化：$RCOOH+R\'OH \\rightleftharpoons RCOOR\'+H_2O$', '醇消去：$C_2H_5OH\\xrightarrow{浓H_2SO_4,170°C} CH_2=CH_2+H_2O$'] },
      { type: 'keypoints', title: '核心要点', items: [
        '碳碳双键：加成反应（使Br₂/KMnO₄褪色）、加聚反应',
        '羟基 -OH：醇→酯化、氧化（Cu/O₂→醛/酮）、消去（浓H₂SO₄）',
        '醛基 -CHO：银镜反应、新制Cu(OH)₂（醛的特征鉴别）',
        '羧基 -COOH：酸性、酯化反应',
        '酯基 -COO-：水解（酸性/碱性均可，碱性完全）',
        '取代、加成、消去是有机三大基本反应类型',
      ]},
      { type: 'example', title: '典型例题', items: [
        { title: '例1', question: '乙烯($CH_2=CH_2$)与Br₂反应属于什么类型？生成什么？', steps: ['C=C双键打开，Br原子分别加到两个碳上', '反应类型：加成反应', '生成：$CH_2BrCH_2Br$（1,2-二溴乙烷）'], answer: '加成反应，生成1,2-二溴乙烷' },
        { title: '例2', question: '如何鉴别乙醇和乙酸？', steps: ['乙醇：中性，不与NaHCO₃反应，可被CuO氧化为乙醛（有刺激性气味）', '乙酸：酸性，与NaHCO₃反应产生CO₂气体', '操作：分别加入NaHCO₃溶液，有气泡产生的为乙酸'], answer: '加入NaHCO₃，产生气泡的是乙酸' },
        { title: '例3', question: '写出乙酸和乙醇在浓H₂SO₄加热下的反应方程式。', steps: ['$CH_3COOH+C_2H_5OH\\xrightarrow{浓H_2SO_4,\\Delta} CH_3COOC_2H_5+H_2O$', '反应类型：酯化反应（也是取代反应的一种）'], answer: '生成乙酸乙酯（果香味）' },
      ]},
      { type: 'exam-focus', title: '考点分析', content: '高考必考！官能团的性质鉴别、反应类型判断、有机合成路线设计的基础。官能团转化是有机推断题的核心线索。' },
      { type: 'strategy', title: '解题思路', items: [
        '根据分子式不饱和度判断可能含有的官能团',
        '官能团决定化学性质，记住各官能团的特征反应',
        '有机推断题中，以官能团转化为线索串联反应路线',
        '鉴别题：利用不同官能团的差异反应进行区分',
      ]},
      { type: 'common-mistakes', title: '易错点辨析', items: [
        { mistake: '混淆醇羟基和酚羟基的性质', correct: '醇羟基中性、不与NaOH反应；酚羟基弱酸性、与NaOH反应但不与NaHCO₃反应' },
        { mistake: '消去反应的条件记混', correct: '醇消去：浓H₂SO₄、170°C（分子内脱水）。醇分子间脱水成醚：浓H₂SO₄、140°C' },
      ]},
    ])
  );

  // ========== 关系 ==========
  console.log('\n--- 添加关系 ---\n');
  await safeSr('MATH-04-010', 'MATH-04-014', 'prerequisite', 100);     // 三角比→恒等变换
  await safeSr('MATH-04-014', 'MATH-04-011', 'prerequisite', 100);     // 恒等变换→正弦型函数
  await safeSr('MATH-04-014', 'MATH-05-010', 'prerequisite', 100);     // 恒等变换→解三角形

  await safeSr('MATH-07-012', 'MATH-07-014', 'reference', 100);        // 数列极限→递推进阶
  await safeSr('MATH-07-014', 'MATH-07-005', 'reference', 100);        // 递推进阶→数学归纳法

  await safeSr('PHY-01-008', 'PHY-01-017', 'prerequisite', 100);       // 匀变速→动量
  await safeSr('PHY-01-006', 'PHY-01-017', 'reference', 100);          // 牛顿二定律→动量

  await safeSr('PHY-01-014', 'PHY-01-018', 'prerequisite', 100);       // 曲线运动→振动
  await safeSr('PHY-01-018', 'PHY-01-019', 'prerequisite', 100);       // 振动→波

  await safeSr('CHEM-01-004', 'CHEM-01-010', 'prerequisite', 100);     // 原子结构→化学键
  await safeSr('CHEM-01-010', 'CHEM-01-003', 'reference', 100);        // 化学键→分子与离子

  await safeSr('CHEM-02-004', 'CHEM-02-011', 'prerequisite', 100);     // 氧化还原→电化学
  await safeSr('CHEM-02-011', 'CHEM-02-008', 'reference', 100);        // 电化学→化学平衡

  await safeSr('CHEM-05-004', 'CHEM-05-011', 'reference', 100);        // 芳香烃→同分异构
  await safeSr('CHEM-05-011', 'CHEM-05-012', 'reference', 100);        // 同分异构→官能团

  await safeSr('CHEM-05-001', 'CHEM-05-012', 'prerequisite', 100);     // 有机概述→官能团

  // ========== 结果 ==========
  const total = await prisma.knowledgeNode.count();
  console.log(`\n✅ 完成！总节点数: ${total}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
