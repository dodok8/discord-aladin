#!/bin/bash

set -e  # 에러 발생 시 스크립트 중단

# 설정 변수
PROJECT_DIR="/root/discord-aladin"
LOG_FILE="/var/log/discord-aladin.log"
USER="root"
BUN_PATH="/root/.bun/bin/bun"  # bun 실행 파일 경로

# 로그 함수
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "=== Discord Aladin 배포 시작 ==="

# bun 실행 파일 존재 확인
if [ ! -f "$BUN_PATH" ]; then
    log "ERROR: bun 실행 파일을 찾을 수 없습니다: $BUN_PATH"
    log "bun 설치 확인 또는 BUN_PATH 변수를 수정하세요"
    exit 1
fi

log "bun 경로: $BUN_PATH"

# 1. discord-aladin 디렉토리로 이동
log "1. 프로젝트 디렉토리로 이동: $PROJECT_DIR"
cd "$PROJECT_DIR" || {
    log "ERROR: 디렉토리 이동 실패 - $PROJECT_DIR"
    exit 1
}

# 2. git pull 받기
log "2. Git pull 실행 중..."
BEFORE_COMMIT=$(git rev-parse HEAD)

# 현재 브랜치 확인 후 pull
CURRENT_BRANCH=$(git branch --show-current)
log "현재 브랜치: $CURRENT_BRANCH"

git pull origin "$CURRENT_BRANCH" || {
    log "ERROR: Git pull 실패 (브랜치: $CURRENT_BRANCH)"
    exit 1
}
AFTER_COMMIT=$(git rev-parse HEAD)

# 3. 변경사항이 있으면 빌드 실행
if [ "$BEFORE_COMMIT" != "$AFTER_COMMIT" ]; then
    log "3. 변경사항 감지됨. 빌드 시작..."
    log "   이전 커밋: $BEFORE_COMMIT"
    log "   현재 커밋: $AFTER_COMMIT"
    
    # 기존 프로세스 종료 (있다면)
    pkill -f "$BUN_PATH run start" || log "기존 프로세스가 없거나 종료됨"
    
    # 빌드 실행
    "$BUN_PATH" run build || {
        log "ERROR: 빌드 실패"
        exit 1
    }
    log "빌드 완료"
else
    log "3. 변경사항 없음. 빌드 건너뜀"
fi

# 4. 애플리케이션 시작
log "4. 애플리케이션 시작..."

# 기존 프로세스가 실행 중인지 확인
if pgrep -f "$BUN_PATH run start" > /dev/null; then
    log "기존 프로세스 발견. 종료 진행..."
    pkill -f "$BUN_PATH run start"
    sleep 3
fi

# 포그라운드에서 애플리케이션 실행 (systemd Type=simple에 맞게)
log "애플리케이션 시작 중..."
exec "$BUN_PATH" run start