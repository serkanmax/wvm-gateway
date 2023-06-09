-- insertOrIgnoreWallet
INSERT INTO wallets (address, public_modulus)
VALUES (@address, @public_modulus)
ON CONFLICT DO NOTHING

-- insertOrIgnoreTagName
INSERT INTO tag_names (hash, name)
VALUES (@hash, @name)
ON CONFLICT DO NOTHING

-- insertOrIgnoreTagValue
INSERT INTO tag_values (hash, value)
VALUES (@hash, @value)
ON CONFLICT DO NOTHING

-- upsertNewDataItemTag
INSERT INTO new_data_item_tags (
  tag_name_hash, tag_value_hash,
  root_transaction_id, data_item_id, data_item_tag_index,
  height, indexed_at
) VALUES (
  @tag_name_hash, @tag_value_hash,
  @root_transaction_id, @data_item_id, @data_item_tag_index,
  @height, @indexed_at
) ON CONFLICT DO UPDATE SET height = IFNULL(@height, height)

-- upsertBundleDataItem
INSERT INTO bundle_data_items (
  id,
  parent_id,
  parent_index,
  filter_id,
  root_transaction_id,
  first_indexed_at,
  last_indexed_at
) VALUES (
  @id,
  @parent_id,
  @parent_index,
  @filter_id,
  @root_transaction_id,
  @indexed_at,
  @indexed_at
) ON CONFLICT DO
UPDATE SET
  filter_id = IFNULL(@filter_id, filter_id),
  last_indexed_at = @indexed_at

-- upsertNewDataItem
INSERT INTO new_data_items (
  id, parent_id, root_transaction_id, height, signature, anchor,
  owner_address, target, data_offset, data_size, content_type,
  tag_count, indexed_at
) VALUES (
  @id, @parent_id, @root_transaction_id, @height, @signature, @anchor,
  @owner_address, @target, @data_offset, @data_size, @content_type,
  @tag_count, @indexed_at
) ON CONFLICT DO UPDATE SET height = IFNULL(@height, height)
