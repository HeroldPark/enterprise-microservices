package com.enterprise.mqtt.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Swagger/OpenAPI 설정
 */
@Configuration
public class SwaggerConfig {

    @Value("${server.port:8088}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:" + serverPort);
        localServer.setDescription("Local Server");

        Contact contact = new Contact();
        contact.setName("Enterprise Development Team");
        contact.setEmail("dev@enterprise.com");

        License license = new License();
        license.setName("Proprietary");

        Info info = new Info()
                .title("MQTT Service API")
                .version("1.0.0")
                .description("IoT 디바이스와 MQTT 통신을 처리하고 Kafka로 메시지를 전달하는 마이크로서비스 API")
                .contact(contact)
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer));
    }
}
