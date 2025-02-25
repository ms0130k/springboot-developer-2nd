package com.shock.springbootdeveloper.service;

import com.shock.springbootdeveloper.domain.Article;
import com.shock.springbootdeveloper.dto.AddArticleRequest;
import com.shock.springbootdeveloper.repository.BlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class BlogService {
    private final BlogRepository blogRepository;

    public Article save(AddArticleRequest request) {
        return blogRepository.save(request.toEntity());
    }
}
