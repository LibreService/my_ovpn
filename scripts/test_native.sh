set -e

os=`uname`
if [[ $os == 'Linux' ]]; then
  cd test
  gcc -fsanitize=address \
    -o test_all \
    ../wasm/*.c test_all.c \
    -l crypto
  ./test_all
fi
