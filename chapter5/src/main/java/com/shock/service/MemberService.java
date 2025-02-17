package com.shock.service;

import com.shock.domain.Member;
import com.shock.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class MemberService {
    private final MemberRepository memberRepository;

    public Iterable<Member> getMembers() {
        return memberRepository.findAll();
    }

    public Member getMember(String name) {
        return memberRepository.findByName(name).orElse(null);
    }
}
