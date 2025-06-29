#!/bin/bash

# Solrコア作成
docker exec todo-solr solr create_core -c todoapp

# スキーマ定義
curl -X POST http://localhost:8983/solr/todoapp/schema -H 'Content-type:application/json' --data-binary '{
  "add-field": [
    {"name":"id", "type":"string", "stored":true, "required":true},
    {"name":"type", "type":"string", "stored":true},
    {"name":"title", "type":"text_ja", "stored":true},
    {"name":"description", "type":"text_ja", "stored":true}
  ]
}' 