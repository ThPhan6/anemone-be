import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1742548864039 implements MigrationInterface {
  name = 'Migration1742548864039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying, "preferred_username" character varying, "picture" character varying, "phone_number" character varying, "email" character varying, "is_public" boolean NOT NULL DEFAULT false, "follower_access" boolean NOT NULL DEFAULT false, "locale" character varying, "zone_info" character varying, "user_id" uuid, CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cog_id" character varying(64) NOT NULL, "email" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'MEMBER', "is_active" boolean NOT NULL, "password" character varying NOT NULL, "third_party_accounts" json, CONSTRAINT "UQ_374577911594766e6ba18a14670" UNIQUE ("cog_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "scent_play_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "played_at" TIMESTAMP, "duration" numeric, "viewed_at" TIMESTAMP, "scent_id" uuid, "user_id" uuid, CONSTRAINT "PK_107b1cb01e9b8f9c3f62d5c237b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "scents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "image" character varying NOT NULL, "intensity" numeric NOT NULL, "cartridge_info" json NOT NULL, "tags" json NOT NULL, "description" text NOT NULL, "created_by" uuid, CONSTRAINT "PK_36c18e90895cfefac26356e7ca9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "playlist_scents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "sequence" numeric NOT NULL, "playlist_id" uuid, "scent_id" uuid, CONSTRAINT "PK_4d7594da4af156ed8e7d0906162" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "playlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "image" character varying NOT NULL, "created_by" uuid, CONSTRAINT "PK_a4597f4189a75d20507f3f7ef0d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "album_playlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "album_id" uuid, "playlist_id" uuid, "created_by" uuid, CONSTRAINT "PK_c2fbe474aa0af25395823ddd692" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "albums" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "image" character varying NOT NULL, "created_by" uuid, CONSTRAINT "PK_838ebae24d2e12082670ffc95d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "family_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "role" smallint NOT NULL, "user_id" uuid, "family_id" uuid, CONSTRAINT "PK_186da7c7fcbf23775fdd888a747" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "spaces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "family_id" uuid, "created_by" uuid, CONSTRAINT "PK_dbe542974aca57afcb60709d4c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "families" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL DEFAULT 'My Home', CONSTRAINT "PK_70414ac0c8f45664cf71324b9bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_cartridges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "eot" bigint NOT NULL, "ert" bigint NOT NULL, "serial_number" character varying NOT NULL, "percentage" numeric NOT NULL, "position" numeric NOT NULL, "productId" uuid, "device_id" uuid, CONSTRAINT "PK_c88bc614409d66ebd5912256a40" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_certificates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "certificate_id" character varying NOT NULL, "certificate_arn" character varying NOT NULL, "certificate_s3_key" character varying, "private_key_s3_key" character varying, "status" "public"."device_certificates_status_enum" NOT NULL DEFAULT 'PENDING', "activated_at" TIMESTAMP, "expires_at" TIMESTAMP, "revoked_at" TIMESTAMP, "device_id" uuid, CONSTRAINT "UQ_d56dfa4369f09906898b78323f4" UNIQUE ("certificate_id"), CONSTRAINT "PK_d45961aa6f530d790294a69ff7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "device_id" character varying NOT NULL, "thing_name" character varying, "provisioning_status" "public"."devices_provisioning_status_enum" NOT NULL DEFAULT 'PENDING', "firmware_version" character varying, "is_connected" boolean NOT NULL DEFAULT false, "last_ping_at" TIMESTAMP, "warranty_expiration_date" TIMESTAMP, "serial_number" character varying, "registered_by" uuid, "space_id" uuid, "family_id" uuid, CONSTRAINT "UQ_2667f40edb344d6f274a0d42b6f" UNIQUE ("device_id"), CONSTRAINT "REL_cc9e89897e336172fd06367735" UNIQUE ("serial_number"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "manufacturer_id" character varying NOT NULL, "sku" character varying NOT NULL, "batch_id" character varying NOT NULL, "serial_number" character varying NOT NULL, "name" character varying NOT NULL, "type" smallint NOT NULL, "config_template" json, "supported_features" json, "category_id" uuid, CONSTRAINT "UQ_d95100c677e0db71a45424229b7" UNIQUE ("serial_number"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "system_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "category_id" uuid, CONSTRAINT "PK_82521f08790d248b2a80cc85d40" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" smallint NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" smallint NOT NULL, "device_id" uuid, "album_id" uuid, "playlist_id" uuid, "scent_id" uuid, "user_id" uuid, CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "schedule_timer" json, "system" json, "device" json, "network" json, "system_update" json, "wifi_enabled" boolean NOT NULL DEFAULT false, "wifi_connections" json, "personalise" boolean NOT NULL DEFAULT false, "user_id" uuid, CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity_id" uuid NOT NULL, "entity" character varying(64) NOT NULL, "action" character varying NOT NULL, "old_data" json NOT NULL, "new_data" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_commands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "command" character varying NOT NULL, "device_id" uuid, CONSTRAINT "PK_08a3f976a83bbf1754fbf4088c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scent_play_histories" ADD CONSTRAINT "FK_e6ef303720166276cc04ef0d735" FOREIGN KEY ("scent_id") REFERENCES "scents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scent_play_histories" ADD CONSTRAINT "FK_00987e4bc56bc08c4697f8fbfec" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scents" ADD CONSTRAINT "FK_5d0259ffed26851c3b6ab88f112" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist_scents" ADD CONSTRAINT "FK_68692bdad09b141b498a46b61ba" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist_scents" ADD CONSTRAINT "FK_0d78fc4e632a082df7632578df3" FOREIGN KEY ("scent_id") REFERENCES "scents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlists" ADD CONSTRAINT "FK_1d1296406d8476d86378cbae628" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" ADD CONSTRAINT "FK_037b612b2aad7fc5ebddde06366" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" ADD CONSTRAINT "FK_914df36d69feb95d5653e103bd0" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" ADD CONSTRAINT "FK_cbee27cd8f54f82e3d24dfb8688" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "albums" ADD CONSTRAINT "FK_295ee1f3412e65c9f79cfeb057c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_members" ADD CONSTRAINT "FK_081fe336d41be74c68b81e8b6d7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_members" ADD CONSTRAINT "FK_0bb82eed69c26581e0884653814" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" ADD CONSTRAINT "FK_fc662bb007540868f962fb1d13e" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" ADD CONSTRAINT "FK_22ed477bc1c14729dfb54eda87c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_cartridges" ADD CONSTRAINT "FK_f1763f673205c79f19b6d566885" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_74aa3ddb293da656ffc3f4673b5" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_36cb851c442dd37afe20e780d0c" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_4e530ae3b8d4bec96b3513fc53c" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_settings" ADD CONSTRAINT "FK_109c4abf94f7b792726ffc37fb4" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_d54f841fa5478e4734590d44036" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_d54f841fa5478e4734590d44036"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_e9658e959c490b0a634dfc54783"`,
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
      `ALTER TABLE "system_settings" DROP CONSTRAINT "FK_109c4abf94f7b792726ffc37fb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_4e530ae3b8d4bec96b3513fc53c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_36cb851c442dd37afe20e780d0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_74aa3ddb293da656ffc3f4673b5"`,
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
      `ALTER TABLE "device_cartridges" DROP CONSTRAINT "FK_f1763f673205c79f19b6d566885"`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" DROP CONSTRAINT "FK_22ed477bc1c14729dfb54eda87c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" DROP CONSTRAINT "FK_fc662bb007540868f962fb1d13e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_members" DROP CONSTRAINT "FK_0bb82eed69c26581e0884653814"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_members" DROP CONSTRAINT "FK_081fe336d41be74c68b81e8b6d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "albums" DROP CONSTRAINT "FK_295ee1f3412e65c9f79cfeb057c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" DROP CONSTRAINT "FK_cbee27cd8f54f82e3d24dfb8688"`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" DROP CONSTRAINT "FK_914df36d69feb95d5653e103bd0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "album_playlists" DROP CONSTRAINT "FK_037b612b2aad7fc5ebddde06366"`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlists" DROP CONSTRAINT "FK_1d1296406d8476d86378cbae628"`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist_scents" DROP CONSTRAINT "FK_0d78fc4e632a082df7632578df3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "playlist_scents" DROP CONSTRAINT "FK_68692bdad09b141b498a46b61ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scents" DROP CONSTRAINT "FK_5d0259ffed26851c3b6ab88f112"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scent_play_histories" DROP CONSTRAINT "FK_00987e4bc56bc08c4697f8fbfec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scent_play_histories" DROP CONSTRAINT "FK_e6ef303720166276cc04ef0d735"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`,
    );
    await queryRunner.query(`DROP TABLE "device_commands"`);
    await queryRunner.query(`DROP TABLE "activity_logs"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "system_settings"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TABLE "device_certificates"`);
    await queryRunner.query(`DROP TABLE "device_cartridges"`);
    await queryRunner.query(`DROP TABLE "families"`);
    await queryRunner.query(`DROP TABLE "spaces"`);
    await queryRunner.query(`DROP TABLE "family_members"`);
    await queryRunner.query(`DROP TABLE "albums"`);
    await queryRunner.query(`DROP TABLE "album_playlists"`);
    await queryRunner.query(`DROP TABLE "playlists"`);
    await queryRunner.query(`DROP TABLE "playlist_scents"`);
    await queryRunner.query(`DROP TABLE "scents"`);
    await queryRunner.query(`DROP TABLE "scent_play_histories"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
  }
}
