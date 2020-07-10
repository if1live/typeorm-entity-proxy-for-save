# typeorm entity proxy for save

use `repository.save(entity)` with 1 UPDATE query

## repository.save()

```ts
async function fn_save(conn: Connection, user: UserEntity) {
  const repo = conn.manager.getRepository(UserEntity);
  user.data = 'save';
  await repo.save(user);
}
```

query

```
query: SELECT "UserEntity"."key1" AS "UserEntity_key1", "UserEntity"."key2" AS "UserEntity_key2", "UserEntity"."data" AS "UserEntity_data" FROM "user_entity" "UserEntity" WHERE "UserEntity"."key1" = ? AND "UserEntity"."key2" = ? -- PARAMETERS: ["foo","bar"]
query: UPDATE "user_entity" SET "data" = ? WHERE "key1" = ? AND "key2" = ? -- PARAMETERS: ["save","foo","bar"]
```

* pros: simple
* cons: 1 SELECT + 1 UPDATE

## repository.update()

```ts
async function fn_update(conn: Connection, user: UserEntity) {
  const repo = conn.manager.getRepository(UserEntity);
  await repo.update({
    key1: user.key1,
    key2: user.key2,
  }, {
    data: 'update',
  });
}
```

query

```
query: UPDATE "user_entity" SET "data" = ? WHERE "key1" = ? AND "key2" = ? -- PARAMETERS: ["update","foo","bar"]
```

* pros: 1 UPDATE
* cons: complex

## entity proxy and custom repository

```ts
@EntityRepository(UserEntity)
class UserRepository extends MyRepository<UserEntity> { }

async function fn_custom(conn: Connection, ent: UserEntity) {
  const repo = conn.manager.getCustomRepository(UserRepository)
  const user = EntityProxy.create(ent);
  user.data = 'custom';
  await repo.customSave(user);
}
```

query

```
query: UPDATE "user_entity" SET "data" = ? WHERE "key1" = ? AND "key2" = ? -- PARAMETERS: ["custom","foo","bar"]
```

* 1 UPDATE and simple

## run sample
```sh
npm i
npm run start
```
