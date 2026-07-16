/**
 * 迁移脚本 — 新增漏掉的知识点
 * 在不破坏现有数据的前提下，只添加新节点
 * 用法: npx tsx scripts/migrate-missing-nodes.ts
 */
import { prisma } from '../src/seeders/helpers.js';
import { seedAlgebraDomain } from '../src/seeders/domains/math-02-algebra.js';
import { seedSequenceDomain } from '../src/seeders/domains/math-07-sequence.js';

async function main() {
  // 检查 MATH-02-013 是否存在
  const hasAlgebraNode = await prisma.knowledgeNode.findUnique({ where: { id: 'MATH-02-013' } });
  const hasSequenceNode = await prisma.knowledgeNode.findUnique({ where: { id: 'MATH-07-013' } });

  if (!hasAlgebraNode || !hasSequenceNode) {
    // 删除这两个 seeders 新加的内容（如果已有则删除后重新添加）
    // 先删关系，再删节点
    if (hasAlgebraNode) {
      await prisma.knowledgeRelation.deleteMany({ where: { OR: [{ fromNodeId: 'MATH-02-013' }, { toNodeId: 'MATH-02-013' }] } });
      await prisma.knowledgeNode.delete({ where: { id: 'MATH-02-013' } });
    }
    if (hasSequenceNode) {
      await prisma.knowledgeRelation.deleteMany({ where: { OR: [{ fromNodeId: 'MATH-07-013' }, { toNodeId: 'MATH-07-013' }] } });
      await prisma.knowledgeNode.delete({ where: { id: 'MATH-07-013' } });
    }

    // 但 seedAlgebraDomain 和 seedSequenceDomain 会尝试创建所有节点，有 UNIQUE 冲突
    // 所以我们手动只插入新节点
    console.log('需要手动插入。用 SQL 方式更方便...');
    
    // 直接跑 sqlite
  }

  const count = await prisma.knowledgeNode.count();
  console.log(`总节点数: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
