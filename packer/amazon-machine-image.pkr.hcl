packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1"
    }
  }
}

variable "profile" {
    type = string
    default = env("AWS_PROFILE")
}

variable "aws_region" {
    type = string
    default = env("AWS_REGION")
}

variable "demo_ami_user" {
    type = string
    default = env("DEMO_AMI_USER")
}

variable "dev_ami_user" {
    type = string
    default = env("DEV_AMI_USER")
}

variable "instance" {
    type = string
    default = env("INSTANCE")
}

variable "source_ami" {
    type = string
    default = env("SOURCE_AMI")
}

variable "ssh_username" {
    type = string
    default = "admin"
}

variable "volume_size" {
    type = number
    default =  env("VOLUME_SIZE")
}

variable "volume_type" {
    type = string
    default = env("VOLUME_TYPE")
}

variable "protect_from_termination" {
    type = bool
    default = env("PROTECT_FROM_TERMINATION")
}

variable "logical_device_name" {
    type = string
    default = env("LOGICAL_DEVICE_NAME")
}

source "amazon-ebs" "amazon-machine-image-002728188" {
    profile         = var.profile
    region          = var.aws_region
    ami_users       = [var.dev_ami_user, var.demo_ami_user]
    ami_name        = "${formatdate("YYYY_MM_DD_HH_MM", timestamp())}_Cloud_Computing_6225_Debain"
    ami_description = "Amazon Machine Image for Assignments, Healthz Application"
    instance_type   = var.instance
    source_ami      = "${var.source_ami}"
    ssh_username    = "${var.ssh_username}"
    aws_polling {
        delay_seconds = 180
        max_attempts  = 25
    }
    launch_block_device_mappings {
        device_name           = var.logical_device_name
        volume_size           = var.volume_size
        volume_type           = var.volume_type
        delete_on_termination = var.protect_from_termination
    }
}

build {
    name = "CSYE_6225_PACKER"
    sources = ["source.amazon-ebs.amazon-machine-image-002728188"]
    provisioner "file" {
        source      = "webapp.zip"
        destination = "webapp.zip"
    }
    provisioner "shell" {
        script = "source.sh"
    }
}