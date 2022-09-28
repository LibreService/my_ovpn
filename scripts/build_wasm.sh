set -e
cd wasm
emcc \
  -O2 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS=_gen_key,_gen_ca_crt,_gen_crt,_gen_dh,_gen_ta_key,\
_parse_key,_get_key_bits,_is_key_valid,_parse_crt,_is_crt_expired,_is_crt_valid,\
_print_key,_print_crt,_print_ta_key,_print_dh,_init,\
_free_key,_free_crt,_free_ta_key \
  -s EXPORTED_RUNTIME_METHODS='["ccall"]' \
  -I ../openssl/include \
  -o ../public/crypto.js \
  generator.c \
  printer.c \
  recycler.c \
  parser.c \
  ../openssl/libcrypto.a
