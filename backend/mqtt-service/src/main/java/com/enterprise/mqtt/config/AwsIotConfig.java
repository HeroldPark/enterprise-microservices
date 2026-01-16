package com.enterprise.mqtt.config;

import com.amazonaws.services.iot.client.AWSIotMqttClient;
import com.enterprise.mqtt.listener.MqttMessageListener;
import com.enterprise.mqtt.service.KafkaProducerService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.RSAPrivateCrtKeySpec;
import java.util.Base64;

/**
 * AWS IoT MQTT 클라이언트 설정
 */
@Slf4j
@Configuration
public class AwsIotConfig {

    @Value("${aws.iot.endpoint}")
    private String endpoint;

    @Value("${aws.iot.client-id}")
    private String clientId;

    @Value("${aws.iot.certificate-file}")
    private String certificateFile;

    @Value("${aws.iot.private-key-file}")
    private String privateKeyFile;

    @Value("${aws.iot.connection-timeout:30000}")
    private int connectionTimeout;

    @Value("${aws.iot.keep-alive-interval:60}")
    private int keepAliveInterval;

    /**
     * AWS IoT MQTT 클라이언트 Bean 생성
     */
    @Bean
    public AWSIotMqttClient awsIotMqttClient() throws Exception {
        log.info("Initializing AWS IoT MQTT Client");
        log.info("Endpoint: {}", endpoint);
        log.info("Client ID: {}", clientId);

        // 인증서 및 개인키 읽기
        String certificateContent = readFile(certificateFile);
        byte[] privateKeyBytes = Files.readAllBytes(Paths.get(privateKeyFile));

        // KeyStore 생성
        KeyStore keyStore = createKeyStore(certificateContent, privateKeyBytes);
        String keyPassword = "password";

        // MQTT 클라이언트 생성
        AWSIotMqttClient client = new AWSIotMqttClient(
                endpoint,
                clientId,
                keyStore,
                keyPassword
        );

        client.setConnectionTimeout(connectionTimeout);
        client.setKeepAliveInterval(keepAliveInterval);

        log.info("AWS IoT MQTT Client initialized successfully");
        return client;
    }

    /**
     * MQTT 메시지 리스너 Bean 생성
     */
    @Bean
    public MqttMessageListener mqttMessageListener(
            KafkaProducerService kafkaProducerService,
            @Value("${aws.iot.subscribe-topics:device/topic/+}") String subscribeTopics,
            @Value("${aws.iot.qos:0}") int qos) {
        
        String[] topicsArray = subscribeTopics.split(",");
        for (int i = 0; i < topicsArray.length; i++) {
            topicsArray[i] = topicsArray[i].trim();
        }
        
        return new MqttMessageListener(
                kafkaProducerService,
                topicsArray,
                qos
        );
    }

    /**
     * KeyStore 생성
     */
    private KeyStore createKeyStore(String certificatePem, byte[] privateKeyBytes) throws Exception {
        log.debug("Creating KeyStore from certificate and private key");

        Certificate certificate = parseCertificate(certificatePem);
        PrivateKey privateKey = getPrivateKey(privateKeyBytes);

        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null, null);
        keyStore.setKeyEntry(
                "alias",
                privateKey,
                "password".toCharArray(),
                new Certificate[]{certificate}
        );

