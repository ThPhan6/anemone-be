import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1690260380817 implements MigrationInterface {
  name = 'Migrations1690260380817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "forgot_password" ("id" BIGSERIAL NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "expired_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9b1bedb8b9dd6834196533ee41b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_name" character varying(64) NOT NULL, "password" character varying(100) NOT NULL, "mail_address" character varying(128) NOT NULL, "login_name" character varying(64), "password_update_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT 'now()', "last_login_time" TIMESTAMP WITH TIME ZONE, "invalid_flg" boolean NOT NULL DEFAULT false, "note" character varying(400), "display_order" numeric(11,0), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" bigint, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" bigint, "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_by" bigint, CONSTRAINT "UQ_7ff0a7d283c58f1ba38aa6be9a4" UNIQUE ("mail_address"), CONSTRAINT "UQ_0dc1bdda5aff071cdbcf9565946" UNIQUE ("login_name"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sendgrid" ("id" BIGSERIAL NOT NULL, "sendgrid_id" character varying(256) NOT NULL, "mail_address" character varying(128) NOT NULL, "status" smallint, "mail_type" character varying(10), "display_order" numeric(11,0), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" bigint, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" bigint, "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_by" bigint, CONSTRAINT "PK_74f6b0de637954a8573eefe22ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" BIGSERIAL NOT NULL, "title" character varying NOT NULL, "type" integer NOT NULL, "key" character varying NOT NULL, "description" character varying NOT NULL, "group_id" bigint, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission_groups" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "parent_id" bigint, CONSTRAINT "PK_e6d3b6dc86109f8149c4d6c5400" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "policy" ("id" BIGSERIAL NOT NULL, "order" integer NOT NULL, "title" character varying NOT NULL, "type" integer NOT NULL, "key" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_9917b0c5e4286703cc656b1d39f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "policy_permission" ("id" BIGSERIAL NOT NULL, "policy_id" bigint, "permission_id" bigint, CONSTRAINT "PK_53899199bf52d7cf51b4f389879" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "security_group_policy" ("id" BIGSERIAL NOT NULL, "security_group_id" bigint, "policy_id" bigint, CONSTRAINT "PK_a679c7c369f2788103b15447834" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "security_groups" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "type" character varying NOT NULL, "is_default" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_cbb56a293f1124a728f62319cf4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission_security_group" ("id" BIGSERIAL NOT NULL, "security_group_id" bigint, "permission_id" bigint, CONSTRAINT "PK_403cb08939a03f9fbf5d60480f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "security_group_member" ("id" BIGSERIAL NOT NULL, "user_id" uuid, "added_by" uuid, "security_group_id" bigint, CONSTRAINT "PK_8d5c4a1cca3b2dc4ad95bceaa34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "sendgrid" DROP CONSTRAINT "PK_74f6b0de637954a8573eefe22ba"`);
    await queryRunner.query(`ALTER TABLE "sendgrid" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "sendgrid" ADD "id" character varying(256) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_f34a6308df22510d840dd3ce1fc" FOREIGN KEY ("group_id") REFERENCES "permission_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_groups" ADD CONSTRAINT "FK_ae480ec29551e1d102d71d3e3bd" FOREIGN KEY ("parent_id") REFERENCES "permission_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "policy_permission" ADD CONSTRAINT "FK_e13c0879919addee1c9451ab664" FOREIGN KEY ("policy_id") REFERENCES "policy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "policy_permission" ADD CONSTRAINT "FK_425f0e220d609fab00804512178" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_group_policy" ADD CONSTRAINT "FK_0d8b972d81ecc5a4bbd57cb81f9" FOREIGN KEY ("security_group_id") REFERENCES "security_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_group_policy" ADD CONSTRAINT "FK_463e969efa72f589db12f2c6561" FOREIGN KEY ("policy_id") REFERENCES "policy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_security_group" ADD CONSTRAINT "FK_2b42bd470df92cca728743a4148" FOREIGN KEY ("security_group_id") REFERENCES "security_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_security_group" ADD CONSTRAINT "FK_acdc78cc6f14dff229692ac19ce" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_group_member" ADD CONSTRAINT "FK_b5a83816b6129e9e301893b977a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_group_member" ADD CONSTRAINT "FK_48a648d292dd9efc10418993d44" FOREIGN KEY ("added_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_group_member" ADD CONSTRAINT "FK_5437dc0370a4c10683672f41efe" FOREIGN KEY ("security_group_id") REFERENCES "security_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "security_group_member" DROP CONSTRAINT "FK_5437dc0370a4c10683672f41efe"`);
    await queryRunner.query(`ALTER TABLE "security_group_member" DROP CONSTRAINT "FK_48a648d292dd9efc10418993d44"`);
    await queryRunner.query(`ALTER TABLE "security_group_member" DROP CONSTRAINT "FK_b5a83816b6129e9e301893b977a"`);
    await queryRunner.query(`ALTER TABLE "permission_security_group" DROP CONSTRAINT "FK_acdc78cc6f14dff229692ac19ce"`);
    await queryRunner.query(`ALTER TABLE "permission_security_group" DROP CONSTRAINT "FK_2b42bd470df92cca728743a4148"`);
    await queryRunner.query(`ALTER TABLE "security_group_policy" DROP CONSTRAINT "FK_463e969efa72f589db12f2c6561"`);
    await queryRunner.query(`ALTER TABLE "security_group_policy" DROP CONSTRAINT "FK_0d8b972d81ecc5a4bbd57cb81f9"`);
    await queryRunner.query(`ALTER TABLE "policy_permission" DROP CONSTRAINT "FK_425f0e220d609fab00804512178"`);
    await queryRunner.query(`ALTER TABLE "policy_permission" DROP CONSTRAINT "FK_e13c0879919addee1c9451ab664"`);
    await queryRunner.query(`ALTER TABLE "permission_groups" DROP CONSTRAINT "FK_ae480ec29551e1d102d71d3e3bd"`);
    await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_f34a6308df22510d840dd3ce1fc"`);
    await queryRunner.query(`ALTER TABLE "sendgrid" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "sendgrid" ADD "id" BIGSERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "sendgrid" ADD CONSTRAINT "PK_74f6b0de637954a8573eefe22ba" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`DROP TABLE "security_group_member"`);
    await queryRunner.query(`DROP TABLE "permission_security_group"`);
    await queryRunner.query(`DROP TABLE "security_groups"`);
    await queryRunner.query(`DROP TABLE "security_group_policy"`);
    await queryRunner.query(`DROP TABLE "policy_permission"`);
    await queryRunner.query(`DROP TABLE "policy"`);
    await queryRunner.query(`DROP TABLE "permission_groups"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "sendgrid"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "forgot_password"`);
  }
}
