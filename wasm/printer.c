#include "api.h"

BIO *bio;

void close_string() {
    BIO_write(bio, "", 1);
}

char *print_key(EVP_PKEY *pkey) {
    char *str;
    BIO_reset(bio);
    PEM_write_bio_PrivateKey(bio, pkey, NULL, NULL, 0, NULL, NULL);
    close_string();
    BIO_get_mem_data(bio, &str);
    return str;
}

char *print_crt(X509 *x509) {
    char *str;
    BIO_reset(bio);
    PEM_write_bio_X509(bio, x509);
    close_string();
    BIO_get_mem_data(bio, &str);
    return str;
}

char *print_ta_key(unsigned char *buf) {
    static const char TA_BEGIN[] = "-----BEGIN OpenVPN Static key V1-----\n";
    static const char TA_END[] = "-----END OpenVPN Static key V1-----\n";

    char hex[3], *str;
    BIO_reset(bio);

    BIO_write(bio, TA_BEGIN, sizeof(TA_BEGIN) - 1);
    for(int i = 0; i < TA_KEY_LINE; ++i) {
        for(int j = 0; j < TA_KEY_BYTE_PER_LINE; ++j) {
            sprintf(hex, "%02x", buf[i*TA_KEY_BYTE_PER_LINE + j]);
            BIO_write(bio, hex, 2);
        }
        BIO_write(bio, "\n", 1);
    }
    BIO_write(bio, TA_END, sizeof(TA_END));

    BIO_get_mem_data(bio, &str);
    return str;
}

char *print_dh(EVP_PKEY *pkey) {
    char *str;
    BIO_reset(bio);
    OSSL_ENCODER_CTX *ectx = OSSL_ENCODER_CTX_new_for_pkey(pkey, OSSL_KEYMGMT_SELECT_DOMAIN_PARAMETERS, "PEM", NULL, NULL);
    OSSL_ENCODER_to_bio(ectx, bio);
    OSSL_ENCODER_CTX_free(ectx);
    close_string();
    BIO_get_mem_data(bio, &str);
    return str;
}

void init() {
    bio = BIO_new(BIO_s_mem());
}
