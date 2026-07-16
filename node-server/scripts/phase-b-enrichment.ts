/**
 * Phase B — 内容拓展迁移脚本
 * 
 * 为所有知识点添加「思维拓展」「数学史话」「跨域链接」板块
 * 基于学科/领域生成定制化的拓展内容
 * 
 * 用法: npx tsx scripts/phase-b-enrichment.ts
 */
import { prisma } from '../src/seeders/helpers.js';

// ─── 数学史话库 ───

const MATH_HISTORY: Record<string, string> = {
  default: '数学的发展是人类文明进步的缩影。从古埃及的尼罗河灌溉测量到古希腊的欧几里得几何，从阿拉伯的代数学到牛顿和莱布尼茨的微积分，每一个数学概念背后都有跌宕起伏的故事。',
  '勾股': '勾股定理是人类最古老的数学定理之一。古埃及人用绳子打结构造直角三角形来测量土地；古巴比伦人在公元前1800年就在泥板上记录了勾股数（如3-4-5）；中国《周髀算经》记载了"勾广三，股修四，径隅五"（约公元前1000年）。而毕达哥拉斯学派发现这一定理后，竟因发现了无理数√2而引发了第一次数学危机——他们把一个忠实信徒扔进了地中海！',
  '圆': '圆周率π的计算贯穿了整个人类文明史：古埃及人算得约3.16，阿基米德用96边形算到3.14，祖冲之用24576边形算到3.1415926（领先世界800年），而现在计算机已算到100万亿位。π的超越性（1882年林德曼证明）意味着"化圆为方"的不可能——一个困扰人类2000年的问题终于落幕。',
  '黄金': '斐波那契在《计算之书》中提出了兔子繁殖问题，由此诞生了斐波那契数列。而黄金比例φ却在更早的古希腊就已经被研究——欧几里得在《几何原本》中给出了"中外比"的定义。文艺复兴时期的艺术家们（达芬奇、米开朗基罗）将黄金比例奉为美学的至高准则。',
  '复数': '虚数单位i的发现源于16世纪意大利数学家卡尔达诺解三次方程时的奇思妙想——"负数的平方根"在当时的数学界被视为荒谬。欧拉在1777年引入了i这个符号，高斯则给出了复数的几何解释。如今，复数已成为物理、工程、计算机科学不可或缺的工具。',
  '向量': '向量的概念经历了漫长的演化：从古希腊的"合成运动"思想，到高斯在《算术研究》中的向量加法，再到19世纪哈密顿发明四元数（3维向量的前身），最后吉布斯和赫维赛德将向量分析体系化。如今向量是物理、工程、计算机图形学的基础。',
  '微积分': '微积分的发明引发了数学史上最著名的优先权之争——牛顿和莱布尼茨各自独立发明了微积分。牛顿的"流数术"更偏向物理应用，莱布尼茨的符号系统则更优雅并沿用至今。这场争论导致英国数学落后欧洲大陆近百年。微积分被誉为"上帝的语言"，它使得人类可以用方程描述宇宙的运行规律。',
  '概率': '概率论起源于赌博！1654年，赌徒梅雷向帕斯卡请教骰子问题，帕斯卡与费马通过通信创立了概率论的基础。后来的拉普拉斯将概率论系统化，而柯尔莫哥洛夫在1933年建立了概率论的公理体系。如今概率论是物理、金融、AI的基石。',
  '数列': '数学家高斯10岁时，老师为让全班安静要求大家计算1+2+...+100。高斯立刻写下了5050——他用配对法（首尾相加）发现了等差数列求和公式。这个传奇故事激励了无数数学爱好者。',
  '素数': '素数是数学中最迷人、最神秘的研究对象。欧几里得在《几何原本》中证明了素数有无穷多个，而黎曼猜想（关于素数分布规律）至今仍是数学界最大的未解之谜之一，被列为千禧年七大难题。',
  '费马': '费马大定理：$x^n+y^n=z^n$ 在n>2时无正整数解。1637年费马在书的空白处写下这个猜想，并标注"我发现了一个绝妙的证明，但这里空白太小写不下"。这个"空白"让数学家们奋斗了358年——直到1994年英国数学家怀尔斯用椭圆曲线证明了它，成为20世纪数学最伟大的成就之一。',
  '欧拉': '莱昂哈德·欧拉是数学史上最高产的数学家，一生写了886篇论文，即使在完全失明后仍通过口述发表了400多篇论文。他引入了$f(x)$、$e$、$\pi$、$i$、$\Sigma$ 等数学符号，几乎以一己之力塑造了现代数学的书写语言。欧拉公式 $e^{i\pi}+1=0$ 被誉为"上帝创造的公式"，它将五个最重要的数学常数完美统一。',
};

