#include "api.h"

EVP_PKEY *gen_key() {
    // openssl genrsa
    EVP_PKEY *pkey = NULL;
    EVP_PKEY_CTX *ctx = EVP_PKEY_CTX_new_from_name(NULL, "RSA", NULL);
    EVP_PKEY_keygen_init(ctx);
    EVP_PKEY_generate(ctx, &pkey);
    EVP_PKEY_CTX_free(ctx);
    return pkey;
}

X509_NAME *make_name(const char *CN) {
    X509_NAME *name = X509_NAME_new();
    int nid = OBJ_txt2nid("CN");
    X509_NAME_add_entry_by_NID(name, nid, MBSTRING_ASC, (const unsigned char *)CN, strlen(CN), -1, 0);
    return name;
}

void set_serial(X509 *x509, const char *n) {
    ASN1_INTEGER *serial = s2i_ASN1_INTEGER(NULL, n);
    X509_set_serialNumber(x509, serial);
    ASN1_INTEGER_free(serial);
}

void set_time(X509 *x509, int days) {
    X509_time_adj_ex(X509_getm_notBefore(x509), 0, 0, NULL);
    X509_time_adj_ex(X509_getm_notAfter(x509), days, 0, NULL);
}

X509 *make_crt(EVP_PKEY *ca_key, X509_NAME *ca_name, EVP_PKEY *pkey, X509_NAME *name, int days) {
    X509 *x509 = X509_new_ex(NULL, NULL);
    set_serial(x509, "0");
    X509_set_issuer_name(x509, ca_name);
    set_time(x509, days);
    X509_set_subject_name(x509, name);
    X509_set_pubkey(x509, pkey);

    EVP_MD_CTX *mctx = EVP_MD_CTX_new();
    EVP_PKEY_CTX *pkctx = NULL;
    EVP_DigestSignInit_ex(mctx, &pkctx, NULL, NULL, NULL, ca_key, NULL);
    X509_sign_ctx(x509, mctx);

    EVP_MD_CTX_free(mctx);
    return x509;
}

X509 *gen_ca_crt(EVP_PKEY *pkey, const char *CN, int days) {
    // openssl req -new -x509 -key ca.key -days 365 -subj /CN=OpenVPN-CA/ -config ''
    X509_NAME *name = make_name(CN);
    X509 *crt = make_crt(pkey, name, pkey, name, days);
    X509_NAME_free(name);
    return crt;
}

X509 *gen_crt(EVP_PKEY *ca_key, X509 *ca_crt, EVP_PKEY *pkey, const char *CN, int days) {
    // openssl req -new -key server.key -subj /CN=OpenVPN-server/ -config '' | openssl x509 -req -days 365 -set_serial 0 -CA ca.crt -CAkey ca.key
    X509_NAME *ca_name = X509_get_subject_name(ca_crt);
    X509_NAME *name = make_name(CN);
    X509 *crt = make_crt(ca_key, ca_name, pkey, name, days);
    X509_NAME_free(name);
    return crt;
}

EVP_PKEY *gen_dh(int bit) {
    // openssl dhparam 2048
    EVP_PKEY *pkey = NULL;
    EVP_PKEY_CTX *ctx = EVP_PKEY_CTX_new_from_name(NULL, "DH", NULL);
    EVP_PKEY_paramgen_init(ctx);
    EVP_PKEY_CTX_set_dh_paramgen_prime_len(ctx, bit);
    EVP_PKEY_CTX_set_dh_paramgen_generator(ctx, 2);
    EVP_PKEY_generate(ctx, &pkey);
    EVP_PKEY_CTX_free(ctx);
    return pkey;
}

unsigned char *gen_ta_key() {
    // openvpn --genkey
    unsigned char *buf = malloc(TA_KEY_BYTE);
    RAND_bytes(buf, TA_KEY_BYTE);
    return buf;
}
