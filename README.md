# ABAP Workbench

ABAP 문법과 실제 SAP 표준 테이블 조회 예제, 코드 생성기를 모은 개인 학습 사이트입니다.

[사이트 열기](https://sherlock0105.github.io/abap-workbench/)

- ALV · READ · LOOP · 신문법을 대분류/역할별로 탐색
- 핵심 코드 우선 표시, 필요한 선언과 전체 코드는 별도 탭
- 코드 검색 · 구문 강조 · 복사 · HTML/ZIP 저장
- F4 · Enter 검증 · MAKE_FCAT 등 코드 생성
- 기존 문서·이미지·GitHub 원문과 브라우저의 개인 노트/백업 기능

## 로컬 실행

저장소 루트에서 다음 명령을 실행하고 http://localhost:4175 를 엽니다.

```sh
python -m http.server 4175 --directory dist
```

## 검증

```sh
npm install --ignore-scripts --package-lock=false
npm run check
```

## 게시

GitHub Pages의 Source는 **GitHub Actions**입니다. main에 변경을 올리면 검사 후 dist를 자동 게시합니다.
별도 서버나 API 키가 필요 없는 정적 사이트이며, 코드 예제는 대상 SAP 시스템에서 활성화·실행을 확인해야 합니다.
즐겨찾기와 개인 노트는 브라우저에 저장됩니다. 주소가 바뀌면 기존 사이트의 JSON 백업/복원을 사용하세요.
