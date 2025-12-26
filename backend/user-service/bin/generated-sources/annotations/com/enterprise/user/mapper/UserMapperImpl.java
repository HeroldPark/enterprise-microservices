package com.enterprise.user.mapper;

import com.enterprise.user.dto.UserDto;
import com.enterprise.user.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-26T10:11:44+0900",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto toDto(User user) {
        if ( user == null ) {
            return null;
        }

        UserDto.UserDtoBuilder userDto = UserDto.builder();

        userDto.createdAt( user.getCreatedAt() );
        userDto.email( user.getEmail() );
        userDto.enabled( user.getEnabled() );
        userDto.firstName( user.getFirstName() );
        userDto.id( user.getId() );
        userDto.lastName( user.getLastName() );
        userDto.phoneNumber( user.getPhoneNumber() );
        userDto.role( user.getRole() );
        userDto.updatedAt( user.getUpdatedAt() );
        userDto.username( user.getUsername() );

        return userDto.build();
    }

    @Override
    public User toEntity(UserDto userDto) {
        if ( userDto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.createdAt( userDto.getCreatedAt() );
        user.email( userDto.getEmail() );
        user.enabled( userDto.getEnabled() );
        user.firstName( userDto.getFirstName() );
        user.id( userDto.getId() );
        user.lastName( userDto.getLastName() );
        user.phoneNumber( userDto.getPhoneNumber() );
        user.role( userDto.getRole() );
        user.updatedAt( userDto.getUpdatedAt() );
        user.username( userDto.getUsername() );

        return user.build();
    }
}
