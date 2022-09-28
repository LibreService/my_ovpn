# My OVPN
![](https://img.shields.io/github/license/LibreService/my_file_type)

Generate CA, server and client configuration for OpenVPN.

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

## License
AGPLv3+
