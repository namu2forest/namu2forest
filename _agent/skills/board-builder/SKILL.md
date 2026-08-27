---
name: board-builder
description: GitHub REST API 및 LocalStorage 하이브리드 기반의 정적 게시판 구축 및 유지보수 스킬 정의서입니다.
---

# Board Builder Skill Definition

## Overview
Board Builder 스킬은 별도의 RDBMS 없이 **GitHub REST API** 및 **LocalStorage**를 활용하여 정적 웹사이트(Vercel 등)에 게시판/뉴스 기능 및 관리자 대시보드를 통합 구축하는 규격입니다.

## Component Architecture

1. **Client-Side DB Controller (`db.js`)**:
   - LocalStorage를 1차 캐시 및 오프라인 저장소로 활용.
   - GitHub API (`PUT /repos/{owner}/{repo}/contents/data/posts.json`)를 통해 `data/posts.json` 커밋 동기화.

2. **Serverless Security API (`api/config.js`)**:
   - Vercel Serverless Function 환경에서 `ADMIN_PASSWORD` 검증 및 `GITHUB_TOKEN` 주입.

3. **Board Pages**:
   - `news.html`: 게시글 목록, 카테고리 필터링 및 실시간 검색.
   - `news-detail.html`: `marked.js` 기반 마크다운 렌더링.
   - `news-write.html`: 게시글 작성 및 수정 폼.
   - `admin.html`: 관리자 전용 대시보드 및 GitHub 동기화.

## Config Schema (`config/git_config.json`)
```json
{
  "github_token": "YOUR_GITHUB_TOKEN",
  "github_owner": "namu2forest",
  "github_repo": "namu2forest",
  "data_file_path": "data/posts.json"
}
```
