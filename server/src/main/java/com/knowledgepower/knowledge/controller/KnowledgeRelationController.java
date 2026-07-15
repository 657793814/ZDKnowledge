package com.knowledgepower.knowledge.controller;

import com.knowledgepower.common.result.R;
import com.knowledgepower.knowledge.entity.KnowledgeRelation;
import com.knowledgepower.knowledge.service.KnowledgeRelationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "知识点关系管理")
@RestController
@RequestMapping("/knowledge/relations")
@RequiredArgsConstructor
public class KnowledgeRelationController {

    private final KnowledgeRelationService relationService;

    @Operation(summary = "新增知识点关系")
    @PostMapping
    public R<Void> create(@RequestBody KnowledgeRelation relation) {
        relationService.save(relation);
        return R.ok();
    }

    @Operation(summary = "删除知识点关系")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        relationService.removeById(id);
        return R.ok();
    }
}
