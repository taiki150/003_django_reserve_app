#!/bin/bash
# データベースファイルをコピーするスクリプト

SOURCE_DB="../user/login_view/db.sqlite3"
TARGET_DB="./db.sqlite3"

if [ -f "$SOURCE_DB" ]; then
    cp "$SOURCE_DB" "$TARGET_DB"
    echo "✅ データベースファイルをコピーしました: $TARGET_DB"
    ls -lh "$TARGET_DB"
else
    echo "❌ ソースファイルが見つかりません: $SOURCE_DB"
    exit 1
fi

