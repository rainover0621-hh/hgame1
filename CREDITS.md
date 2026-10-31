# 출처

## 효과음 (`assets/sfx/`)

[Endless Sky](https://github.com/endless-sky/endless-sky)의 `sounds/` 폴더에서 가져와 mp3(모노, 96kbps)로 변환했습니다.
Endless Sky의 `copyright` 파일에 따르면 아래 파일은 모두 **퍼블릭 도메인**이며, freesound.org의 퍼블릭 도메인 소리를 바탕으로 만들어졌습니다.
퍼블릭 도메인이라 출처 표시 의무는 없지만, 고마움을 담아 적어 둡니다.

| 게임 파일 | 원본 파일 | 쓰임 |
|---|---|---|
| `strike.mp3` | `sounds/grab-strike.wav` | 정답 공격 |
| `explode-small.mp3` | `sounds/explosion small.wav` | 요괴 처치 |
| `explode-large.mp3` | `sounds/explosion large.wav` | 보스 처치 |
| `bite.mp3` | `sounds/plankton bite.wav` | 오답 피해 |
| `crunch.mp3` | `sounds/crunch.wav` | 장애물 충돌 |
| `pulse.mp3` | `sounds/pulse.wav` | 아이템 획득 |
| `magic.mp3` | `sounds/magic weapon.wav` | 원정 완료 |

Endless Sky의 코드(GPL-3.0)와 그림(대부분 CC-BY-SA)은 가져오지 않았습니다.

## 초상화 (`assets/portraits/`)

저장소 주인이 제공한 캐릭터·몬스터 콘셉트 이미지에서 주인공(검객·술사·궁수)과 보스(요마·용·귀혼·늑대괴수·거대거미) 칸을 잘라 썼습니다.

## 요괴 그림 (`assets/mobs/`)

저장소 주인이 제공한 그림을 넣는 폴더입니다. 파일이 있는 요괴는 게임 속에서 그 그림으로, 없는 요괴는 코드로 그린 그림으로 나옵니다. 지금은 비어 있습니다.

## QR 코드 라이브러리

- `assets/lib/qrcode.js` — QR Code Generator for JavaScript, Copyright (c) 2009 Kazuhiko Arase, MIT 라이선스. 교사용 배포 설정(teacher.html)에서 QR을 그릴 때 쓴다.