        log.debug("KeyStore created successfully");
        return keyStore;
    }

    /**
     * PEM 인증서 파싱
     */
    private Certificate parseCertificate(String certificatePem) throws Exception {
        String certificateData = certificatePem
                .replace("-----BEGIN CERTIFICATE-----", "")
                .replace("-----END CERTIFICATE-----", "")
                .replaceAll("\\s", "");

        byte[] decoded = Base64.getDecoder().decode(certificateData);
        CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
        return certFactory.generateCertificate(new ByteArrayInputStream(decoded));
    }

    /**
     * 개인키 파싱 (PKCS#1 및 PKCS#8 지원)
     * Amazon의 PrivateKeyReader 로직 사용
     */
    private PrivateKey getPrivateKey(byte[] keyBytes) throws Exception {
        InputStream stream = new ByteArrayInputStream(keyBytes);
        BufferedReader br = new BufferedReader(new InputStreamReader(stream, "UTF-8"));
        StringBuilder builder = new StringBuilder();
        boolean inKey = false;
        boolean isRSAKey = false;

        for (String line = br.readLine(); line != null; line = br.readLine()) {
            if (!inKey) {
                if (line.startsWith("-----BEGIN ") && line.endsWith(" PRIVATE KEY-----")) {
                    inKey = true;
                    isRSAKey = line.contains("RSA");
                }
                continue;
            } else {
                if (line.startsWith("-----END ") && line.endsWith(" PRIVATE KEY-----")) {
                    break;
                }
                builder.append(line);
            }
        }

        byte[] encoded = org.apache.commons.codec.binary.Base64.decodeBase64(builder.toString());
        
        java.security.spec.KeySpec keySpec;
        if (isRSAKey) {
            // PKCS#1 형식 (RSA PRIVATE KEY)
            keySpec = getRSAKeySpec(encoded);
        } else {
            // PKCS#8 형식 (PRIVATE KEY)
            keySpec = new PKCS8EncodedKeySpec(encoded);
        }

        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(keySpec);
    }

    /**
     * PKCS#1을 RSAPrivateCrtKeySpec으로 변환
     */
    private RSAPrivateCrtKeySpec getRSAKeySpec(byte[] keyBytes) throws IOException {
        DerParser parser = new DerParser(keyBytes);
        Asn1Object sequence = parser.read();
        
        if (sequence.getType() != DerParser.SEQUENCE) {
            throw new IOException("Invalid DER: not a sequence");
        }

        parser = sequence.getParser();
        parser.read(); // Skip version
        
        BigInteger modulus = parser.read().getInteger();
        BigInteger publicExp = parser.read().getInteger();
        BigInteger privateExp = parser.read().getInteger();
        BigInteger prime1 = parser.read().getInteger();
        BigInteger prime2 = parser.read().getInteger();
        BigInteger exp1 = parser.read().getInteger();
        BigInteger exp2 = parser.read().getInteger();
        BigInteger crtCoef = parser.read().getInteger();

        return new RSAPrivateCrtKeySpec(modulus, publicExp, privateExp, 
                prime1, prime2, exp1, exp2, crtCoef);
    }

    /**
     * 파일 읽기
     */
    private String readFile(String filePath) throws IOException {
        log.debug("Reading file: {}", filePath);
        return new String(Files.readAllBytes(Paths.get(filePath)));
    }

    // ==================== DER Parser 클래스들 ====================

    static class DerParser {
        public static final int SEQUENCE = 0x10;
        public static final int INTEGER = 0x02;
        public static final int CONSTRUCTED = 0x20;

        private InputStream in;

        public DerParser(byte[] bytes) throws IOException {
            this(new ByteArrayInputStream(bytes));
        }

        public DerParser(InputStream in) throws IOException {
            this.in = in;
        }

        public Asn1Object read() throws IOException {
            int tag = in.read();
            if (tag == -1) {
                throw new IOException("Invalid DER: stream too short, missing tag");
            }
            
            int length = getLength();
            byte[] value = new byte[length];
            int n = in.read(value);
            
            if (n < length) {
                throw new IOException("Invalid DER: stream too short, missing value");
            }
            
            return new Asn1Object(tag, length, value);
        }

        private int getLength() throws IOException {
            int i = in.read();
            if (i == -1) {
                throw new IOException("Invalid DER: length missing");
            }
            
            if ((i & ~0x7F) == 0) {
                return i;
            }

            int num = i & 0x7F;
            if (i >= 0xFF || num > 4) {
                throw new IOException("Invalid DER: length field too big (" + i + ")");
            }
            
            byte[] bytes = new byte[num];
            int n = in.read(bytes);
            if (n < num) {
                throw new IOException("Invalid DER: length too short");
            }
            
            return new BigInteger(1, bytes).intValue();
        }
    }

    static class Asn1Object {
        private final int type;
        private final int length;
        private final byte[] value;
        private final int tag;

        public Asn1Object(int tag, int length, byte[] value) {
            this.tag = tag;
            this.type = tag & 0x1F;
            this.length = length;
            this.value = value;
        }

        public int getType() {
            return type;
        }

        public byte[] getValue() {
            return value;
        }

        public boolean isConstructed() {
            return (tag & DerParser.CONSTRUCTED) == DerParser.CONSTRUCTED;
        }

        public DerParser getParser() throws IOException {
            if (!isConstructed()) {
                throw new IOException("Invalid DER: can't parse primitive entity");
            }
            return new DerParser(value);
        }

        public BigInteger getInteger() throws IOException {
            if (type != DerParser.INTEGER) {
                throw new IOException("Invalid DER: object is not integer");
            }
            return new BigInteger(value);
        }
    }
}
