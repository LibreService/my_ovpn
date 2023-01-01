set -e
n=`python -c 'import multiprocessing as mp; print(mp.cpu_count())'`

cd openssl
emconfigure ./Configure gcc
sed -i.bak s/^CROSS_COMPILE=.*/CROSS_COMPILE=/ Makefile && rm Makefile.bak
emmake make -j $n build_generated libcrypto.a
