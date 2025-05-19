import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747626702020 implements MigrationInterface {
  name = 'Migration1747626702020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "third_party_accounts"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_374577911594766e6ba18a14670"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cog_id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ADD "given_name" character varying NOT NULL`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('CONFIRMED', 'UNCONFIRMED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'UNCONFIRMED'`,
    );
    await queryRunner.query(`CREATE TYPE "public"."users_type_enum" AS ENUM('1', '2')`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "type" "public"."users_type_enum" NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "enabled" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone_number_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "is_admin" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "user_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "user_id" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_admin"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number_verified"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "enabled"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "given_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "cog_id" character varying(64) NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_374577911594766e6ba18a14670" UNIQUE ("cog_id")`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "third_party_accounts" json`);
  }
}
