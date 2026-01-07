# DBeaverでSQLiteデータベースを開く手順

## 1. DBeaverのインストール

### macOSの場合
```bash
# Homebrewでインストール
brew install --cask dbeaver-community

# または、公式サイトからダウンロード
# https://dbeaver.io/download/
```

## 2. DBeaverでSQLiteデータベースに接続する方法

### 方法A: 既存のデータベースファイルを開く

1. DBeaverを起動
2. メニューバーから「データベース」→「新しいデータベース接続」を選択
3. データベースタイプで「SQLite」を選択
4. 「パス」欄に以下のパスを入力または参照ボタンで選択：
   ```
   /Users/matsuokataiki/Desktop/job/Programing/★Udemy★/Django/003_Django_reserve_app/user/login_view/db.sqlite3
   ```
5. 「テスト接続」をクリックして接続を確認
6. 「完了」をクリック

### 方法B: 新しいディレクトリで管理する場合

新しいディレクトリにデータベースファイルをコピーして管理することもできます。

## 3. コードの修正について

**コードの修正は不要です。** DBeaverは既存のSQLiteデータベースファイルを直接開くことができます。

ただし、新しいディレクトリで管理する場合は、Djangoの設定ファイル（settings.py）のデータベースパスを変更する必要があります。

## 4. 注意事項

- DBeaverでデータベースを開いている間は、Djangoアプリケーションから同時にアクセスできます
- ただし、データの整合性を保つため、本番環境では同時アクセスに注意が必要です
- 開発環境では問題ありません

