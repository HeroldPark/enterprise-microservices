package com.enterprise.admin.entity;

import lombok.Getter;

/**
 * 활동 타입 열거형
 */
@Getter
public enum ActivityType {
    USER_REGISTER("사용자 등록"),
    USER_LOGIN("사용자 로그인"),
    USER_UPDATE("사용자 정보 수정"),
    USER_DELETE("사용자 삭제"),
    USER_ROLE_CHANGE("권한 변경"),
    MENU_CREATE("메뉴 생성"),
    MENU_UPDATE("메뉴 수정"),
    MENU_DELETE("메뉴 삭제"),
    BOARD_CREATE("게시글 작성"),
    BOARD_UPDATE("게시글 수정"),
    BOARD_DELETE("게시글 삭제"),
    COMMENT_CREATE("댓글 작성"),
    SETTINGS_UPDATE("설정 변경"),
    MODEL_CONFIG_UPDATE("모델 설정 변경");
    
    private final String description;
    
    ActivityType(String description) {
        this.description = description;
    }
}