const PHYSICS_HISTORY: Record<string, string> = {
  default: '物理学的每一次飞跃都重塑了人类对世界的认知。从亚里士多德到伽利略，从牛顿到爱因斯坦，从玻尔到费曼——物理学家们用实验和数学，一层层揭开自然的面纱。',
  '牛顿': '苹果落地的故事或许只是传说，但牛顿万有引力定律的发现确实改变了世界。传说1666年（牛顿23岁时），因为瘟疫大学关闭，牛顿回到家乡。在那18个月里，他发明了微积分、发现了万有引力定律、打开了光学的大门——这是科学史上最惊人的"生产力爆发"！',
  '相对论': '爱因斯坦在1905年（26岁，专利局职员）发表了狭义相对论，彻底颠覆了牛顿的绝对时空观。他用了11年才将引力纳入相对论框架——1915年的广义相对论将引力解释为时空的弯曲。2019年，事件视界望远镜拍到了人类历史上第一张黑洞照片，直接验证了广义相对论的预言。',
  '量子': '量子力学的诞生充满了戏剧性：普朗克在1900年为了解决"紫外灾难"提出了能量量子化的假说——但他本人并不相信这个假说，称之为"不得已的权宜之计"。玻尔、海森堡、薛定谔、狄拉克等一群天才在接下来的30年里构建了量子力学的大厦。爱因斯坦对此一直持怀疑态度，他的名言"上帝不掷骰子"代表了与哥本哈根学派的深刻分歧。',
  '电磁': '麦克斯韦用一组优美的方程统一了电学和磁学，预言了电磁波的存在。赫兹用实验验证了电磁波，而马可尼将它用于无线电通信。麦克斯韦方程组被认为是人类最优雅的物理学成就——它简洁、统一、完美，启发了爱因斯坦的狭义相对论。',
  '动量': '动量守恒定律比牛顿定律更基本：在微观世界（量子力学）和相对论中，牛顿定律失效但动量守恒仍然成立。这是因为动量守恒是空间平移对称性的直接结果（诺特定理）——对称性意味着守恒律，这是物理学最深刻的洞见之一。',
  '熵': '热力学第二定律（熵增定律）被认为是物理学最"忧伤"的定律——它意味着宇宙在不可逆地走向混乱。克劳修斯在1865年引入了"熵"的概念，玻尔兹曼将熵解释为系统微观状态数的度量。玻尔兹曼的墓碑上刻着熵的统计公式 $S=k\\ln W$，这是他对物理学最伟大的贡献。',
};

const CHEMISTRY_HISTORY: Record<string, string> = {
  default: '化学从炼金术的古老传统中诞生，经过拉瓦锡的"化学革命"、道尔顿的原子论、门捷列夫的元素周期表，发展到今天分子设计和材料科学的前沿。',
  '元素周期表': '门捷列夫在1869年提出元素周期表时，只发现了63种元素。他根据周期律大胆预测了尚未发现的元素（镓、钪、锗）的性质，后来这些元素被一一发现，性质与他的预测惊人地吻合——这是科学史上最伟大的预测之一！',
  '化学键': '化学键的概念经历了从"亲和力"的模糊认知到量子力学的精确描述的漫长历程。路易斯在1916年提出了共价键的电子对理论，泡林则用量子力学解释了化学键的本质，获得了1954年的诺贝尔化学奖。他还在晚年致力于维生素C的研究，颇具争议。',
  '有机': '有机化学的名称来源于"生命力论"——当时人们认为有机物只能由生物体中的"生命力"创造。1828年，维勒用无机物氰酸铵合成了尿素，彻底推翻了生命力论，开创了有机合成的新纪元。',
  '反应': '19世纪，俄国化学家布特列洛夫提出了化学结构理论，使化学从"收集事实"的学科转变为"可以预测"的科学。这是化学史上的一次范式革命。',
  '催化剂': '催化剂的概念源于1835年贝采里乌斯提出的"催化力"假说。而催化在现代化学工业中扮演着核心角色——从哈伯的合成氨（1918年诺贝尔奖，挽救了数十亿人的生命）到汽车尾气催化转化器，催化剂的发现和应用深刻改变了人类生活。',
};

