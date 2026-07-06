package com.expenses.transfer.internal;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransferMapper {

    @Mapping(target = "fromWalletId", source = "fromWallet.id")
    @Mapping(target = "fromWalletName", source = "fromWallet.name")
    @Mapping(target = "toWalletId", source = "toWallet.id")
    @Mapping(target = "toWalletName", source = "toWallet.name")
    @Mapping(target = "createdAt",
             expression = "java(transfer.getCreatedAt().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME))")
    TransferResponse toResponse(Transfer transfer);
}
