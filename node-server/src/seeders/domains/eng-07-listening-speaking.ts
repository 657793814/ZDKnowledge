/**
 * 📊 英语听力与口语 — 听力理解策略、日常会话、口语发音、情景交际、演讲陈述
 * 人教版教材同步 + 拓展 + 考点
 */
import { sn, sr, richContent } from '../helpers.js';

export async function seedEnglishListeningDomain() {
  console.log('  → 听力与口语');

  // ===================================================================
  // ENG-07-001 听力理解策略
  // ===================================================================
  await sn('ENG-07-001', '听力理解策略', '听前预测、关键词捕捉、笔记技巧、数字与时间听辨、连读弱读识别', 'eng', '听力与口语', '高中', 4, 100, null,
    '掌握英语听力的系统性策略，提升听力理解效率与准确率',
    richContent(
      '英语听力理解是一个主动的认知过程，涉及语音识别、词汇提取、语法分析和意义建构等多个环节。有效使用听力策略可以显著提升理解效果。关键策略包括听前预测（利用题目和选项预先推测内容）、关键词捕捉（锁定实词信息）、笔记技巧（速记关键数据和逻辑关系）、数字与时间听辨（辨别易混淆的发音）以及连读弱读识别（适应真实语流）。',
      [
        '听前预测：考试时有5-10秒读题时间，快速浏览题目和选项，预测谈话主题、场景和可能的问题方向',
        '关键词法：注意名词、动词、数字、时间等实词，它们承载了最核心的信息',
        '笔记速记技巧：使用符号（↑↓→←√×=）、缩写（w/ → with, b/c → because, imp → important）、字母代替完整拼音',
        '数字听辨难点：-teen与-ty的区分（thirteen vs thirty）、小数点与百分比的读法、大数字的千分位处理',
        '时间表达辨别：a quarter past / half past / ten to / after / before 等不同表达方式',
        '连读规则捕捉：辅音+元音连读（not at all → no-ta-tall）、同化（ten minutes → tem minutes）、省音（want to → wanna）',
        '弱读识别：代词、介词、助动词在句子中常常弱读，不可依赖单个词的清晰发音',
      ],
      ['Predict the topic from the first question before listening.', 'Write down key numbers and names in shorthand.', 'Focus on stressed words — they carry the main meaning.'],
      [
        { title: '例1', question: '听力题目：Where does the conversation probably take place? 选项：A. In a library  B. In a restaurant  C. In a hospital。听前如何预测？',
          steps: ['看题目类型——场景判断', '看选项——图书馆/餐馆/医院，都是地点场景', '预测可能听到的关键词：library→book/quiet/shelf；restaurant→menu/order/bill；hospital→patient/doctor/medicine', '带着关键词预判去听，听到哪个场景的关键词就锁定对应选项'],
          answer: '预测各场景关键词，听到相关词汇时快速匹配。如听到 "May I take your order, sir?" → B. In a restaurant' },
        { title: '例2', question: '听力原文："The lecture starts at a quarter to eight." 录音播放后你该记什么？',
          steps: ['首先捕捉时间信息——a quarter to eight', '时间速记：7:45 或写成 8-15 或直接用 7:45', '注意其他可能的信息：地点、讲座主题、长度等', '如果需要区分上午/下午，补上am/pm'],
          answer: '速记时间 7:45，同时记录主题和地点等信息以备后续问题' },
      ],
      '听力理解是高考英语的重要题型（满分150中占30分）。策略性训练比盲目刷题更有效。听前预测+关键词捕捉能提升20-30%的理解率。',
      ['1. 充分利用读题时间做听前预测', '2. 边听边记关键信息，不要试图记住整句', '3. 遇到听不懂的单词果断跳过，抓住整体意思'],
      [
        { mistake: '试图听懂每个单词，结果错过关键信息', correct: '抓大放小——重点是整体理解和关键细节，个别生词不影响大意' },
        { mistake: '听到数字不经思考直接选', correct: '数字出现时快速笔记，注意干扰信息（对话中可能出现多个数字，只有一个是答案）' },
      ],
      '英语听力和中文听力本质相同——你不是在"做听力题"，而是在"获取信息"。回想你听中文新闻时不会逐词分析，而是抓住"谁做了什么"。英语听力也一样。'
    )
  );

  // ===================================================================
  // ENG-07-002 日常会话表达
  // ===================================================================
  await sn('ENG-07-002', '日常会话表达', '问候介绍、购物餐饮、问路指路、电话用语、请求与道歉', 'eng', '听力与口语', '初中', 3, 110, null,
    '掌握英语日常交际中的常用句型和地道表达，能够流畅进行日常生活会话',
    richContent(
      '日常会话（Daily Conversation）是英语交际能力的核心基础。熟练掌握问候介绍、购物餐饮、问路指路、电话用语等场景的常用表达，不仅能应对考试中的情景对话，更是实际交流的第一步。地道的日常会话不仅仅是单词的堆砌，更包括语调、反应速度和文化习惯的运用。',
      [
        '问候与介绍：陌生人初次见面用 "How do you do?" 正式，朋友间用 "How are you doing? / What\'s up?" 随意',
        '自我介绍三要素：name + background/occupation + purpose/feeling ("Hi, I\'m Li Hua, a high school student from Beijing. Nice to meet you!")',
        '购物用语：问价 "How much is it?" / 试穿 "Can I try it on?" / 砍价 "Is there any discount?" / 结账 "I\'ll take it."',
        '餐饮场景：预订 "I\'d like to book a table for two." / 点餐 "May I see the menu?" / 买单 "Check, please."',
        '问路指路：问路 "Excuse me, how can I get to...?" / 指路 "Go straight, then turn left at the second crossing." / 距离 "It\'s about ten minutes\' walk."',
        '电话用语：接电话 "Hello, this is John speaking." / 找人 "May I speak to...?" / 留言 "Can I leave a message?" / 打错 "Sorry, wrong number."',
        '请求与道歉：请求 "Could you please...?" / 委婉 "I was wondering if you could..." / 道歉 "I\'m terribly sorry for..." / 解释 "It was my fault."',
      ],
      ['Hello, this is Li Ming speaking. May I speak to Mr. Wang?', 'Excuse me, could you tell me the way to the nearest subway station?', 'I\'d like to order a cup of coffee and a sandwich, please.'],
      [
        { title: '例1', question: '在飞机上，你想让邻座的人帮你递一下水，应该怎么表达？',
          steps: ['先说 Excuse me 引起注意', '用 Could you please... 的礼貌句式', '明确需求：pass me a glass of water / help me with the water'],
          answer: 'Excuse me, could you please help me pass the water? Thank you!' },
        { title: '例2', question: '朋友邀请你去参加一个聚会，你想确认时间和地点，用英语怎么说？',
          steps: ['先感谢邀请：Thanks for the invitation!', '询问时间：What time does the party start?', '询问地点：And where will it be held?'],
          answer: 'Thanks for the invitation! What time does the party start and where will it be held?' },
      ],
      '日常会话是英语口语交际的基础。中高考英语考试中情景对话题占听力部分约20%，熟练掌握各场景表达是关键。',
      ['1. 按场景分类积累句型（问候/购物/餐饮/问路/电话）', '2. 注意正式与非正式用语的语气差异', '3. 多模仿地道的语调和节奏，而不仅仅是背诵句子'],
      [
        { mistake: '用太正式的表达在日常场合', correct: '朋友之间说 "How do you do?" 太正式，用 "Hey! How\'s it going?" 更自然' },
        { mistake: '问路时不先说 Excuse me', correct: '英语文化中问路、请求帮助前一定要先说 Excuse me 引起注意，这是基本礼貌' },
      ],
      '日常会话就像是"英文版的吃饭睡觉"——不需要什么华丽的辞藻，自然流畅就好。关键是要让对英语文化中的礼貌习惯和常见套路。'
    )
  );

  // ===================================================================
  // ENG-07-003 口语发音基础
  // ===================================================================
  await sn('ENG-07-003', '口语发音基础', '元音辅音、重音与节奏、连读与失去爆破、语调升降、容易读错的单词', 'eng', '听力与口语', '初中', 3, 120, null,
    '掌握英语标准发音的核心要素，纠正常见发音错误，提升口语清晰度和地道性',
    richContent(
      '英语发音（Pronunciation）是口语能力的基石。良好的发音不仅让你的英语听起来更地道，也是听力理解的基础——你发不准的音往往也听不准。发音包括音素（元音辅音）、重音与节奏（Stress & Rhythm）、连读与失去爆破（Linking & Loss of Plosion）、语调（Intonation）四大板块。',
      [
        '元音：英语有20个元音（12个单元音+8个双元音），其中 /i:/ /ɪ/ /e/ /æ/ 这四个前元音是最容易混淆的',
        '辅音：注意清辅音与浊辅音的对立（p/b, t/d, k/g, f/v, s/z, θ/ð），中国学生尤其要注意 th 音 /θ/ /ð/',
        '单词重音：英语单词有固定的重音位置（如 record /ˈrekɔːd/ 名词 vs /rɪˈkɔːd/ 动词），重音错误会影响理解',
        '句子重音与节奏：实词（名词、动词、形容词）重读，虚词（介词、连词、代词）轻读，形成"重-轻-重-轻"的节奏',
        '连读：辅音结尾+元音开头的词要连读（come on → co-mon, not at all → no-ta-tall）',
        '失去爆破：爆破音 /p/ /b/ /t/ /d/ /k/ /g/ 后面紧跟辅音时只做口型不发音（good night, take care）',
        '语调升降：陈述句用降调（↘），一般疑问句用升调（↗），选择疑问句先升后降，反义疑问句心中有数时用降调、不确定时用升调',
        '容易读错的词：Clothes（/kləʊðz/ 不是 /kləʊz/）、Vegetable（/ˈvedʒtəbl/ 不是 /ˈvedʒɪteɪbl/）、Pronunciation（/prəˌnʌnsiˈeɪʃn/ 不是 /prəˌnaʊnsiˈeɪʃn/）',
      ],
      ['The cat sat on the mat. (/æ/ 音的练习)', 'I\'d like a cup of coffee, please. (注意连读和节奏)', 'A: Is it ready? B: Yes, it is. (升调疑问 + 降调肯定)'],
      [
        { title: '例1', question: '以下三个单词的发音有什么不同？Ship / Sheep / Cheap',
          steps: ['Ship /ʃɪp/ — 短元音 /ɪ/，嘴唇放松牙关稍开', 'Sheep /ʃiːp/ — 长元音 /iː/，嘴角向两边拉开', 'Cheap /tʃiːp/ — 开头送气音 /tʃ/ 不同于重音 /ʃ/，声带不振动', '关键区分：/ɪ/ 和 /iː/ 的长度和口型差异'],
          answer: 'Ship（短促）/ Sheep（拉长嘴角）/ Cheap（送气音开头）— 三个词涉及元音长度和辅音发音部位的双重区别' },
        { title: '例2', question: '朗读以下句子，标注连读和失去爆破位置：I want to stop. Let me go to the next bus stop.',
          steps: ['want to /ˈwɒnə/ → want 的 /t/ 与 to 的 /t/ 同化为一个音', 'stop → 下一词 Let 是 /l/ 开头，stop 的 /p/ 失去爆破（只做口型不发音）', 'next bus stop → next 的 /t/ 和 bus 的 /b/ 之间 /t/ 失去爆破；bus 的 /s/ 和 stop 的 /s/ 正常连接'],
          answer: 'I wa(t) /nə/ stop. Le(t) /miː/ go to(t) /θə/ nex(t) /bʌs/ stop. （括号内失去爆破或同化）' },
      ],
      '发音是"说出来"的英语最直接的评判标准。高考英语听力的语速和连读现象越来越接近真实英语，发音训练对提分有直接帮助。',
      ['1. 先纠正元音，再练辅音——元音错误率最高且影响可懂度', '2. 跟读模仿是发音进步最快的方法（影子跟读Shadowing）', '3. 注意自己的母语口音特点（如南方同学注意前后鼻音对英语的影响）'],
      [
        { mistake: '用中文近似音代替英语音素', correct: '英语中 /θ/ 和 /ð/ 在中文里没有对应发音，不要读成 /s/ /z/ 或 /f/ /v/，舌尖要轻放上下齿之间' },
        { mistake: '没有重音概念，所有音节平均用力', correct: '英语是多音节的"节奏型"语言，有重读音节读得更高更长更清晰，非重读音节弱化读。对比三音节词"photograph" /ˈfəʊ.tə.ɡrɑːf/ 重音在第一个音节' },
      ],
      '发音就像是说话的"门面"——好发音不一定让你说得更好，但让你听起来更像那么回事。而反过来，你能发准的音，通常也能听准。'
    )
  );

  // ===================================================================
  // ENG-07-004 情景交际与功能表达
  // ===================================================================
  await sn('ENG-07-004', '情景交际与功能表达', '建议与邀请、赞同与反对、感谢与道歉、采访与讨论', 'eng', '听力与口语', '高中', 4, 130, null,
    '掌握功能性交际表达的句型和策略，在真实场景中得体地进行英语交流',
    richContent(
      '功能表达（Functional Language）是英语交际的"万能工具箱"。不同于单纯的场景对话，功能表达侧重于"你想达到什么交际目的"——是从建议到邀请、从赞同到反对、从感谢到道歉。掌握功能表达意味着你能在不同场景下灵活切换，知道什么时候说什么话。',
      [
        '建议与推荐：给出建议（You\'d better / Why not / How about / I suggest that...）、委婉建议（If I were you, I would... / Have you considered...）',
        '邀请与回应：发出邀请（Would you like to...? / I\'d like to invite you to...）、接受邀请（Sounds great! / I\'d love to! / That\'s very kind of you）、婉拒（I\'d love to, but... / I\'m afraid I can\'t because...）',
        '赞同与反对：完全赞同（I couldn\'t agree more. / Exactly / Absolutely）、部分赞同（I agree with you up to a point, but...）、委婉反对（I see your point, however... / With all due respect, I think...）',
        '感谢与回应：正式感谢（I\'m extremely grateful for your help. / I truly appreciate...）、日常感谢（Thanks a lot / Much appreciated）、回应（You\'re welcome / My pleasure / Don\'t mention it / Anytime）',
        '道歉与原谅：正式道歉（I sincerely apologize for my mistake. / Please accept my sincere apology.）、日常道歉（Sorry about that. / My bad.）、原谅（That\'s all right. / No worries. / Don\'t worry about it.）',
        '采访与讨论：提问（Could you share your views on...? / What\'s your take on...?）、回应观点（From my perspective, ... / As far as I\'m concerned, ...）、打断与插话（Sorry to interrupt, but... / If I may add...）、拉回话题（Getting back to the point... / Anyway, as I was saying...）',
      ],
      ['Why don\'t we start with a warm-up activity? (建议)', 'I couldn\'t agree more that practice makes perfect. (赞同)', 'I must apologize for being late. The traffic was terrible. (道歉)'],
      [
        { title: '例1', question: '你的好朋友在犹豫是否参加英语演讲比赛，你想鼓励他/她参加。用英语说出你的建议。',
          steps: ['表达支持：I think you should go for it!', '给出理由：The experience itself will be valuable, win or lose.', '提供鼓励：And I believe you have the ability to do a great job!'],
          answer: 'I really think you should enter the competition! Even if you don\'t win, the experience will be amazing. And I believe you have what it takes to do a wonderful job!' },
        { title: '例2', question: '在一场英语讨论中，有人发表了一个你不同意的观点。如何有礼貌地表达反对？',
          steps: ['先给予肯定（让对方感到被尊重）：That\'s an interesting perspective.', '用but转折：However, I see it a bit differently.', '表明自己观点：In my opinion, the real issue is not about...', '给予论据：For example, studies have shown that...'],
          answer: 'That\'s an interesting perspective. However, I see it a bit differently. In my opinion, the key factor is actually the environment rather than individual effort. Let me explain why...' },
      ],
      '功能表达是英语交际能力的"进阶版"。高考英语写作和口语考试中，灵活的句型变换是取得高分的核心要素。',
      ['1. 每个功能准备3种不同的表达方式（正式/中性/非正式），根据对象选择', '2. 学会"先肯定后转折"的策略，尤其用于反对或拒绝时', '3. 注意文化差异——英语中道歉和感谢的频率比中文高得多'],
      [
        { mistake: '表达反对时过于直接', correct: '"You are wrong." 改为 "I respect your opinion, but I have a different viewpoint on this matter." 英语文化中直截了当的反对会显得粗鲁' },
        { mistake: '感谢或道歉时表达不足', correct: '英语文化中简单说 Thank you 或 Sorry 有时不够，加一句具体说明会更好："I\'m sorry for keeping you waiting so long — I got stuck in traffic."' },
      ],
      '功能表达就像是你交际的"工具箱"——建议是一把螺丝刀，赞同是一把扳手，道歉是一把锤子。用对工具，事半功倍。'
    )
  );

  // ===================================================================
  // ENG-07-005 英语演讲与陈述
  // ===================================================================
  await sn('ENG-07-005', '英语演讲与陈述', '结构组织、开场白与结束语、过渡词、视觉辅助、克服紧张', 'eng', '听力与口语', '高中', 5, 140, null,
    '掌握英语演讲与陈述的完整流程和高分技巧，能够自信地进行英语公开表达',
    richContent(
      '英语演讲（Public Speaking in English）是英语综合能力的最高体现。它不仅需要扎实的语言基础，更需要清晰的逻辑组织、自信的表达姿态和与听众的有效互动。一个好的演讲遵循"Tell them what you are going to tell them, tell them, then tell them what you told them"的经典三明治结构。',
      [
        '演讲结构三要素：开场白（Introduction 5-10%）→ 主体内容（Body 75-85%）→ 结束语（Conclusion 5-10%）',
        '开场白技巧：Hook吸引注意（反问句/惊人事实/故事/引语）+ 自我介绍 + 演讲目的和结构预告',
        '结束语技巧：总结核心观点（Today we discussed...）+ 升华/呼吁行动（So let\'s...）+ 感谢（Thank you for your attention.）+ 邀请提问',
        '过渡词与过渡句：内部连接（Now let\'s move on to... / Having looked at X, let\'s turn to Y）、转折对比（On the contrary / In contrast / However）、因果推理（As a result / This leads to / Consequently）',
        '视觉辅助技巧：每页PPT一张图片或一个核心观点 + 标题突出 + 关键词而非完整句子 + 图表清晰标注 + 演讲者不与屏幕抢焦点',
        '肢体语言：眼神交流（轮流注视各个方向的听众）、手势（自然配合语意，避免紧张的小动作）、站姿（自信挺拔、双脚与肩同宽）',
        '声音控制：语速变化（重要信息放慢升高音调）、暂停（在关键观点前后停顿获得关注）、音量（确保最后一排都能听到）',
        '克服紧张的方法：充分准备和多次排练（对着镜子/录音/摄像头练习）、深呼吸（4-7-8呼吸法）、把注意力从自己转向听众和内容、接受适度的紧张是正常的',
      ],
      ['Good morning everyone. Today I\'d like to share with you a topic that I believe affects every single person in this room — the power of habits.', 'In conclusion, we\'ve explored three key strategies for effective time management. Remember — it\'s not about having more time, it\'s about using it wisely. Thank you!'],
      [
        { title: '例1', question: '设计一个关于"Protecting the Environment"的英语演讲开场白，使用提问式Hook。',
          steps: ['Hook：用反问句引起思考——"Have you ever wondered what kind of Earth we will leave for our children?"', '引出话题：Today, I\'d like to talk about a pressing issue — environmental protection.', '简述结构：I will discuss three main aspects: the current situation, its causes, and what we can do about it.'],
          answer: '"Good morning, everyone. Have you ever looked at a pile of garbage and wondered what kind of Earth we will leave for our children? Today, I\'d like to talk about environmental protection — what we are doing wrong and how we can fix it. I\'ll cover three main points: the current situation, the root causes, and practical solutions."' },
        { title: '例2', question: '如何在演讲中自然过渡到下一个话题？请从「我们已经讨论完原因，现在要讨论解决方案」这个场景给出过渡句。',
          steps: ['回顾已讲内容：Now that we have explored the main causes of air pollution...', '引出下一个主题：let\'s turn our attention to the solutions.', '可选：加一句承上启下——因果关系——Understanding the causes helps us find better solutions.'],
          answer: '"Now that we\'ve explored the main causes of air pollution, let\'s turn our attention to the solutions. After all, understanding the problem is only half the battle — taking action is what truly matters."' },
      ],
      '英语演讲能力是未来学习和工作中非常重要的一项技能。大学课堂展示（Presentation）、学术会议发言、求职面试都需要演讲能力。高考英语口试改革也越来越多地融入演讲类任务。',
      ['1. 公式化开场和结尾——用固定模板降低临场压力', '2. 每个观点不超过三个分点（"Rule of Three"）——大脑最容易记住三件事', '3. 练习时录音录像，反复回看改进——你不需要一次性完美'],
      [
        { mistake: 'PPT上堆满文字，演讲时照念', correct: 'PPT上只放关键词和图表，演讲者说完整的句子。PPT是辅助，不是提词器' },
        { mistake: '全程看一个方向或看地板，缺乏眼神交流', correct: '轮流注视不同方向的听众，每3-5秒切换一次。如果不习惯看眼睛，可以看额头或鼻梁' },
      ],
      '英语演讲不需要你是英语母语者才能出色。最打动听众的永远是你的内容、真诚和热情，而不是完美的发音。很多最受欢迎的TED演讲者的英语也是二语学习者。你的英语足够好——现在只需要练习表达的内容。'
    )
  );

  // ===================================================================
  // 建立知识点之间的关系
  // ===================================================================
  console.log('  → 建立关系...');
  await sr('ENG-07-001', 'ENG-07-002', 'prerequisite', 100);
  await sr('ENG-07-002', 'ENG-07-003', 'prerequisite', 100);
  await sr('ENG-07-003', 'ENG-07-004', 'prerequisite', 100);
  await sr('ENG-07-004', 'ENG-07-005', 'prerequisite', 100);
  await sr('ENG-07-001', 'ENG-01-004', 'supports', 100);
  await sr('ENG-07-002', 'ENG-01-005', 'supports', 100);
  await sr('ENG-07-005', 'ENG-01-005', 'supports', 100);

  console.log('  ✓ 听力与口语种子完成');
}
