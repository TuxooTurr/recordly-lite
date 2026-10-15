---
description: Запустить Recordly Lite (без записи экрана) и показать статус
allowed-tools: Bash, Read
---

Запусти Recordly Lite — сборку без записи экрана.

Шаги:
1. Перейди в `/Users/stefanzastylov/Documents/MyProject/Recordly_Lite`.
2. Если нет `node_modules` — выполни `npm install` (быстро: нативные хелперы записи вырезаны).
3. Запусти `npm run dev` в фоне, логи в `/tmp/recordly-lite.log`.
4. Дождись `Editor Window: did-finish-load` и сообщи, что окно открылось.

Важно:
- Приложение стартует **сразу в редакторе**, окна записи нет.
- Разрешения на экран, камеру и микрофон не запрашиваются — захват отключён на уровне main-процесса.
- Своя папка данных: `~/Library/Application Support/Recordly-Lite-dev` — с обычным Recordly не пересекается.
- Основной Recordly живёт в `../Recordly` и может работать параллельно.
