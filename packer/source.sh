#!/bin/bash

source ~/.bashrc
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install mariadb-server ca-certificates zip unzip apt-transport-https lsb-release curl dirmngr -y
unzip webapp.zip -d webapp

sudo mysql --user="$USER" --password="$PASS" <<EOF
GRANT ALL PRIVILEGES ON *.* TO '$USER'@'localhost' IDENTIFIED BY '$PASS' WITH GRANT OPTION;
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS $DATABASE;
EOF

curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
sudo apt update -y
sudo apt install nodejs npm -y
cd ~/webapp/
sudo npm install
cat <<EOF | sudo tee /etc/systemd/system/webapp.service
[Unit]
Description=server.js-service file to start the server instance in ec2
Documentation=https://wwww.example.com/
Wants=network-online.target
After=network-online.target

[Service]
Environment="DATABASE=$DATABASE"
Environment="HOST=$HOST"
Environment="USER=$USER"
Environment="PASS=$PASS"
Type=simple
User=admin
WorkingDirectory=/home/admin/webapp/
ExecStart=/usr/bin/node /home/admin/webapp/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo chmod 755 ~/webapp/
sudo systemctl daemon-reload
sudo systemctl enable webapp.service
sudo systemctl start webapp.service
