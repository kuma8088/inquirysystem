# トラブルシュート記事の書き方

問題解決を説明する記事の追加ガイドライン。

## トラブルシュート記事の特徴

| 要素 | 重視すべき点 |
|:---|:---|
| **検索性** | エラーメッセージで見つかる |
| **環境情報** | 再現条件が明確 |
| **原因** | なぜ起きたかの説明 |
| **解決策** | コピペで動く |

## 構成テンプレート

```markdown
# [エラーメッセージ/症状] の解決方法

## TL;DR

[1-2行で解決策を先に]

## 環境

| 項目 | バージョン |
|:---|:---|
| OS | macOS 14.x / Ubuntu 22.04 |
| [ツール] | X.Y.Z |

## 症状

```
[エラーメッセージ全文]
```

## 原因

[なぜこのエラーが発生するか 2-3文]

## 解決策

### 方法1: [推奨]

```bash
[コマンド]
```

### 方法2: [代替案]

[別の方法がある場合]

## 予防策

[今後同じ問題を避けるには]

## 参考

- [公式ドキュメント]
- [関連 Issue]
```

## SEO 最適化

### タイトルにエラーメッセージを含める

```
✅ 「Error: EACCES permission denied の解決方法」
✅ 「terraform plan で "Provider produced inconsistent result" が出た時の対処」
❌ 「Terraform のエラーを解決した話」
```

### 検索されやすい構成

```markdown
# [エラーメッセージ] の解決方法

<!-- ↓ ここに原文のエラーを残す（検索用）-->
```
Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
```

## 原因
...
```

## 原因説明のコツ

### ❌ 避けるべき

```markdown
このエラーは権限の問題です。
```

### ✅ 推奨

```markdown
npm がグローバルパッケージを `/usr/local/lib/node_modules` に
インストールしようとしていますが、このディレクトリは root 所有のため、
一般ユーザーには書き込み権限がありません。
```

## 解決策の書き方

### 1. 先に結論

```markdown
## 解決策

```bash
# これで解決
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### なぜこれで解決するか
ディレクトリの所有者を現在のユーザーに変更することで、
npm がファイルを書き込めるようになります。
```

### 2. 複数の方法がある場合

```markdown
## 解決策

### 方法1: 所有者を変更（推奨）

最もシンプルな解決策です。

```bash
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### 方法2: nvm を使う

Node.js のバージョン管理も兼ねる場合はこちら。

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### 方法3: npm の prefix を変更

システムディレクトリを触りたくない場合。

```bash
npm config set prefix ~/.npm-global
```
```

## よくある間違い

### ❌ ログを貼りすぎ

```markdown
以下のログが出ました:

[500行のスタックトレース]
```

### ✅ 要点のみ

```markdown
エラーの要点:

```
Error: EACCES: permission denied
    at Object.mkdirSync (node:fs:1349:3)
```

重要なのは `permission denied` と `mkdirSync` です。
ディレクトリ作成時に権限エラーが発生しています。
```

## 予防策セクション

読者が同じ問題を繰り返さないために:

```markdown
## 予防策

### 1. 環境構築時のチェック

新しい環境を作る際は、以下を確認:

```bash
# npm のグローバルディレクトリを確認
npm config get prefix

# 権限を確認
ls -la $(npm config get prefix)
```

### 2. 推奨設定

`.npmrc` に以下を追加:

```
prefix=~/.npm-global
```
```

## タグ・キーワード戦略

```
メインキーワード: [エラーメッセージの一部]
関連キーワード: [ツール名] エラー, [ツール名] 解決

例:
- EACCES permission denied npm
- npm インストール エラー
- npm グローバル 権限
```
