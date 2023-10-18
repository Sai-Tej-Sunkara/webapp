#!/bin/bash
set -e
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install libterm-readline-gnu-perl mariadb-server ca-certificates zip unzip apt-transport-https lsb-release curl dirmngr -y
sudo unzip webapp.zip -d webapp
sudo mysql -u root <<MYSQL_SCRIPT
GRANT ALL PRIVILEGES ON *.* TO '$USER'@'localhost' IDENTIFIED BY '$PASS' WITH GRANT OPTION;
FLUSH PRIVILEGES;
MYSQL_SCRIPT
mysql -uroot -p$PASS <<SQL
ALTER USER $USER@'localhost' IDENTIFIED BY '$PASS';
CREATE DATABASE $DATABASE;
FLUSH PRIVILEGES;
SQL
curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
sudo apt update -y
sudo apt install nodejs npm -y
cd ~/webapp/
sudo npm install
cat <<EOF | sudo tee /etc/systemd/system/webapp.service
[Unit]
Description=app.js-service file to start the server instance in ec2
Documentation=https://fall2023.csye6225.cloud/
Wants=network-online.target
After=network-online.target

[Service]
Environment="DATABASE=$DATABASE"
Environment="HOST=$HOST"
Environment="USER=$USER"
Environment="PASS=$PASS"
Type=$SERVICE_TYPE
User=$DEBIAN_USER
WorkingDirectory=/home/$DEBIAN_USER/webapp/
ExecStart=/usr/bin/node /home/$DEBIAN_USER/webapp/app.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable webapp.service
sudo systemctl start webapp.service