package com.knowledgepower.ai.controller;

import com.knowledgepower.ai.dto.*;
import com.knowledgepower.ai.service.AiService;
import com.knowledgepower.common.result.R;
import com.knowledgepower.exam.dto.AutoGenerateReq;
import com.knowledgepower.exam.dto.ExamPaperVO;
import com.knowledgepower.exam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final ExamService examService;

    /** 知识点问答 */
    @PostMapping("/ask")
    public R<AiAskResp> ask(@RequestBody AiAskReq req) {
        return R.ok(aiService.ask(req));
    }

    /** 错题解析 */
    @PostMapping("/explain")
    public R<AiAskResp> explain(@RequestBody AiExplainReq req) {
        return R.ok(aiService.explainMistake(req));
    }

    /** 学习推荐 */
    @PostMapping("/recommend")
    public R<AiAskResp> recommend(@RequestBody AiRecommendReq req) {
        return R.ok(aiService.recommend(req));
    }

    /** AI 智能组卷 — 先分析薄弱领域，再生成针对性试卷 */
    @PostMapping("/generate-paper")
    public R<ExamPaperVO> generatePaper(@RequestBody AiGeneratePaperReq req) {
        // 1. 用 AI 分析薄弱领域
        AiPaperSuggestion suggestion = aiService.generatePaper(req);

        // 2. 选出最薄弱的领域
        String focusDomain = suggestion.getFocusDomain();
        if (focusDomain == null || focusDomain.isBlank()) {
            // 降级：取第一个分配
            if (suggestion.getAllocations() != null && !suggestion.getAllocations().isEmpty()) {
                focusDomain = suggestion.getAllocations().get(0).getDomain();
            }
        }

        // 3. 用 ExamService 生成该领域的试卷
        AutoGenerateReq genReq = new AutoGenerateReq();
        genReq.setDomain(focusDomain);
        genReq.setCount(req.getCount());
        genReq.setMode("practice");

        ExamPaperVO paper = examService.autoGenerate(genReq);
        return R.ok(paper);
    }
}
