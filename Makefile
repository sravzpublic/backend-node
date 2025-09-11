# Makefile
SHELL := /bin/bash

.PHONY: .EXPORT_ALL_VARIABLES

.EXPORT_ALL_VARIABLES:
export NODE_ENV=vagrant
export NODE_PORT=3032
export NVM_DIR=${HOME}/.nvm


run:
	node server.js

build:
	docker build --tag public.ecr.aws/b8h3z2a1/sravz/backend-node:$(BACKEND_NODE_IMAGE_Version) .