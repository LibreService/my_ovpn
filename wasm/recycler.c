#include "api.h"

void free_key(EVP_PKEY *pkey) {
    EVP_PKEY_free(pkey);
}

void free_crt(X509 *crt) {
    X509_free(crt);
}

void free_ta_key(unsigned char *str) {
    free(str);
}
