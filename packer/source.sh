#!/bin/bash

source ~/.bashrc
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install zip unzip -y
unzip webapp.zip -d webapp

curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
sudo apt update -y
sudo apt install nodejs npm -y
cd ~/webapp/
sudo npm install
cd ..
sudo groupadd saitejsunkara
sudo useradd -m -s /bin/bash -g saitejsunkara saitejsunkara
sudo passwd -d saitejsunkara
sudo chown saitejsunkara:saitejsunkara -R ~/webapp/
sudo chmod 755 ~/webapp/
sudo mv ~/webapp /home/saitejsunkara/

sudo cat <<EOF | sudo tee /etc/systemd/system/webapp.service
[Unit]
Description=app.js
Documentation=https://fall2023.csye6225.cloud/
Wants=network-online.target
After=network-online.target cloud-final.service

[Service]
EnvironmentFile=/home/saitejsunkara/.env
Type=simple
User=saitejsunkara
WorkingDirectory=/home/saitejsunkara/webapp/
ExecStart=/usr/bin/node /home/saitejsunkara/webapp/app.js
Restart=on-failure

[Install]
WantedBy=cloud-init.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable webapp.service
sudo mkdir -p /var/log/webappLogs/ && sudo touch /var/log/webappLogs/webapp.log

sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/
 
sudo cat <<EOF | sudo tee /opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json
{
  "agent": {
      "metrics_collection_interval": 10,
      "logfile": "/var/logs/amazon-cloudwatch-agent.log"
  },
  "logs": {
      "logs_collected": {
          "files": {
              "collect_list": [
                  {
                      "file_path": "/var/log/webappLogs/webapp.log",
                      "log_group_name": "csye6225",
                      "log_stream_name": "webapp"
                  }
              ]
          }
      },
      "log_stream_name": "cloudwatch_log_stream"
  },
  "metrics":{
    "metrics_collected":{
       "statsd":{
          "service_address":":8125",
          "metrics_collection_interval":10,
          "metrics_aggregation_interval":60
       }
    }
}
}
EOF
sudo chown saitejsunkara:saitejsunkara /var/log/webappLogs/webapp.log
sudo wget https://amazoncloudwatch-agent.s3.amazonaws.com/debian/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
