package com.expenses.shared.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PageResponseTest {

    @Test
    void from_mapsAllPageFields() {
        PageImpl<String> page = new PageImpl<>(List.of("a", "b"), PageRequest.of(1, 2), 5);

        PageResponse<String> response = PageResponse.from(page);

        assertThat(response.content()).containsExactly("a", "b");
        assertThat(response.totalElements()).isEqualTo(5);
        assertThat(response.totalPages()).isEqualTo(3);
        assertThat(response.number()).isEqualTo(1);
        assertThat(response.size()).isEqualTo(2);
        assertThat(response.first()).isFalse();
        assertThat(response.last()).isFalse();
    }

    @Test
    void serializesWithStableKeyOrder() throws Exception {
        PageResponse<String> response = PageResponse.from(
                new PageImpl<>(List.of("x"), PageRequest.of(0, 10), 1));

        String json = new ObjectMapper().writeValueAsString(response);

        assertThat(json).isEqualTo(
                "{\"content\":[\"x\"],\"totalElements\":1,\"totalPages\":1," +
                "\"number\":0,\"size\":10,\"first\":true,\"last\":true}");
    }
}
