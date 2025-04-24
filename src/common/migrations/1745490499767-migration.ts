import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1745490499767 implements MigrationInterface {
  name = 'Migration1745490499767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'STAFF', 'MEMBER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cog_id" character varying(64) NOT NULL, "email" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'MEMBER', "third_party_accounts" json, "user_id" character varying NOT NULL, CONSTRAINT "UQ_374577911594766e6ba18a14670" UNIQUE ("cog_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" character varying NOT NULL, "schedule_timer" json, "system" json, "device" json, "network" json, "system_update" json, "wifi_enabled" boolean NOT NULL DEFAULT false, "wifi_connections" json, "personalise" boolean NOT NULL DEFAULT false, "is_public" boolean NOT NULL DEFAULT false, "follower_access" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "family_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" character varying NOT NULL, "role" smallint NOT NULL, "family_id" uuid, CONSTRAINT "PK_186da7c7fcbf23775fdd888a747" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "spaces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "created_by" character varying NOT NULL, "family_id" uuid, CONSTRAINT "PK_dbe542974aca57afcb60709d4c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "families" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL DEFAULT 'My Home', CONSTRAINT "PK_70414ac0c8f45664cf71324b9bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "scent_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "background" character varying NOT NULL, "story" json NOT NULL, "tags" text, "notes" json, "color" json, CONSTRAINT "PK_513234df13c8923ca77ddfe4551" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "image" character varying, "color" character varying, CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "manufacturer_id" character varying NOT NULL, "sku" character varying NOT NULL, "batch_id" character varying NOT NULL, "serial_number" character varying NOT NULL, "name" character varying NOT NULL, "type" smallint NOT NULL, "config_template" json, "supported_features" json, "scent_config_id" uuid, "product_variant_id" uuid, CONSTRAINT "UQ_d95100c677e0db71a45424229b7" UNIQUE ("serial_number"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_cartridges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "eot" bigint NOT NULL, "ert" bigint NOT NULL, "serial_number" character varying NOT NULL, "percentage" numeric NOT NULL, "position" numeric NOT NULL, "product_id" uuid, "device_id" uuid, CONSTRAINT "PK_c88bc614409d66ebd5912256a40" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."device_certificates_status_enum" AS ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'REVOKED', 'PENDING_TRANSFER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_certificates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "certificate_id" character varying NOT NULL, "certificate_arn" character varying NOT NULL, "certificate_s3_key" character varying NOT NULL, "private_key_s3_key" character varying NOT NULL, "status" "public"."device_certificates_status_enum" NOT NULL DEFAULT 'PENDING', "activated_at" TIMESTAMP, "expires_at" TIMESTAMP, "revoked_at" TIMESTAMP, "device_id" uuid, CONSTRAINT "UQ_d56dfa4369f09906898b78323f4" UNIQUE ("certificate_id"), CONSTRAINT "PK_d45961aa6f530d790294a69ff7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."devices_provisioning_status_enum" AS ENUM('PENDING', 'PROVISIONED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "thing_name" character varying, "provisioning_status" "public"."devices_provisioning_status_enum" NOT NULL DEFAULT 'PENDING', "firmware_version" character varying, "serial_number" character varying, "is_connected" boolean NOT NULL DEFAULT false, "last_ping_at" TIMESTAMP, "warranty_expiration_date" TIMESTAMP, "registered_by" character varying, "space_id" uuid, "family_id" uuid, CONSTRAINT "REL_cc9e89897e336172fd06367735" UNIQUE ("serial_number"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "scent_play_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "played_at" TIMESTAMP, "duration" numeric, "viewed_at" TIMESTAMP, "user_id" character varying NOT NULL, "scent_id" uuid, CONSTRAINT "PK_107b1cb01e9b8f9c3f62d5c237b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "scents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "image" character varying NOT NULL, "intensity" numeric NOT NULL, "cartridge_info" json NOT NULL, "tags" json NOT NULL, "description" text NOT NULL, "created_by" character varying NOT NULL, CONSTRAINT "PK_36c18e90895cfefac26356e7ca9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "playlist_scents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "sequence" numeric NOT NULL, "playlist_id" uuid, "scent_id" uuid, CONSTRAINT "PK_4d7594da4af156ed8e7d0906162" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "playlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "image" character varying NOT NULL, "created_by" character varying NOT NULL, CONSTRAINT "PK_a4597f4189a75d20507f3f7ef0d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "album_playlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" character varying NOT NULL, "album_id" uuid, "playlist_id" uuid, CONSTRAINT "PK_c2fbe474aa0af25395823ddd692" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "albums" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "image" character varying NOT NULL, "created_by" character varying NOT NULL, CONSTRAINT "PK_838ebae24d2e12082670ffc95d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" smallint NOT NULL, "user_id" character varying NOT NULL, "device_id" uuid, "album_id" uuid, "playlist_id" uuid, "scent_id" uuid, CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying, "given_name" character varying, "preferred_username" character varying, "picture" character varying, "phone_number" character varying, "email" character varying, "user_id" character varying NOT NULL, "is_public" boolean NOT NULL DEFAULT false, "follower_access" boolean NOT NULL DEFAULT false, "locale" character varying, "zone_info" character varying, CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "entity_id" uuid NOT NULL, "entity" character varying(64) NOT NULL, "action" character varying NOT NULL, "old_data" json NOT NULL, "new_data" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "setting_definitions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" character varying NOT NULL, "metadata" json, CONSTRAINT "PK_ad06bf962a23a22f93db12bbe21" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "setting_values" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "value" character varying NOT NULL, "metadata" json, "setting_definition_id" uuid, CONSTRAINT "PK_c21069a3e9521c651c52051b939" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_commands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "command" json NOT NULL, "is_executed" boolean NOT NULL DEFAULT false, "device_id" uuid, CONSTRAINT "PK_08a3f976a83bbf1754fbf4088c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_members" ADD CONSTRAINT "FK_0bb82eed69c26581e0884653814" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" ADD CONSTRAINT "FK_fc662bb007540868f962fb1d13e" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_0669070d4efe22fff90ac549ac7" FOREIGN KEY ("scent_config_id") REFERENCES "scent_configs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_cbac76cdb5654843e63bd6e6c76" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ADD CONSTRAINT "FK_d33137dd419eeb9f86288af221b" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ADD CONSTRAINT "FK_37ab757004d86f04853783cf489" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_certificates" ADD CONSTRAINT "FK_289f82e85198cc4758db4e0a0af" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_cc9e89897e336172fd06367735d" FOREIGN KEY ("serial_number") REFERENCES "products"("serial_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_36cb851c442dd37afe20e780d0c" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_4e530ae3b8d4bec96b3513fc53c" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scent_play_histories" ADD CONSTRAINT "FK_e6ef303720166276cc04ef0d735" FOREIGN KEY ("scent_id") REFERENCES "scents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist_scents" ADD CONSTRAINT "FK_68692bdad09b141b498a46b61ba" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist_scents" ADD CONSTRAINT "FK_0d78fc4e632a082df7632578df3" FOREIGN KEY ("scent_id") REFERENCES "scents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" ADD CONSTRAINT "FK_037b612b2aad7fc5ebddde06366" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" ADD CONSTRAINT "FK_914df36d69feb95d5653e103bd0" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_94ac98b31718fa59ce7b6201a58" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_01055ce42f84f4c7ebe87c77b2e" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_041add66f7dfe2f64f89f893e4d" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_4669f2be673d22615caa644d439" FOREIGN KEY ("scent_id") REFERENCES "scents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "setting_values" ADD CONSTRAINT "FK_9f5bda3ff1b6d3a59ac097432c5" FOREIGN KEY ("setting_definition_id") REFERENCES "setting_definitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_commands" ADD CONSTRAINT "FK_ec7250b29b943067213ca5677dd" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device_commands" DROP CONSTRAINT "FK_ec7250b29b943067213ca5677dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "setting_values" DROP CONSTRAINT "FK_9f5bda3ff1b6d3a59ac097432c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_4669f2be673d22615caa644d439"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_041add66f7dfe2f64f89f893e4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_01055ce42f84f4c7ebe87c77b2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_94ac98b31718fa59ce7b6201a58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" DROP CONSTRAINT "FK_914df36d69feb95d5653e103bd0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" DROP CONSTRAINT "FK_037b612b2aad7fc5ebddde06366"`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist_scents" DROP CONSTRAINT "FK_0d78fc4e632a082df7632578df3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist_scents" DROP CONSTRAINT "FK_68692bdad09b141b498a46b61ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scent_play_histories" DROP CONSTRAINT "FK_e6ef303720166276cc04ef0d735"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_4e530ae3b8d4bec96b3513fc53c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_36cb851c442dd37afe20e780d0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_cc9e89897e336172fd06367735d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_certificates" DROP CONSTRAINT "FK_289f82e85198cc4758db4e0a0af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" DROP CONSTRAINT "FK_37ab757004d86f04853783cf489"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" DROP CONSTRAINT "FK_d33137dd419eeb9f86288af221b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_cbac76cdb5654843e63bd6e6c76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_0669070d4efe22fff90ac549ac7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" DROP CONSTRAINT "FK_fc662bb007540868f962fb1d13e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_members" DROP CONSTRAINT "FK_0bb82eed69c26581e0884653814"`,
    );
    await queryRunner.query(`DROP TABLE "device_commands"`);
    await queryRunner.query(`DROP TABLE "setting_values"`);
    await queryRunner.query(`DROP TABLE "setting_definitions"`);
    await queryRunner.query(`DROP TABLE "activity_logs"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TABLE "albums"`);
    await queryRunner.query(`DROP TABLE "album_playlists"`);
    await queryRunner.query(`DROP TABLE "playlists"`);
    await queryRunner.query(`DROP TABLE "playlist_scents"`);
    await queryRunner.query(`DROP TABLE "scents"`);
    await queryRunner.query(`DROP TABLE "scent_play_histories"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TYPE "public"."devices_provisioning_status_enum"`);
    await queryRunner.query(`DROP TABLE "device_certificates"`);
    await queryRunner.query(`DROP TYPE "public"."device_certificates_status_enum"`);
    await queryRunner.query(`DROP TABLE "device_cartridges"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(`DROP TABLE "scent_configs"`);
    await queryRunner.query(`DROP TABLE "families"`);
    await queryRunner.query(`DROP TABLE "spaces"`);
    await queryRunner.query(`DROP TABLE "family_members"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
