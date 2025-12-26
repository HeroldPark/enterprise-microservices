package com.enterprise.order.mapper;

import com.enterprise.order.dto.OrderDto;
import com.enterprise.order.dto.OrderItemDto;
import com.enterprise.order.entity.Order;
import com.enterprise.order.entity.OrderItem;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-26T10:11:41+0900",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderDto toDto(Order order) {
        if ( order == null ) {
            return null;
        }

        OrderDto.OrderDtoBuilder orderDto = OrderDto.builder();

        orderDto.createdAt( order.getCreatedAt() );
        orderDto.id( order.getId() );
        orderDto.items( orderItemListToOrderItemDtoList( order.getItems() ) );
        orderDto.shippingAddress( order.getShippingAddress() );
        orderDto.status( order.getStatus() );
        orderDto.totalAmount( order.getTotalAmount() );
        orderDto.updatedAt( order.getUpdatedAt() );
        orderDto.userId( order.getUserId() );
        orderDto.username( order.getUsername() );

        return orderDto.build();
    }

    @Override
    public Order toEntity(OrderDto orderDto) {
        if ( orderDto == null ) {
            return null;
        }

        Order.OrderBuilder order = Order.builder();

        order.createdAt( orderDto.getCreatedAt() );
        order.id( orderDto.getId() );
        order.items( orderItemDtoListToOrderItemList( orderDto.getItems() ) );
        order.shippingAddress( orderDto.getShippingAddress() );
        order.status( orderDto.getStatus() );
        order.totalAmount( orderDto.getTotalAmount() );
        order.updatedAt( orderDto.getUpdatedAt() );
        order.userId( orderDto.getUserId() );
        order.username( orderDto.getUsername() );

        return order.build();
    }

    @Override
    public OrderItemDto toDto(OrderItem orderItem) {
        if ( orderItem == null ) {
            return null;
        }

        OrderItemDto.OrderItemDtoBuilder orderItemDto = OrderItemDto.builder();

        orderItemDto.id( orderItem.getId() );
        orderItemDto.price( orderItem.getPrice() );
        orderItemDto.productId( orderItem.getProductId() );
        orderItemDto.productName( orderItem.getProductName() );
        orderItemDto.quantity( orderItem.getQuantity() );
        orderItemDto.subtotal( orderItem.getSubtotal() );

        return orderItemDto.build();
    }

    @Override
    public OrderItem toEntity(OrderItemDto orderItemDto) {
        if ( orderItemDto == null ) {
            return null;
        }

        OrderItem.OrderItemBuilder orderItem = OrderItem.builder();

        orderItem.id( orderItemDto.getId() );
        orderItem.price( orderItemDto.getPrice() );
        orderItem.productId( orderItemDto.getProductId() );
        orderItem.productName( orderItemDto.getProductName() );
        orderItem.quantity( orderItemDto.getQuantity() );
        orderItem.subtotal( orderItemDto.getSubtotal() );

        return orderItem.build();
    }

    protected List<OrderItemDto> orderItemListToOrderItemDtoList(List<OrderItem> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderItemDto> list1 = new ArrayList<OrderItemDto>( list.size() );
        for ( OrderItem orderItem : list ) {
            list1.add( toDto( orderItem ) );
        }

        return list1;
    }

    protected List<OrderItem> orderItemDtoListToOrderItemList(List<OrderItemDto> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderItem> list1 = new ArrayList<OrderItem>( list.size() );
        for ( OrderItemDto orderItemDto : list ) {
            list1.add( toEntity( orderItemDto ) );
        }

        return list1;
    }
}
