import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1734429288009 implements MigrationInterface {
  name = 'Migration1734429288009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "username" character varying, "avatar" character varying, "country" character varying, "user_id" uuid)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'STAFF', 'MEMBER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cog_id" character varying(64) NOT NULL, "email" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'MEMBER', "is_active" boolean NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "target_id" uuid NOT NULL, "target_type" character varying(64) NOT NULL, "action" character varying NOT NULL, "old_data" json NOT NULL, "new_data" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid)`,
    );
    await queryRunner.query(`CREATE TYPE "public"."settings_type_enum" AS ENUM('CATEGORY')`);
    await queryRunner.query(
      `CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "value" character varying NOT NULL, "type" "public"."settings_type_enum" NOT NULL)`,
    );
    await queryRunner.query(`CREATE TYPE "public"."devices_type_enum" AS ENUM('MOBILE', 'IOT')`);
    await queryRunner.query(
      `CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" "public"."devices_type_enum" NOT NULL, "category_id" uuid, "created_by" uuid)`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "device_id" uuid, "linking_id" uuid)`,
    );
    await queryRunner.query(
      `CREATE TABLE "scents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_scents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "device_id" uuid, "scent_id" uuid)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."usage_histories_usage_type_enum" AS ENUM('DEVICE', 'SCENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "usage_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "used_at" TIMESTAMP NOT NULL DEFAULT now(), "usage_type" "public"."usage_histories_usage_type_enum" NOT NULL, "usage_id" character varying(64) NOT NULL, "user_id" uuid)`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid, "device_id" uuid)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_devices"`);
    await queryRunner.query(`DROP TABLE "usage_histories"`);
    await queryRunner.query(`DROP TYPE "public"."usage_histories_usage_type_enum"`);
    await queryRunner.query(`DROP TABLE "device_scents"`);
    await queryRunner.query(`DROP TABLE "scents"`);
    await queryRunner.query(`DROP TABLE "device_links"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TYPE "public"."devices_type_enum"`);
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TYPE "public"."settings_type_enum"`);
    await queryRunner.query(`DROP TABLE "activity_logs"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
  }
}
