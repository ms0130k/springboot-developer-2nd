package com.shock.controller;

import com.shock.domain.Member;
import com.shock.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RequiredArgsConstructor
@RestController
public class MemberController {
    private final MemberService memberService;

    @GetMapping("/members")
    public Iterable<Member> getMembers() {
        return memberService.getMembers();
    }

    @GetMapping("/member/{name}")
    public Member getMember(@PathVariable String name) {
        return memberService.getMember(name);
    }
}
