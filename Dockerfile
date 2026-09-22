# Production environment
# You can change ECR_REGISTRY & BASE_IMAGE in ./github/workflows/realease.yaml
ARG ECR_REGISTRY
ARG BASE_IMAGE=nginx:stable-alpine
FROM ${ECR_REGISTRY}${BASE_IMAGE}

COPY ./dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
