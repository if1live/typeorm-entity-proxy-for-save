import "reflect-metadata";
import {
  createConnection,
  Connection,
  EntityRepository,
} from "typeorm";
import { UserEntity } from "./entity/UserEntity";
import { MyRepository, EntityProxy } from "./MyRepository";

async function prepare(conn: Connection) {
  const e = new UserEntity();
  e.key1 = 'foo';
  e.key2 = 'bar';
  e.data = 'hello';
  await conn.manager.save(e);

  const repo = conn.manager.getRepository(UserEntity);
  return await repo.findOne({});
}

createConnection().then(async conn => {
  const user = await prepare(conn);

  console.log('# start save');
  await fn_save(conn, user);
  console.log('# finish save');

  console.log('# start update');
  await fn_update(conn, user);
  console.log('# finish update');

  console.log('# start custom');
  await fn_custom(conn, user);
  console.log('# finish custom');

}).catch(error => console.log(error));

async function fn_save(conn: Connection, user: UserEntity) {
  const repo = conn.manager.getRepository(UserEntity);
  user.data = 'save';
  await repo.save(user, { transaction: false });
}

async function fn_update(conn: Connection, user: UserEntity) {
  const repo = conn.manager.getRepository(UserEntity);
  await repo.update({
    key1: user.key1,
    key2: user.key2,
  }, {
    data: 'update',
  });
}

@EntityRepository(UserEntity)
class UserRepository extends MyRepository<UserEntity> { }

async function fn_custom(conn: Connection, ent: UserEntity) {
  const repo = conn.manager.getCustomRepository(UserRepository)
  const user = EntityProxy.create(ent);
  user.data = 'custom';
  await repo.customSave(user);
}
