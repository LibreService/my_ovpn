# My OVPN
![](https://img.shields.io/github/license/LibreService/my_ovpn)

Generate CA, server and client configuration for OpenVPN.

https://my-ovpn.vercel.app/

This is a **STATIC** website so you **DON'T** need to own a server to host it.

All computation is performed in browser, thanks to Web Assembly.

It's also a [PWA](https://web.dev/progressive-web-apps/), so you can install it like a native App and use it **OFFLINE**.


## Use case
### CA
* Generate `ca.key` and `ca.crt`.
### Server
* Given `ca.key` and `ca.crt`, generate `server.key` and `server.crt`.
* Generate `dh2048.pem` (extremely slow).
* Generate `ta.key` to be shared with every client.
* Generate `server.conf`.
### Client
* Given `ca.key` and `ca.crt`, generate `client.key` and `client.crt`.
* Generate `client.ovpn`.
* Embed `ca.crt`, `client.key`, `client.crt` and `ta.key` into `client.ovpn` (useful for Android and iOS).

## Self host
Download latest [artifact](https://github.com/LibreService/my_ovpn/releases/download/latest/my-ovpn-dist.zip) built by GitHub Actions.

## Development workflow
My OVPN can be built on Linux and macOS.

For Windows, you may use WSL.
### Install node
You may use [nvm](https://github.com/nvm-sh/nvm) to install node.
### Install pnpm and dev dependencies
```sh
npm i -g pnpm
pnpm i
```
### Install emsdk
https://emscripten.org/docs/getting_started/downloads.html
### Get submodule
```sh
git submodule init
git submodule update
```
### Build wasm
```sh
pnpm run lib
pnpm run wasm
```
### Run develop server
```sh
pnpm run dev
```
### Lint
```sh
pnpm run lint:fix
```
### Check type
```sh
pnpm run check
```
### Build
```sh
pnpm run build
```
### Test
```sh
pnpm run test
```
### Preview
```sh
pnpm run preview
```
### Deploy
```sh
export LIBRESERVICE_CDN=https://cdn.jsdelivr.net/npm/@libreservice/my-ovpn@VERSION/dist/ # optional
vercel build --prod
vercel deploy --prebuilt --prod
```

## License
AGPLv3+
