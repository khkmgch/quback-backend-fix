//AuthServiceやAuthControllerで使用するデータ型を定義しておく

//レスポンスのメッセージの型
export interface Msg {
  message: string;
}
//csrfTokenの型
export interface Csrf {
  csrfToken: string;
}
//JwtのaccessTokenの型
export interface Jwt {
  accessToken: string;
}
