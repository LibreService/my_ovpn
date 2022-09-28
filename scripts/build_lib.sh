set -e
cd openssl
emconfigure ./Configure gcc
sed -i s/^CROSS_COMPILE=.*/CROSS_COMPILE=/ Makefile
make clean
emmake make build_libs
