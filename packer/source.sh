#!/bin/bash
set -e
export DATABASE=healthz
export DATABASE_HOST=127.0.0.1
export DATABASE_USERNAME=root
export DATABASE_PASSWORD=root
export DEBIAN_FRONTEND=noninteractive
export DEBIAN_USER=admin
export SERVICE_TYPE=simple
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install libterm-readline-gnu-perl mariadb-server ca-certificates zip unzip apt-transport-https lsb-release curl dirmngr -y
sudo unzip webapp.zip
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
Description=app.js-service file to start the server instance in ec2
Documentation=https://fall2023.csye6225.cloud/
Wants=network-online.target
After=network-online.target

[Service]
Environment="DATABASE_NAME=$DATABASE"
Environment="DB_HOST=$DATABASE_HOST"
Environment="MYSQL_USERNAME=$DATABASE_USERNAME"
Environment="MYSQL_PASSWORD=$DATABASE_PASSWORD"
Type=$SERVICE_TYPE
User=$DEBIAN_USER
WorkingDirectory=~/webapp/
ExecStart=node app.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo chmod 755 ~/webapp/
sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp