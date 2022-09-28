#include "api.h"

extern BIO *bio;

EVP_PKEY *parse_key(const char *buf, int len) {
    EVP_PKEY *pkey = NULL;
    BIO_reset(bio);
    BIO_write(bio, buf, len);
    PEM_read_bio_PrivateKey(bio, &pkey, NULL, NULL);
    return pkey;
}

int get_key_bits(EVP_PKEY *pkey) {
    return EVP_PKEY_bits(pkey);
}

int is_key_valid(EVP_PKEY *pkey) {
    EVP_PKEY_CTX *ctx = EVP_PKEY_CTX_new(pkey, NULL);
    int valid = EVP_PKEY_check(ctx);
    EVP_PKEY_CTX_free(ctx);
    return valid;
}

X509 *parse_crt(const char *buf, int len) {
    X509 *crt = NULL;
    BIO_reset(bio);
    BIO_write(bio, buf, len);
    PEM_read_bio_X509(bio, &crt, NULL, NULL);
    return crt;
}

int is_crt_expired(X509 *crt) {
    int day, sec;
    ASN1_TIME_diff(&day, &sec, NULL, X509_get0_notAfter(crt));
    return day <= 0 && sec <= 0;
}

int is_crt_valid(X509 *crt, EVP_PKEY *pkey) {
    return X509_verify(crt, pkey);
}
