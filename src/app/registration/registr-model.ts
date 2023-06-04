export enum Gender {
  Man = "man",
  Woman = "woman",
  Undefined = "undefined",
}

export interface RegistrModel {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  date_of_birth: Date;
  gender: Gender;
}
