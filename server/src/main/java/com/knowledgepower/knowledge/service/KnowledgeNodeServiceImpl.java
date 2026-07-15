package com.knowledgepower.knowledge.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.knowledgepower.knowledge.entity.KnowledgeNode;
import com.knowledgepower.knowledge.mapper.KnowledgeNodeMapper;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeNodeServiceImpl extends ServiceImpl<KnowledgeNodeMapper, KnowledgeNode>
        implements KnowledgeNodeService {
}
