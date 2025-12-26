package com.enterprise.product.mapper;

import com.enterprise.product.dto.ProductDto;
import com.enterprise.product.entity.Product;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-26T10:11:43+0900",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductDto toDto(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductDto.ProductDtoBuilder productDto = ProductDto.builder();

        productDto.active( product.getActive() );
        productDto.category( product.getCategory() );
        productDto.createdAt( product.getCreatedAt() );
        productDto.description( product.getDescription() );
        productDto.id( product.getId() );
        productDto.imageUrl( product.getImageUrl() );
        productDto.name( product.getName() );
        productDto.price( product.getPrice() );
        productDto.stock( product.getStock() );
        productDto.updatedAt( product.getUpdatedAt() );

        return productDto.build();
    }

    @Override
    public Product toEntity(ProductDto productDto) {
        if ( productDto == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.active( productDto.getActive() );
        product.category( productDto.getCategory() );
        product.createdAt( productDto.getCreatedAt() );
        product.description( productDto.getDescription() );
        product.id( productDto.getId() );
        product.imageUrl( productDto.getImageUrl() );
        product.name( productDto.getName() );
        product.price( productDto.getPrice() );
        product.stock( productDto.getStock() );
        product.updatedAt( productDto.getUpdatedAt() );

        return product.build();
    }

    @Override
    public void updateEntityFromDto(ProductDto dto, Product entity) {
        if ( dto == null ) {
            return;
        }

        entity.setActive( dto.getActive() );
        entity.setCategory( dto.getCategory() );
        entity.setCreatedAt( dto.getCreatedAt() );
        entity.setDescription( dto.getDescription() );
        entity.setId( dto.getId() );
        entity.setImageUrl( dto.getImageUrl() );
        entity.setName( dto.getName() );
        entity.setPrice( dto.getPrice() );
        entity.setStock( dto.getStock() );
        entity.setUpdatedAt( dto.getUpdatedAt() );
    }
}
