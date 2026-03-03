# [보안 권고] 경량화된 노드 최신 LTS 버전 이미지 사용
FROM node:18-alpine

# 작업을 위한 내부 디렉토리 설정
WORKDIR /app

# 의존성 파일 먼저 복사 (빌드 캐시 최적화)
COPY package*.json ./

# 프로덕션 환경에 최적화된 모듈 설치 (불필요한 devDependencies 제거)
RUN npm install --only=production

# 소스 코드 전체 복사 (PMS 핵심 로직 포함)
COPY . .

# 서버리스 실행 및 컨테이너 통신을 위한 포트 개방
EXPOSE 8080

# 환경 변수 기본값 설정 (PMS 운영 모드)
ENV NODE_ENV=production
ENV PORT=8080

# [실행] 노드 엔진으로 PMS 백엔드 가동
CMD ["node", "server.js"]
