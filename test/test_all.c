#include <assert.h>
#include <openssl/types.h>
#include <string.h>
#include "../wasm/api.h"

int main() {
    init();

    EVP_PKEY *ca_key = gen_key();

    char *key_str = print_key(ca_key);
    puts(key_str);
    char *buf = strdup(key_str);
    EVP_PKEY *key = parse_key(buf, strlen(buf));
    free(buf);
    assert(is_key_valid(key));
    assert(get_key_bits(key) == 2048);
    

    X509 *ca_crt = gen_ca_crt(ca_key, "OpenVPN-CN", 365);

    char *crt_str = print_crt(ca_crt);
    puts(crt_str);
    buf = strdup(crt_str);
    X509 *crt = parse_crt(buf, strlen(buf));
    free(buf);
    assert(!is_crt_expired(crt));
    assert(is_crt_valid(crt, key));
    free_key(key);
    free_crt(crt);

    EVP_PKEY *server_key = gen_key();
    X509 *server_crt = gen_crt(ca_key, ca_crt, server_key, "OpenVPN-Server", 365);

    assert(is_crt_valid(server_crt, ca_key));

    free_crt(server_crt);
    free_key(server_key);
    free_crt(ca_crt);
    free_key(ca_key);

    EVP_PKEY *dh = gen_dh(2048);

    puts(print_dh(dh));
    free_key(dh);

    unsigned char *ta_key = gen_ta_key();

    puts(print_ta_key(ta_key));
    free_ta_key(ta_key);

    return 0;
}
