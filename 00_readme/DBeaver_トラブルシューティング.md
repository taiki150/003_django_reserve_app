# DBeaver トラブルシューティング

## 問題: 登録したデータが表示されない

### 原因
DBeaverが間違ったデータベースファイル（空のファイルや古いファイル）を参照している可能性があります。

## 解決方法

### 1. DBeaverの接続設定を確認・修正

1. DBeaverを開く
2. 左側の「データベースナビゲーター」で、現在のSQLite接続を右クリック
3. 「接続の編集」を選択
4. 「パス」欄を確認し、以下の**正しいパス**に変更：

   **本番データベース（最新データあり）:**
   ```
   /Users/matsuokataiki/Desktop/job/Programing/★Udemy★/Django/003_Django_reserve_app/user/login_view/db.sqlite3
   ```

   **または、バックアップディレクトリ（最新データあり）:**
   ```
   /Users/matsuokataiki/Desktop/job/Programing/★Udemy★/Django/003_Django_reserve_app/database_backup/db.sqlite3
   ```

5. 「テスト接続」をクリック
6. 「保存」をクリック
7. 接続を右クリック → 「接続の切断」→ 再度「接続」をクリック

### 2. デスクトップに生成されたdbファイルについて

もしデスクトップに `db` というファイルが生成されている場合：

**このファイルは削除してください。** これは空のデータベースファイルの可能性があります。

```bash
# デスクトップのdbファイルを確認
ls -lh ~/Desktop/db*

# もし空のファイルであれば削除
# rm ~/Desktop/db
```

### 3. データベースの内容を確認

ターミナルで以下のコマンドを実行して、データが存在するか確認：

```bash
cd "/Users/matsuokataiki/Desktop/job/Programing/★Udemy★/Django/003_Django_reserve_app/user/login_view"
sqlite3 db.sqlite3 "SELECT COUNT(*) FROM reserve_reservation;"
sqlite3 db.sqlite3 "SELECT * FROM reserve_reservation LIMIT 5;"
```

### 4. データベースファイルの場所

**正しいデータベースファイルの場所:**
- 本番: `user/login_view/db.sqlite3` （Djangoアプリが使用）
- バックアップ: `database_backup/db.sqlite3` （DBeaver用コピー）

**DBeaverでは以下のいずれかを参照してください:**
1. `user/login_view/db.sqlite3` - 本番データベース（推奨）
2. `database_backup/db.sqlite3` - バックアップコピー

### 5. データベースの更新

`database_backup/db.sqlite3` を最新の状態に更新する場合：

```bash
cd "/Users/matsuokataiki/Desktop/job/Programing/★Udemy★/Django/003_Django_reserve_app/database_backup"
./copy_database.sh
```

その後、DBeaverで接続を再読み込みしてください。

## 確認方法

DBeaverで正しいデータが表示されているか確認：

1. 左側のナビゲーターで「reserve_reservation」テーブルを展開
2. テーブルを右クリック → 「データを表示」
3. 8件のデータが表示されることを確認

もし0件や古いデータしか表示されない場合は、接続パスが間違っています。

