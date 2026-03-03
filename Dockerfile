# Node.js 20 슬림 버전을 기반으로 가벼운 이미지 생성
FROM node:20-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 라이브러리 업데이트 및 필수 도구 설치
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Cloudflare Wrangler CLI 전역 설치 (서버리스 개발 필수 도구)
RUN npm install -g wrangler

# 소스 코드 복사 (나중에 볼륨 바인딩으로 대체 가능)
COPY . .

# 의존성 설치 (필요시 실행)
# RUN npm install

# 포트 설정 (Vite: 5173, Wrangler: 8787)
EXPOSE 5173 8787

# 기본 컨테이너 실행 명령 (대기 상태 유지)
CMD ["tail", "-f", "/dev/null"]
