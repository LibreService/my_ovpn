set -e
cd openssl
emconfigure ./Configure gcc
sed -i.bak s/^CROSS_COMPILE=.*/CROSS_COMPILE=/ Makefile && rm Makefile.bak
make clean
emmake make build_generated libcrypto.a
