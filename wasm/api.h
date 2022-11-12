#ifndef API_H
#define API_H

#include <stdio.h>
#include <stdlib.h>
#include "openssl/evp.h"
#include "openssl/bio.h"
#include "openssl/pem.h"
#include "openssl/conf.h"
#include "openssl/x509.h"
#include "openssl/x509v3.h"
#include "openssl/objects.h"
#include "openssl/rand.h"
#include "openssl/encoder.h"

#define TA_KEY_BYTE_PER_LINE 16
#define TA_KEY_LINE 16
#define TA_KEY_BYTE (TA_KEY_BYTE_PER_LINE * TA_KEY_LINE)

EVP_PKEY *gen_key();
X509 *gen_ca_crt(EVP_PKEY *pkey, const char *CN, int days);
X509 *gen_crt(EVP_PKEY *ca_key, X509 *ca_crt, EVP_PKEY *pkey, const char *CN, int days);
EVP_PKEY *gen_dh(int bit);
unsigned char *gen_ta_key();

EVP_PKEY *parse_key(const char *buf, int len);
int get_key_bits(EVP_PKEY *pkey);
int is_key_valid(EVP_PKEY *pkey);
X509 *parse_crt(const char *buf, int len);
int is_crt_expired(X509 *crt);
int is_crt_valid(X509 *crt, EVP_PKEY *pkey);

char *print_key(EVP_PKEY *pkey);
char *print_crt(X509 *x509);
char *print_ta_key(unsigned char *buf);
char *print_dh(EVP_PKEY *pkey);
void init();

void free_key(EVP_PKEY *pkey);
void free_crt(X509 *crt);
void free_ta_key(unsigned char *str);
#endif
