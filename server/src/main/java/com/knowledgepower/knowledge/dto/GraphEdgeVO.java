package com.knowledgepower.knowledge.dto;

import lombok.Data;

@Data
public class GraphEdgeVO {
    private String source;
    private String target;
    private String type;
    private String description;
}