// ─── 思维拓展模板 ───

function getMathExtension(domain: string, title: string): string[] {
  const base: string[] = [];
  
  if (title.includes('方程') || title.includes('不等式')) {
    base.push('想一想：如果增加未知数的个数或提高方程的次数，解法会有什么变化？');
    base.push('推广思考：将等式关系推广为不等式关系，原来的结论还成立吗？');
    base.push('逆向思维：已知解的情况，能否反推出方程中参数的范围？');
  } else if (title.includes('函数')) {
    base.push('变式思考：将函数中的参数改变，图像会发生怎样的变换？');
    base.push('推广思考：将一元函数推广到多元函数，概念如何拓展？');
    base.push('跨域思考：这个函数在物理/经济中有什么实际应用场景？');
  } else if (title.includes('三角')) {
    base.push('推广思考：将角度从锐角推广到任意角，三角函数的定义如何变化？');
    base.push('逆向思维：已知三角函数值求角度，解是否唯一？');
    base.push('跨域链接：三角函数与复数、振动、波的深度联系。');
  } else if (title.includes('几何') || title.includes('三角形') || title.includes('圆')) {
    base.push('推广思考：将平面图形推广到三维空间，结论会变成什么？');
    base.push('变式思考：如果条件中的相等改为成比例，结论如何变化？');
    base.push('逆向思维：已知结论成立，能否反推出条件？');
  } else if (title.includes('数列')) {
    base.push('推广思考：将等差数列/等比数列分别推广到高阶等差/等比数列。');
    base.push('变式思考：能否找出规律，写出第n项的表达式？');
    base.push('联系思考：数列与函数的本质关系是什么？');
  } else if (title.includes('向量')) {
    base.push('推广思考：将二维向量推广到n维向量，哪些性质仍然成立？');
    base.push('跨域链接：向量在物理（力、速度）、计算机图形学中的广泛应用。');
  } else if (title.includes('概率') || title.includes('统计') || title.includes('排列') || title.includes('组合')) {
    base.push('逆向思考：从"正难则反"的角度——先计算反面情况再求补集。');
    base.push('推广思考：能否用这个计数/概率方法解决生活中遇到的实际问题？');
    base.push('变式思考：如果允许重复选择，结果会有什么变化？');
  } else if (title.includes('极限') || title.includes('导数') || title.includes('积分')) {
    base.push('哲学思考：极限思想体现了"有限到无限"的飞跃——这是人类思维对存在方式的超越。');
    base.push('推广思考：导数是一阶变化率，高阶导数刻画了什么？');
    base.push('联系思考：微分和积分这对"逆运算"体现了数学中深刻的对偶性。');
  } else if (title.includes('复数')) {
    base.push('哲学思考：复数使代数方程有了完整的解空间——这是数学从"看得见的数"到"想得到的数"的跨越。');
    base.push('跨域链接：复数与三角函数的联系——欧拉公式 $e^{i\\theta}=\\cos\\theta+i\\sin\\theta$');
  } else if (title.includes('集合')) {
    base.push('哲学思考：集合论是数学的基础语言——几乎所有数学对象都可以用集合来定义。');
    base.push('拓展思考：罗素悖论揭示了"包含一切集合的集合"在逻辑上的矛盾，推动了公理化集合论的发展。');
  } else {
    base.push('推广思考：这个知识点能否推广到更一般的情形？');
    base.push('逆向思考：如果条件反过来，结论还成立吗？');
  }
  
  return base;
}

