/**
 * AI 自动出题器 — 从知识点 contentJson 中提取关键信息，调用 AI 生成题目
 * 
 * 用法: npx tsx scripts/generate-questions.ts
 * 默认生成后保存，需人工审核发布
 */

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// 读取 AI 配置
const AI_CONFIG_PATH = join(__dirname, '../../config/ai-config.json');
let aiConfig: any = {};
if (existsSync(AI_CONFIG_PATH)) {
  try {
    aiConfig = JSON.parse(readFileSync(AI_CONFIG_PATH, 'utf-8'));
  } catch {}
}

const AI_BASE_URL = aiConfig.baseUrl || 'https://apihub.agnes-ai.com/v1';
const AI_API_KEY = aiConfig.apiKey || '';
const AI_MODEL = aiConfig.model || 'agnes-2.0-flash';
const OLLAMA_URL = aiConfig.ollamaBaseUrl || 'http://localhost:11434';

async function callAI(prompt: string): Promise<string> {
  // 先尝试 Ollama
  try {
    const resp = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'qwen2.5:3b',
      prompt,
      stream: false,
      options: { temperature: 0.7, max_tokens: 4096 },
    }, { timeout: 60000 });
    return resp.data.response || '';
  } catch {}

  // 回退到 OpenAI 兼容 API
  if (AI_API_KEY) {
    try {
      const resp = await axios.post(`${AI_BASE_URL.replace(/\/+$/, '')}/chat/completions`, {
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.7,
      }, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
        timeout: 30000,
      });
      return resp.data?.choices?.[0]?.message?.content || '';
    } catch {}
  }
  throw new Error('AI 不可用，请先配置 API Key 或启动 Ollama');
}

// 题目生成 prompt 模板
function buildQuestionPrompt(node: any): string {
  const content = typeof node.contentJson === 'string' ? JSON.parse(node.contentJson) : node.contentJson;
  const sections = content?.sections || [];
  const defText = sections.find((s: any) => s.type === 'definition')?.content || node.summary || '';
  const keyPoints = sections.find((s: any) => s.type === 'keypoints')?.items || [];
  const examples = sections.find((s: any) => s.type === 'example')?.items || [];

  return `你是专业的 K-12 理科出题老师。请根据以下知识点信息，生成 3 道练习题。

知识点：${node.title}（${node.subject} · ${node.domain} · ${node.level}）
难度：${node.difficulty}/5
定义：${defText}
${keyPoints.length > 0 ? `要点：${keyPoints.slice(0, 3).join('；')}` : ''}

要求：
1. 生成 1 道选择题（choice）、1 道填空题（fill）、1 道判断题（judge）
2. 题目要贴合知识点内容，难度匹配
3. 选择题提供 4 个选项（A/B/C/D）
4. 所有题目提供答案和详细解析
5. 用 JSON 格式输出，不要包含其他文字

格式示例（严格按照这个 JSON 格式，不要加 markdown 代码块标记）：
[
  {
    "type": "choice",
    "difficulty": 2,
    "title": "题目内容，支持 LaTeX 公式 $\\sqrt{2}$",
    "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
    "answer": "A",
    "explanation": "详细解析"
  },
  {
    "type": "fill",
    "difficulty": 3,
    "title": "填空题目____",
    "answer": "正确答案",
    "explanation": "详细解析"
  },
  {
    "type": "judge",
    "difficulty": 1,
    "title": "判断对错：陈述内容",
    "answer": "正确",
    "explanation": "详细解析"
  }
]`;
}

interface GeneratedQuestion {
  type: string;
  difficulty: number;
  title: string;
  options?: string[];
  answer: string;
  explanation: string;
}

async function generateQuestionsForNode(node: any): Promise<GeneratedQuestion[]> {
  const prompt = buildQuestionPrompt(node);
  const response = await callAI(prompt);

  // 解析 JSON
  // 先尝试提取 JSON 部分（AI 可能加 markdown 标记）
  let jsonStr = response.trim();
  
  // 尝试匹配 markdown 代码块
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    const questions = JSON.parse(jsonStr);
    if (!Array.isArray(questions)) {
      throw new Error('不是数组');
    }
    return questions.filter((q: any) =>
      q.type && q.title && q.answer && q.explanation
    );
  } catch (e) {
    console.warn(`  ⚠️  JSON 解析失败: ${(e as Error).message}`);
    console.warn(`  原始响应: ${response.substring(0, 200)}...`);
    return [];
  }
}

async function main() {
  console.log('🤖 AI 自动出题器');
  console.log('='.repeat(50));

  // 获取所有知识点
  const nodes = await prisma.knowledgeNode.findMany({
    where: { status: 1, deleted: 0 },
    orderBy: [{ subject: 'asc' }, { domain: 'asc' }, { sortOrder: 'asc' }],
  });
  console.log(`📚 共 ${nodes.length} 个知识点\n`);

  // 获取已有题目的 nodeId 集合
  const existingQuestions = await prisma.examQuestion.findMany({
    select: { nodeId: true },
    distinct: ['nodeId'],
  });
  const existingNodeIds = new Set(existingQuestions.map(q => q.nodeId));

  let totalGenerated = 0;
  let totalCreated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const progress = `[${i + 1}/${nodes.length}]`;

    // 跳过已有题目的知识点（增量模式）
    if (existingNodeIds.has(node.id)) {
      skipped++;
      continue;
    }

    process.stdout.write(`${progress} ${node.title}... `);

    try {
      const questions = await generateQuestionsForNode(node);
      if (questions.length === 0) {
        console.log('❌ 生成空结果');
        errors++;
        continue;
      }

      let created = 0;
      for (const q of questions) {
        await prisma.examQuestion.create({
          data: {
            nodeId: node.id,
            subject: node.subject,
            domain: node.domain,
            level: node.level,
            questionType: q.type,
            difficulty: q.difficulty,
            title: q.title,
            options: q.options ? JSON.stringify(q.options) : null,
            answer: q.answer || '',
            explanation: q.explanation || '',
            status: 1,
          },
        });
        created++;
      }
      totalCreated += created;
      console.log(`✅ ${created} 题`);
    } catch (e) {
      console.log(`❌ ${(e as Error).message}`);
      errors++;
    }

    totalGenerated++;
  }

  const finalCount = await prisma.examQuestion.count();
  console.log(`\n✅ 完成！处理 ${totalGenerated} 个知识点，跳过 ${skipped} 个`);
  console.log(`生成的题目将处于 status=1（已发布），如想审核请改为 status=0`);
  console.log(`当前总题库: ${finalCount} 题，错误: ${errors}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
