package com.enterprise.user.mapper;

import com.enterprise.user.dto.UserDto;
import com.enterprise.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(UserDto userDto);
}