function getPhysicsExtension(domain: string, title: string): string[] {
  const base: string[] = [];
  
  if (title.includes('牛顿') || title.includes('力')) {
    base.push('哲学思考：牛顿力学是决定论的典范——如果知道所有粒子的位置和速度，理论上可以预知一切。但混沌理论和量子力学揭示了这种决定论的局限。');
    base.push('应用拓展：力学原理在航天工程（火箭发射、卫星轨道）、体育科学（投掷/跳跃的最佳角度）中广泛应用。');
  } else if (title.includes('运动') || title.includes('速度') || title.includes('加速度')) {
    base.push('跨域思考：运动学与微积分的联系——速度是位置的导数，加速度是速度的导数。');
    base.push('思维拓展：同一运动在不同参考系中的描述不同——伽利略相对性原理的萌芽。');
  } else if (title.includes('电磁') || title.includes('电场') || title.includes('磁场') || title.includes('电流')) {
    base.push('哲学思考：电磁场的引入是物理学中"场"概念的诞生——这是远超"超距作用"的思想飞跃。');
    base.push('跨域链接：电磁学与光学的统一——光就是电磁波。');
    base.push('应用拓展：电磁学是现代文明的基础——电力系统、无线电通信、电磁炉、MRI（核磁共振成像）。');
  } else if (title.includes('波') || title.includes('振动') || title.includes('声') || title.includes('光')) {
    base.push('哲学思考："波粒二象性"揭示了微观世界的诡异本质——光既是波又是粒子，取决于你如何测量它。');
    base.push('跨域链接：傅里叶分析可以将任何波分解为正弦波的叠加——这是数学与物理的完美结合。');
  } else if (title.includes('热') || title.includes('熵') || title.includes('温度')) {
    base.push('哲学思考：热力学第二定律（熵增）被认为是物理学"时间箭头"的体现——时间为什么只能向前？这至今是物理学最深奥的问题之一。');
    base.push('跨域链接：统计力学将宏观的热学现象还原为微观粒子的统计行为——这是"还原论"的胜利。');
  } else if (title.includes('量子') || title.includes('原子') || title.includes('相对论') || title.includes('核')) {
    base.push('哲学思考：量子力学和相对论颠覆了人类的"常识"——世界并不像我们感官感受到的那样运作。');
    base.push('应用拓展：基于量子力学原理的半导体技术、激光、GPS（需相对论修正）是现代技术的基础。');
  } else {
    base.push('应用思考：这个物理原理在生活中有什么实际应用？');
    base.push('跨域链接：这个知识点在工程技术中如何被利用？');
  }
  
  return base;
}

function getChemistryExtension(domain: string, title: string): string[] {
  const base: string[] = [];
  
  if (title.includes('周期') || title.includes('元素')) {
    base.push('思维拓展：门捷列夫能预测未发现元素的性质——这是科学归纳法的典范。');
    base.push('跨域链接：元素周期律的微观本质是原子核外电子排布的周期性。');
  } else if (title.includes('化学键') || title.includes('分子') || title.includes('原子')) {
    base.push('跨域链接：化学键的本质需要用量子力学解释——化学与物理在这里交汇。');
    base.push('思维拓展：从离子键到共价键是一个连续过渡的过程，中间有极性共价键。');
  } else if (title.includes('有机') || title.includes('烃') || title.includes('官能团')) {
    base.push('应用拓展：有机合成让人类可以制造自然界不存在的物质——塑料、合成纤维、药物。');
    base.push('哲学思考：碳基生命可能不是宇宙的偶然——碳的成键能力使它成为生命最理想的"骨架"。');
  } else if (title.includes('反应') || title.includes('速率') || title.includes('平衡')) {
    base.push('思维拓展：勒夏特列原理可以推广到更一般的"稳态系统对外界变化的响应"。');
    base.push('应用拓展：哈伯法合成氨通过控制条件（高压、催化剂）使反应平衡向右移动——养活了一半地球人。');
  } else if (title.includes('溶液') || title.includes('浓度') || title.includes('pH')) {
    base.push('跨域链接：溶液中的离子平衡与人体内环境的稳态维持密切相关。');
    base.push('应用拓展：pH控制在农业（土壤酸化）、工业（水处理）、医学（血液酸碱平衡）中至关重要。');
  } else if (title.includes('氧化还原') || title.includes('电化学') || title.includes('电解')) {
    base.push('应用拓展：电化学是绿色能源（氢燃料电池、锂离子电池）的核心技术基础。');
    base.push('思维拓展：氧化和还原总是同时发生——这是一种"对称性"思想。');
  } else {
    base.push('生活链接：这个化学知识在日常生活中有哪些体现？');
    base.push('思维拓展：如果将反应条件改变（温度/压力/催化剂），结果会怎样？');
  }
  
  return base;
}

