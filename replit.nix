{pkgs}: {
  deps = [
    pkgs.pkg-config
    pkgs.mysql-client
    pkgs.mysql
    pkgs.libmysqlclient
    pkgs.postgresql
    pkgs.openssl
  ];
}
