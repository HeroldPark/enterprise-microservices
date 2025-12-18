package com.enterprise.order.mapper;

import com.enterprise.order.dto.OrderDto;
import com.enterprise.order.dto.OrderItemDto;
import com.enterprise.order.entity.Order;
import com.enterprise.order.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OrderMapper {
    OrderDto toDto(Order order);
    Order toEntity(OrderDto orderDto);
    OrderItemDto toDto(OrderItem orderItem);
    OrderItem toEntity(OrderItemDto orderItemDto);
}
