package com.knowledgepower.knowledge.service;

import com.knowledgepower.knowledge.dto.GraphEdgeVO;
import com.knowledgepower.knowledge.dto.GraphNodeVO;
import com.knowledgepower.knowledge.dto.KnowledgeGraphVO;
import com.knowledgepower.knowledge.entity.KnowledgeNode;
import com.knowledgepower.knowledge.entity.KnowledgeRelation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KnowledgeGraphService {

    private final KnowledgeNodeService nodeService;
    private final KnowledgeRelationService relationService;

    public KnowledgeGraphVO getFullGraph() {
        List<KnowledgeNode> nodes = nodeService.lambdaQuery()
                .eq(KnowledgeNode::getStatus, 1)
                .orderByAsc(KnowledgeNode::getSortOrder)
                .list();

        List<KnowledgeRelation> relations = relationService.lambdaQuery().list();

        List<GraphNodeVO> nodeVOs = nodes.stream()
                .map(n -> {
                    GraphNodeVO vo = new GraphNodeVO();
                    vo.setId(n.getId());
                    vo.setLabel(n.getTitle());
                    vo.setDomain(n.getDomain());
                    vo.setLevel(n.getLevel());
                    vo.setDifficulty(n.getDifficulty());
                    vo.setIsMilestone(n.getMilestoneType() != null);
                    return vo;
                })
                .toList();

        List<GraphEdgeVO> edgeVOs = relations.stream()
                .map(r -> {
                    GraphEdgeVO vo = new GraphEdgeVO();
                    vo.setSource(r.getFromNodeId());
                    vo.setTarget(r.getToNodeId());
                    vo.setType(r.getRelationType());
                    vo.setDescription(r.getDescription());
                    return vo;
                })
                .toList();

        return new KnowledgeGraphVO(nodeVOs, edgeVOs);
    }

    public KnowledgeGraphVO getGraphByDomain(String domain) {
        List<KnowledgeNode> nodes = nodeService.lambdaQuery()
                .eq(KnowledgeNode::getStatus, 1)
                .eq(KnowledgeNode::getDomain, domain)
                .orderByAsc(KnowledgeNode::getSortOrder)
                .list();

        List<String> nodeIds = nodes.stream().map(KnowledgeNode::getId).toList();

        List<KnowledgeRelation> relations = relationService.lambdaQuery()
                .in(KnowledgeRelation::getFromNodeId, nodeIds)
                .or()
                .in(KnowledgeRelation::getToNodeId, nodeIds)
                .list();

        List<GraphNodeVO> nodeVOs = nodes.stream()
                .map(n -> {
                    GraphNodeVO vo = new GraphNodeVO();
                    vo.setId(n.getId());
                    vo.setLabel(n.getTitle());
                    vo.setDomain(n.getDomain());
                    vo.setLevel(n.getLevel());
                    vo.setDifficulty(n.getDifficulty());
                    vo.setIsMilestone(n.getMilestoneType() != null);
                    return vo;
                })
                .toList();

        List<GraphEdgeVO> edgeVOs = relations.stream()
                .map(r -> {
                    GraphEdgeVO vo = new GraphEdgeVO();
                    vo.setSource(r.getFromNodeId());
                    vo.setTarget(r.getToNodeId());
                    vo.setType(r.getRelationType());
                    vo.setDescription(r.getDescription());
                    return vo;
                })
                .toList();

        return new KnowledgeGraphVO(nodeVOs, edgeVOs);
    }
}