// ─── 主函数 ───

async function main() {
  console.log('📝 Phase B — 内容拓展迁移\n');

  const nodes = await prisma.knowledgeNode.findMany({ orderBy: { id: 'asc' } });
  console.log(`  共 ${nodes.length} 个节点\n`);

  let enriched = 0;
  let skipped = 0;

  for (const node of nodes) {
    const content = node.contentJson;
    if (!content) { skipped++; continue; }

    try {
      const parsed = JSON.parse(content);
      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        skipped++; continue;
      }

      // 检查是否已有拓展板块
      const hasExtended = parsed.sections.some((s: any) =>
        s.type === 'extended-thinking' || s.type === 'history' || s.type === 'cross-domain'
      );
      if (hasExtended) { skipped++; continue; }

      // 生成定制拓展内容
      const subject = node.subject;
      const domain = node.domain;
      const title = node.title || '';
      const summary = node.summary || '';

      let historyContent = '';
      let extensionPoints: string[] = [];

      if (subject === 'math') {
        // 查找匹配的数学史
        for (const [key, value] of Object.entries(MATH_HISTORY)) {
          if (title.includes(key) || summary.includes(key)) {
            historyContent = value;
            break;
          }
        }
        if (!historyContent) historyContent = MATH_HISTORY.default;
        extensionPoints = getMathExtension(domain, title);
      } else if (subject === 'physics') {
        for (const [key, value] of Object.entries(PHYSICS_HISTORY)) {
          if (title.includes(key) || summary.includes(key)) {
            historyContent = value;
            break;
          }
        }
        if (!historyContent) historyContent = PHYSICS_HISTORY.default;
        extensionPoints = getPhysicsExtension(domain, title);
      } else if (subject === 'chemistry') {
        for (const [key, value] of Object.entries(CHEMISTRY_HISTORY)) {
          if (title.includes(key) || summary.includes(key)) {
            historyContent = value;
            break;
          }
        }
        if (!historyContent) historyContent = CHEMISTRY_HISTORY.default;
        extensionPoints = getChemistryExtension(domain, title);
      }

      // 插入拓展板块
      const newSections = [...parsed.sections];

      // 思维拓展 — 放在 example 和 exam-focus 之间
      const insertIdx = newSections.findIndex((s: any) =>
        s.type === 'exam-focus' || s.type === 'strategy' || s.type === 'common-mistakes'
      );
      const atIdx = insertIdx > 0 ? insertIdx : newSections.length - 1;

      newSections.splice(atIdx, 0, {
        type: 'extended-thinking',
        title: '🧩 思维拓展',
        items: extensionPoints.map(p => ({ content: p })),
      });

      // 数学史话 / 科学史话
      if (historyContent) {
        newSections.splice(atIdx, 0, {
          type: 'history',
          title: subject === 'math' ? '🌍 数学史话' : '🔬 科学史话',
          content: historyContent,
        });
      }

      // 更新 contentJson
      await prisma.knowledgeNode.update({
        where: { id: node.id },
        data: { contentJson: JSON.stringify({ sections: newSections }) },
      });

      enriched++;
      if (enriched % 20 === 0) console.log(`  ✅ 已处理 ${enriched} 个节点...`);
    } catch (e) {
      console.error(`  ❌ 节点 ${node.id} 失败:`, e);
      skipped++;
    }
  }

  console.log(`\n✅ 完成！已拓展 ${enriched} 个节点，跳过 ${skipped} 个。`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
