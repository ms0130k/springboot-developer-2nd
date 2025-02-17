package com.shock.repository;

import com.shock.domain.Member;
import com.shock.service.MemberService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class MemberRepositoryTest {
    @Autowired
    MemberRepository memberRepository;

    @AfterEach
    void tearDown() {
        memberRepository.deleteAll();
    }

    @Sql("/insert-members.sql")
    @Test
    void getMembers() {
        // when
        List<Member> members = memberRepository.findAll();

        // then
        assertThat(members.size()).isEqualTo(3);
    }

    @Sql("/insert-members.sql")
    @Test
    void getMember() {
        // when
        Member member = memberRepository.findByName("Carol").orElse(null);

        // then
        assertThat(member.getName()).isEqualTo("Carol");
    }

    @Sql("/insert-members.sql")
    @Test
    void deleteMember() {
        // given
        Member member = memberRepository.findByName("Carol").orElse(null);

        // when
//        memberRepository.delete(member);
        memberRepository.deleteById(member.getId());

        // then
        List<Member> members = memberRepository.findAll();
        assertThat(members.size()).isEqualTo(2);
    }

    @Sql("/insert-members.sql")
    @Test
    void updateMember() {
        // given
        Member member = memberRepository.findByName("Carol").orElse(null);
        Long id = member.getId();

        // when
        member.changeName("Carol2");

        // then
        Member updatedMember = memberRepository.findById(id).orElse(null);
        assertThat(updatedMember.getName()).isEqualTo("Carol2");
    }
}