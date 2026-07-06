package com.expenses.wallet.internal;

import com.expenses.wallet.Wallet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface WalletMapper {

    @Mapping(target = "balance", source = "balance")
    @Mapping(target = "backgroundId", source = "wallet.background.id")
    @Mapping(target = "backgroundUrl", source = "wallet.background.imageUrl")
    WalletResponse toResponse(Wallet wallet, BigDecimal balance);
}
