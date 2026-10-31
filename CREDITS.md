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

## 배경음악 (assets/bgm)

선생님이 OpenGameArt.org에서 CC0(퍼블릭 도메인)으로 골라 내려받은 곡이다. 게임에 맞게 음량만 고르게 맞추고(-18 LUFS) mp3 96kbps로 바꿨다.
작가 이름이 확실하지 않은 곡은 OpenGameArt.org의 해당 곡 페이지에서 확인할 것.

| 파일 | 원곡 | 쓰는 곳 |
|---|---|---|
| title.mp3 | Town Theme | 첫 화면, 이야기 장면 |
| stage1.mp3 | Melody Vollen (Tozan) | 제1장 |
| stage2.mp3 | Boss_Koto (G_P) | 제2장 |
| stage3.mp3 | Prepare Your Swords | 제3장 |
| stage4.mp3 | S31 - Night Prowler | 제4장 |
| stage5.mp3 | Victory 1 | 제5장 |
| boss.mp3 | Battle Theme A (cynicmusic) | 보스전 |
| ending.mp3 | Gone Fishin' (memoraphile) | 원정 완료 |
