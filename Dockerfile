FROM nginx:alpine
# 빌드된 index.html을 Nginx의 기본 정적 파일 경로로 복사
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]