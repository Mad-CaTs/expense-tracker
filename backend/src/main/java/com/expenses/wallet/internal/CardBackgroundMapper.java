package com.expenses.wallet.internal;

import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CardBackgroundMapper {

    CardBackgroundDTO toDTO(CardBackground cardBackground);

    List<CardBackgroundDTO> toDTOs(List<CardBackground> cardBackgrounds);
}
