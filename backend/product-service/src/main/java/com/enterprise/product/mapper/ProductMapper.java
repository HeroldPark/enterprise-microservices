package com.enterprise.product.mapper;

import com.enterprise.product.dto.ProductDto;
import com.enterprise.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProductMapper {
    ProductDto toDto(Product product);
    Product toEntity(ProductDto productDto);
    void updateEntityFromDto(ProductDto dto, @MappingTarget Product entity);
}
