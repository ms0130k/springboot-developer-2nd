package com.shock.springbootdeveloper.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UpdateArticleRequest {
    private String title;
    private String content;
}
