package com.shock.springbootdeveloper.controller;

import com.shock.springbootdeveloper.domain.Article;
import com.shock.springbootdeveloper.dto.AddArticleRequest;
import com.shock.springbootdeveloper.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.HttpStatus.CREATED;

@RequiredArgsConstructor
@RestController
public class BlogApiController {
    private final BlogService blogService;

    @PostMapping("/api/articles")
    public ResponseEntity<Article> addArticle(@RequestBody AddArticleRequest request) {
        Article saved = blogService.save(request);
        return ResponseEntity.status(CREATED).body(saved);
    }
}
