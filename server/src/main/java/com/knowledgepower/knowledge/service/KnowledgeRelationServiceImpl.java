package com.knowledgepower.knowledge.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.knowledgepower.knowledge.entity.KnowledgeRelation;
import com.knowledgepower.knowledge.mapper.KnowledgeRelationMapper;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeRelationServiceImpl extends ServiceImpl<KnowledgeRelationMapper, KnowledgeRelation>
        implements KnowledgeRelationService {
}
