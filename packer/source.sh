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
sudo chmod 755 ~/webapp/
