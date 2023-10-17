#!/bin/bash
set -e
export DATABASE=healthz
export DATABASE_HOST=127.0.0.1
export DATABASE_USERNAME=root
export DATABASE_PASSWORD=root
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install libterm-readline-gnu-perl -y
sudo apt-get install ca-certificates zip unzip apt-transport-https lsb-release curl dirmngr -y
sudo unzip webapp.zip
sudo apt-get install mariadb-server -y 
sudo mysql -u root <<MYSQL_SCRIPT
GRANT ALL PRIVILEGES ON *.* TO '$DATABASE_USERNAME'@'localhost' IDENTIFIED BY '$DATABASE_PASSWORD' WITH GRANT OPTION;
FLUSH PRIVILEGES;
MYSQL_SCRIPT
mysql -uroot -p$DATABASE_PASSWORD <<SQL
ALTER USER $DATABASE_USERNAME@'localhost' IDENTIFIED BY '$DATABASE_PASSWORD';
CREATE DATABASE $DATABASE;
FLUSH PRIVILEGES;
SQL
curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
sudo apt update
sudo apt install nodejs npm -y
cat <<EOF | sudo tee /etc/systemd/system/webapp.service
[Unit]
Description=server.js - making your environment variables
Documentation=https://example.com
Wants=network-online.target
After=network-online.target

[Service]
Environment="DATABASE_NAME=$DATABASE"
Environment="DB_HOST=$DATABASE_HOST"
Environment="MYSQL_USERNAME=$DATABASE_USERNAME"
Environment="MYSQL_PASSWORD=$DATABASE_PASSWORD"
Type=simple
User=admin
WorkingDirectory=/home/admin/webapp
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo chmod 755 ~/webapp
sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp