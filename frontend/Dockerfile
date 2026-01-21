FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY app.js /usr/share/nginx/html/app.js
COPY transaction_template.csv /usr/share/nginx/html/transaction_template.csv
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
