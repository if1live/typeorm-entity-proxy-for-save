import {
  Entity,
  PrimaryColumn,
  Column,
} from "typeorm";

@Entity()
export class UserEntity {
  @PrimaryColumn()
  key1: string;

  @PrimaryColumn()
  key2: string;

  @Column()
  data: string;
}
