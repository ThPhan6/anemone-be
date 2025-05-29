import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1748502433722 implements MigrationInterface {
  name = 'Migration1748502433722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "countries" ("id" integer NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "chore" jsonb, CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_gender_enum" AS ENUM('Male', 'Female', 'Others')`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "gender" "public"."users_gender_enum"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "year_of_birth" numeric`);
    await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "country_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_ae78dc6cb10aa14cfef96b2dd90" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_ae78dc6cb10aa14cfef96b2dd90"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "year_of_birth"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    await queryRunner.query(`DROP TABLE "countries"`);
  }
}
