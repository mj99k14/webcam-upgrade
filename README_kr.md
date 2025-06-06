
# 🧍‍♂️ 거북목 & 어깨 기울기 측정 프로그램

이 프로젝트의 README는 다음 언어로 제공됩니다.  
언어를 선택하세요:

🇯🇵 [日本語版読む](./README.md)  
🇰🇷 한국어 (현재 표시 중)

---

# 🧍‍♂️ 거북목 & 어깨 기울기 실시간 측정 웹앱

> **웹캠 + Pose Detection + Vue.js + Node.js**  
> 실시간 자세 분석을 통해 거북목과 어깨 비대칭을 측정하는 프로젝트  
> 📷 웹캠만 켜면 → 📐 각도 자동 측정 → 📝 분석 요약 제공

---

## 📌 프로젝트 개요

현대인들의 잘못된 자세 문제(거북목, 어깨 비대칭)를 개선하기 위해  
**웹캠 기반의 실시간 자세 측정 시스템**을 개발했습니다.

- 웹캠으로 상반신 촬영  
- **딥러닝 기반  MediaPipe Pose**으로 목/어깨 각도 자동 계산  
- 측정된 각도를 분석하여 **자세 요약 카드**와 피드백 제공

---

## 🎥 시연 영상

> 📸 실시간 측정과 결과 화면 예시

### 📍 측정 중 화면  
![Posture Demo](./posture_demo.gif)

### 📍 측정 결과 화면  
![Measurement Result](./measurement_result.gif)

- 위: 웹캠을 켜고 실시간으로 자세를 측정하는 장면  
- 아래: 측정 완료 후 사용자에게 제공되는 분석 결과 화면

---

## 🛠️ 사용 기술

| 구분 | 기술 |
|------|------|
| **Frontend** | Vue.js, Chart.js |
| **Backend** | Node.js, Express, MySQL |
| **AI 모델** | Mediapipe Pose |
| **기타** | Webcam Streaming, REST API, Donut Chart 시각화 등 |

---

## ✨ 주요 기능 요약

- 실시간 웹캠 자세 측정  
- 목 각도 / 어깨 비대칭 자동 추출  
- 가장 바른 자세 / 나쁜 자세 이미지 저장  
- 분석 요약 카드 및 도넛 차트 시각화  
- 마이페이지에서 히스토리 확인 가능

---
### 📁 Frontend 디렉토리 구조

- `components/`  
  - 측정 기능(`measure/`), 결과 표시(`feedback/`, `report/`), 이미지 관리(`photo/`) 등을  
    **기능별로 폴더로 나누어 컴포넌트를 모듈화**함.
  - 이를 통해 유지보수가 용이하고, 뷰 간 독립성을 확보함.

- `router/`  
  - 뷰 페이지 라우팅을 담당. 측정 페이지, 마이페이지 등으로 이동 가능

- `api.js`  
  - 백엔드와의 통신을 담당하는 공통 API 정의

- `App.vue / main.js`  
  - 프로젝트 진입점 및 전역 설정
---
### 📁 Backend 디렉토리 구조 (Node.js + Express)

- `config/db.js`  
  - MySQL 연결 설정

- `controllers/`  
  - 각 기능별 처리 로직 정의 (자세 측정 저장, 사진 업로드 등)

- `routes/`  
  - 사용자 인증, 사진, 자세 등 각 기능별 API 경로 설정  
  - RESTful한 URL 패턴 기반으로 구성 (`/api/posture/save`, `/api/photos/upload` 등)

- `newback/`  
  - 백엔드 루트 디렉토리 (기타 설정 파일 포함)
---

## 🔍 기술적 고려 사항 및 개선 포인트

이 프로젝트에서는 단순한 기술 구현을 넘어서, 실제 사용자의 행동과 상황을 고려하여 다음과 같은 개선과 설계를 수행했습니다.

---

### 1. 📐 거북목 각도의 기준 설정

- 목 각도는 귀(ear)와 어깨(shoulder)를 잇는 벡터의 기울기를 이용해 계산하였으며,  
  수학적으로 경사각을 도출하여 **135° 이상일 경우 거북목으로 판단**하는 구조를 설계했습니다.
- 이 판별 방식은 보다 **객관적이고 정밀한 측정**을 가능하게 합니다.

---

### 2. 🎥 단일 사진 촬영 → 영상 기반 측정으로 개선

- 초창기에는 버튼 클릭으로 1장의 사진을 촬영하는 구조였으나,  
  사용자가 촬영 순간 자세를 임시로 고치는 경우가 많아 실제 자세를 반영하기 어려웠습니다.
- 이를 해결하기 위해 **측정 시간 동안 지속적으로 프레임을 저장하고**,  
  이후 **목 각도 기준으로 가장 좋은(최소 각도), 가장 나쁜(최대 각도) 프레임을 자동으로 추출**하는 구조로 전환했습니다.
- 덕분에 **실제 일상적인 자세 상태를 정확히 평가할 수 있는 UX 중심 시스템**으로 개선되었습니다.

---

### 3. 🏆 베스트 / 워스트 자세 자동 판단 및 서버 저장

- 측정 중 수집된 모든 프레임에서 **목 각도가 가장 작거나 큰 프레임을 자동 판단**합니다.
- 선택된 프레임은 사용자 ID와 함께 서버에 전송되며,  
  **각도, 어깨 기울기, 측정 시간, 측정 시각 등의 메타데이터를 포함한 결과로 DB에 저장**됩니다.
- 사용자는 직접 선택하지 않아도, 시스템이 **가장 의미 있는 데이터를 자동 선택**해 보여주므로 신뢰성과 편의성이 동시에 보장됩니다.

---

### 4. 🧠 SPA 기반 실시간 측정 인터페이스

- Vue.js + Node.js + Express를 활용한 **SPA(Single Page Application)** 구조로 구성되어  
  측정 → 결과 확인 → 다시 측정 흐름이 **끊김 없이 빠르게 처리**됩니다.
- 프론트엔드-백엔드 간 RESTful API 기반으로 **실시간 데이터 송수신**이 원활하게 이루어집니다.

---

### 5. 🔐 사용자 식별 및 데이터 누적 저장

- 로그인한 사용자의 정보를 `localStorage`에서 불러와 측정 결과와 연결되도록 구성되어 있으며,  
  **사용자별 자세 이력 관리가 가능**한 구조입니다.
- 이를 통해 향후 **측정 변화 추적, 리포트 제공 등 다양한 기능 확장 기반**이 마련되어 있습니다.
## 🙋 만든 사람

| 이름 | 역할 |
|------|------|
| 김민정 | 전체 시스템 설계, 프론트/백 구현, AI 측정 로직 작성 |
