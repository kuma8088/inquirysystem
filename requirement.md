## InquiryTable(DynamoDB)

DynamoDB の InquiryTable のキーは id(String)。

## UploadInquiry(Lambda)

Lambda の UploadInquiry 関数が受け取るパラメータは以下の通り。
・reviewText: 問い合わせの内容
・userName: 問い合わせの投稿者名
・mailAddress: 投稿者のメールアドレス
パラメータが存在しない場合は、パラメータエラーとして扱う。
受け取った値を DynamoDB の InquiryTable に登録する。
id は uuid を取得して設定する。

## API gateway

- 問い合わせを受け取る API を作成
- Method
  POST
- Request
  - reviewText: 問い合わせの内容
  - userName: 問い合わせの投稿者名
  - mailAddress: 投稿者のメールアドレス
- Response
  - StatusCode: 200(正常), 400(Parameter Error), 500(Internal Error)
- 処理
  - API の処理として、UploadInquiry(Lambda)を実行する
