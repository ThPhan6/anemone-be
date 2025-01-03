import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1735873653670 implements MigrationInterface {
  name = 'Migration1735873653670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."settings_data_type_enum" AS ENUM('STRING', 'NUMBER', 'BOOLEAN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" ADD "data_type" "public"."settings_data_type_enum" NOT NULL DEFAULT 'STRING'`,
    );
    await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "settings" ADD "id" BIGSERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TYPE "public"."settings_type_enum" RENAME TO "settings_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."settings_type_enum" AS ENUM('CATEGORY', 'SETTING')`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" ALTER COLUMN "type" TYPE "public"."settings_type_enum" USING "type"::"text"::"public"."settings_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."settings_type_enum_old"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "devices" ADD "id" BIGSERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "category_id"`);
    await queryRunner.query(`ALTER TABLE "devices" ADD "category_id" bigint`);
    await queryRunner.query(`ALTER TABLE "scents" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "scents" ADD "id" BIGSERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "device_scents" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "device_scents" ADD "id" BIGSERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "device_scents" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "device_scents" ADD "device_id" bigint`);
    await queryRunner.query(`ALTER TABLE "device_scents" DROP COLUMN "scent_id"`);
    await queryRunner.query(`ALTER TABLE "device_scents" ADD "scent_id" bigint`);
    await queryRunner.query(`ALTER TABLE "device_links" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "device_links" ADD "id" BIGSERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "device_links" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "device_links" ADD "device_id" bigint`);
    await queryRunner.query(`ALTER TABLE "device_links" DROP COLUMN "linking_id"`);
    await queryRunner.query(`ALTER TABLE "device_links" ADD "linking_id" bigint`);
    await queryRunner.query(`ALTER TABLE "usage_histories" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "usage_histories" ADD "id" BIGSERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_devices" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user_devices" ADD "id" BIGSERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_devices" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "user_devices" ADD "device_id" bigint`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_devices" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "user_devices" ADD "device_id" uuid`);
    await queryRunner.query(`ALTER TABLE "user_devices" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "user_devices" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "usage_histories" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "usage_histories" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "device_links" DROP COLUMN "linking_id"`);
    await queryRunner.query(`ALTER TABLE "device_links" ADD "linking_id" uuid`);
    await queryRunner.query(`ALTER TABLE "device_links" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "device_links" ADD "device_id" uuid`);
    await queryRunner.query(`ALTER TABLE "device_links" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "device_links" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "device_scents" DROP COLUMN "scent_id"`);
    await queryRunner.query(`ALTER TABLE "device_scents" ADD "scent_id" uuid`);
    await queryRunner.query(`ALTER TABLE "device_scents" DROP COLUMN "device_id"`);
    await queryRunner.query(`ALTER TABLE "device_scents" ADD "device_id" uuid`);
    await queryRunner.query(`ALTER TABLE "device_scents" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "device_scents" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "scents" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "scents" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "category_id"`);
    await queryRunner.query(`ALTER TABLE "devices" ADD "category_id" uuid`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`CREATE TYPE "public"."settings_type_enum_old" AS ENUM('CATEGORY')`);
    await queryRunner.query(
      `ALTER TABLE "settings" ALTER COLUMN "type" TYPE "public"."settings_type_enum_old" USING "type"::"text"::"public"."settings_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."settings_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."settings_type_enum_old" RENAME TO "settings_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "settings" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "data_type"`);
    await queryRunner.query(`DROP TYPE "public"."settings_data_type_enum"`);
  }
}
