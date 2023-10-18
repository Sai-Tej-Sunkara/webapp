#!/bin/bash
set -e

# Define your environment variables
export HOST=127.0.0.1
export USER=root
export PASS=root
export DATABASE=healthz
export DIALECT=mysql

# Update and upgrade system packages
sudo apt-get update -y

# Install required packages
sudo apt-get install -y mariadb-server
sudo apt-get install -y ca-certificates zip unzip apt-transport-https lsb-release curl dirmngr

# Unzip webapp
sudo unzip webapp.zip -d webapp

# Configure MySQL
sudo mysql -u $USER <<MYSQL_SCRIPT
GRANT ALL PRIVILEGES ON *.* TO '$USER'@'localhost' IDENTIFIED BY '$PASS' WITH GRANT OPTION;
FLUSH PRIVILEGES;
MYSQL_SCRIPT

# More MySQL setup
mysql -u$USER -p$PASS <<SQL
ALTER USER $USER@'localhost' IDENTIFIED BY '$PASS';
CREATE DATABASE $DATABASE;
FLUSH PRIVILEGES;
SQL

# Install Node.js and npm
curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
sudo apt update -y
sudo apt install nodejs npm -y

# Navigate to the webapp directory and install npm dependencies
cd ~/webapp/webapp/
sudo npm install

# Create a systemd service file
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
Type=simple
User=admin
WorkingDirectory=/home/admin/webapp/webapp/
ExecStart=/usr/bin/node /home/admin/webapp/webapp/app.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd configuration, enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable webapp.service
sudo systemctl start webapp.service