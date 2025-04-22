import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745297650115 implements MigrationInterface {
  name = 'Migration1745297650115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" DROP CONSTRAINT "FK_f1763f673205c79f19b6d566885"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "category_id" TO "scent_config_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" RENAME COLUMN "productId" TO "product_id"`,
    );
    await queryRunner.query(
      `CREATE TABLE "scent_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "background" character varying NOT NULL, "story" json NOT NULL, "tags" text, "notes" json, CONSTRAINT "PK_513234df13c8923ca77ddfe4551" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "setting_definitions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" character varying NOT NULL, "metadata" json, CONSTRAINT "PK_ad06bf962a23a22f93db12bbe21" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "setting_values" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "value" character varying NOT NULL, "metadata" json, "setting_definition_id" uuid, CONSTRAINT "PK_c21069a3e9521c651c52051b939" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_0669070d4efe22fff90ac549ac7" UNIQUE ("scent_config_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_0669070d4efe22fff90ac549ac7" FOREIGN KEY ("scent_config_id") REFERENCES "scent_configs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ADD CONSTRAINT "FK_d33137dd419eeb9f86288af221b" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "setting_values" ADD CONSTRAINT "FK_9f5bda3ff1b6d3a59ac097432c5" FOREIGN KEY ("setting_definition_id") REFERENCES "setting_definitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "setting_values" DROP CONSTRAINT "FK_9f5bda3ff1b6d3a59ac097432c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" DROP CONSTRAINT "FK_d33137dd419eeb9f86288af221b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_0669070d4efe22fff90ac549ac7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_0669070d4efe22fff90ac549ac7"`,
    );
    await queryRunner.query(`DROP TABLE "setting_values"`);
    await queryRunner.query(`DROP TABLE "setting_definitions"`);
    await queryRunner.query(`DROP TABLE "scent_configs"`);
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" RENAME COLUMN "product_id" TO "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "scent_config_id" TO "category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ADD CONSTRAINT "FK_f1763f673205c79f19b6d566885" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
